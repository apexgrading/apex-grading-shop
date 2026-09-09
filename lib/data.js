import { createClient } from "@supabase/supabase-js";

// Hosted Postgres via Supabase — replaces the old local SQLite file, which
// didn't survive redeploys/cold starts on Vercel's serverless filesystem.
// All our tables live in the isolated `apex_shop` schema so they never
// collide with anything else in this Supabase project.
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  db: { schema: "apex_shop" },
  auth: { persistSession: false },
});

function throwIfError(error, context) {
  if (error) throw new Error(`${context}: ${error.message}`);
}

// ---------- row shape helpers (snake_case DB columns -> camelCase app objects) ----------

function cardRow(r) {
  if (!r) return null;
  return {
    id: r.id,
    title: r.title,
    category: r.category,
    grade: r.grade,
    cert: r.cert,
    price: r.price,
    imageUrl: r.image_url,
    pal: r.pal,
    tag: r.tag,
    sold: !!r.sold,
    createdAt: r.created_at,
  };
}

function userRow(r) {
  if (!r) return null;
  return {
    id: r.id,
    email: r.email,
    passwordHash: r.password_hash,
    salt: r.salt,
    subscribed: !!r.subscribed,
    createdAt: r.created_at,
  };
}

const PAGE_SIZE = 24;

// ---------- cards ----------

export async function listCards({ category, grade, sort = "newest", search = "", page = 1, includeSold = false, soldOnly = false } = {}) {
  let query = supabase.from("cards").select("*", { count: "exact" });

  if (soldOnly) query = query.eq("sold", true);
  else if (!includeSold) query = query.eq("sold", false);

  if (category && category !== "all") query = query.eq("category", category);

  if (grade === "10") query = query.eq("grade", 10);
  else if (grade === "9") query = query.gte("grade", 9);
  else if (grade === "7") query = query.gte("grade", 7);
  else if (grade === "below7") query = query.lt("grade", 7);

  if (search) query = query.or(`title.ilike.%${search}%,cert.ilike.%${search}%`);

  if (sort === "grade-desc") query = query.order("grade", { ascending: false }).order("id", { ascending: false });
  else if (sort === "price-asc") query = query.order("price", { ascending: true });
  else if (sort === "price-desc") query = query.order("price", { ascending: false });
  else query = query.order("created_at", { ascending: false }).order("id", { ascending: false });

  // Fetch count first with a lightweight head request isn't easily separable from
  // supabase-js's single round trip, so we page after computing bounds below.
  const { count: totalCount, error: countError } = await query.range(0, 0);
  throwIfError(countError, "listCards count");
  const total = totalCount || 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const from = (safePage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, error } = await query.range(from, to);
  throwIfError(error, "listCards");

  return { cards: (data || []).map(cardRow), total, page: safePage, pageSize: PAGE_SIZE, totalPages };
}

export async function getCardById(id) {
  const { data, error } = await supabase.from("cards").select("*").eq("id", id).maybeSingle();
  throwIfError(error, "getCardById");
  return cardRow(data);
}

export async function getAvailableCardsByIds(ids) {
  if (ids.length === 0) return [];
  const { data, error } = await supabase.from("cards").select("*").in("id", ids).eq("sold", false);
  throwIfError(error, "getAvailableCardsByIds");
  return (data || []).map(cardRow);
}

export async function createCard({ title, category, grade, cert, price, imageUrl }) {
  const { data, error } = await supabase
    .from("cards")
    .insert({ title, category, grade, cert, price, image_url: imageUrl || null })
    .select()
    .single();
  throwIfError(error, "createCard");
  return cardRow(data);
}

export async function certExists(cert) {
  const { data, error } = await supabase.from("cards").select("id").eq("cert", cert).maybeSingle();
  throwIfError(error, "certExists");
  return !!data;
}

// ---------- orders ----------

export async function createPendingOrder(stripeSessionIdPlaceholder, cards) {
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({ stripe_session_id: stripeSessionIdPlaceholder, status: "pending" })
    .select()
    .single();
  throwIfError(orderError, "createPendingOrder");

  const items = cards.map((card) => ({ order_id: order.id, card_id: card.id, price: card.price }));
  const { error: itemsError } = await supabase.from("order_items").insert(items);
  throwIfError(itemsError, "createPendingOrder items");

  return order.id;
}

export async function setOrderStripeSession(orderId, sessionId) {
  const { error } = await supabase.from("orders").update({ stripe_session_id: sessionId }).eq("id", orderId);
  throwIfError(error, "setOrderStripeSession");
}

export async function getOrderBySessionId(sessionId) {
  const { data: order, error } = await supabase
    .from("orders")
    .select("*")
    .eq("stripe_session_id", sessionId)
    .maybeSingle();
  throwIfError(error, "getOrderBySessionId");
  if (!order) return null;

  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("id, price, card_id, cards(id, title)")
    .eq("order_id", order.id);
  throwIfError(itemsError, "getOrderBySessionId items");

  return {
    id: order.id,
    stripeSessionId: order.stripe_session_id,
    email: order.email,
    status: order.status,
    createdAt: order.created_at,
    items: (items || []).map((i) => ({ id: i.id, price: i.price, card: { id: i.cards?.id ?? i.card_id, title: i.cards?.title } })),
  };
}

export async function markOrderPaid(orderId, email) {
  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select("status")
    .eq("id", orderId)
    .maybeSingle();
  throwIfError(fetchError, "markOrderPaid fetch");
  if (!order || order.status === "paid") return;

  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("card_id")
    .eq("order_id", orderId);
  throwIfError(itemsError, "markOrderPaid items");

  const { error: updateOrderError } = await supabase
    .from("orders")
    .update({ status: "paid", email: email || null })
    .eq("id", orderId);
  throwIfError(updateOrderError, "markOrderPaid update order");

  const cardIds = (items || []).map((i) => i.card_id);
  if (cardIds.length > 0) {
    const { error: soldError } = await supabase.from("cards").update({ sold: true }).in("id", cardIds);
    throwIfError(soldError, "markOrderPaid mark sold");
  }
}

// ---------- users & sessions ----------

export async function createUser({ email, passwordHash, salt, subscribed }) {
  const { data, error } = await supabase
    .from("users")
    .insert({ email: email.toLowerCase(), password_hash: passwordHash, salt, subscribed: !!subscribed })
    .select()
    .single();
  throwIfError(error, "createUser");
  return userRow(data);
}

export async function getUserByEmail(email) {
  const { data, error } = await supabase.from("users").select("*").eq("email", email.toLowerCase()).maybeSingle();
  throwIfError(error, "getUserByEmail");
  return userRow(data);
}

export async function getUserById(id) {
  const { data, error } = await supabase.from("users").select("*").eq("id", id).maybeSingle();
  throwIfError(error, "getUserById");
  return userRow(data);
}

export async function createSession(userId, token, expiresAt) {
  const { error } = await supabase.from("sessions").insert({ token, user_id: userId, expires_at: expiresAt });
  throwIfError(error, "createSession");
}

export async function getSession(token) {
  const { data, error } = await supabase
    .from("sessions")
    .select("user_id, expires_at")
    .eq("token", token)
    .maybeSingle();
  throwIfError(error, "getSession");
  if (!data || new Date(data.expires_at) <= new Date()) return null;
  return getUserById(data.user_id);
}

export async function deleteSession(token) {
  const { error } = await supabase.from("sessions").delete().eq("token", token);
  throwIfError(error, "deleteSession");
}

// ---------- newsletter ----------

export async function addSubscriber(email) {
  const { error } = await supabase.from("subscribers").insert({ email: email.toLowerCase() });
  if (!error) return true;
  if (error.code === "23505") return false; // unique violation -> already subscribed, not an error
  throw new Error(`addSubscriber: ${error.message}`);
}

export async function isSubscribed(email) {
  const { data, error } = await supabase.from("subscribers").select("id").eq("email", email.toLowerCase()).maybeSingle();
  throwIfError(error, "isSubscribed");
  return !!data;
}

// ---------- notifications (durable log of every email attempt) ----------

export async function logNotification({ email, type, subject, body, orderId, sent }) {
  const { error } = await supabase
    .from("notifications")
    .insert({ email, type, subject, body, order_id: orderId || null, sent: !!sent });
  throwIfError(error, "logNotification");
}

// ---------- admin sessions ----------

export async function createAdminSession(token, expiresAt) {
  const { error } = await supabase.from("admin_sessions").insert({ token, expires_at: expiresAt });
  throwIfError(error, "createAdminSession");
}

export async function isValidAdminSession(token) {
  if (!token) return false;
  const { data, error } = await supabase
    .from("admin_sessions")
    .select("expires_at")
    .eq("token", token)
    .maybeSingle();
  throwIfError(error, "isValidAdminSession");
  return !!data && new Date(data.expires_at) > new Date();
}
