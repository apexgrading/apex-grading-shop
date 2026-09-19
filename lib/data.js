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
    imageUrlBack: r.image_url_back,
    pal: r.pal,
    tag: r.tag,
    sold: !!r.sold,
    isGraded: r.is_graded !== false, // defaults true for legacy rows
    condition: r.condition,
    isPreorder: !!r.is_preorder,
    expectedDate: r.expected_date,
    quantity: r.quantity != null ? r.quantity : 1,
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

export async function listCards({ category, grade, sort = "newest", search = "", page = 1, includeSold = false, soldOnly = false, isGraded = null, isPreorder = null, sinceDays = null, excludeCategory = null } = {}) {
  // Builds a fresh query each time it's called — reusing a single query builder
  // instance across two separate awaited requests (count, then data) caused
  // unpredictable results once a category had enough rows to expose it.
  function buildQuery() {
    let q = supabase.from("cards").select("*", { count: "exact" });

    if (soldOnly) q = q.eq("sold", true);
    else if (!includeSold) q = q.eq("sold", false);

    if (isGraded !== null) q = q.eq("is_graded", isGraded);
    if (isPreorder !== null) q = q.eq("is_preorder", isPreorder);

    if (sinceDays !== null) {
      const cutoff = new Date(Date.now() - sinceDays * 24 * 60 * 60 * 1000).toISOString();
      q = q.gte("created_at", cutoff);
    }

    if (category && category !== "all") q = q.eq("category", category);
    else if (excludeCategory) q = q.neq("category", excludeCategory);

    if (grade === "10") q = q.eq("grade", 10);
    else if (grade === "9") q = q.gte("grade", 9);
    else if (grade === "7") q = q.gte("grade", 7);
    else if (grade === "below7") q = q.lt("grade", 7);

    if (search) q = q.or(`title.ilike.%${search}%,cert.ilike.%${search}%`);

    if (sort === "grade-desc") q = q.order("grade", { ascending: false }).order("id", { ascending: false });
    else if (sort === "price-asc") q = q.order("price", { ascending: true });
    else if (sort === "price-desc") q = q.order("price", { ascending: false });
    else q = q.order("created_at", { ascending: false }).order("id", { ascending: false });

    return q;
  }

  const { count: totalCount, error: countError } = await buildQuery().range(0, 0);
  throwIfError(countError, "listCards count");
  const total = totalCount || 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const from = (safePage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, error } = await buildQuery().range(from, to);
  throwIfError(error, "listCards");

  return { cards: (data || []).map(cardRow), total, page: safePage, pageSize: PAGE_SIZE, totalPages };
}

export async function getCardById(id) {
  const { data, error } = await supabase.from("cards").select("*").eq("id", id).maybeSingle();
  throwIfError(error, "getCardById");
  return cardRow(data);
}

export async function deleteCard(id) {
  // Remove any order_items referencing this card first (FK constraint), then the card itself.
  // The order record itself stays, so past orders remain traceable even after a listing is removed.
  const { error: itemsError } = await supabase.from("order_items").delete().eq("card_id", id);
  throwIfError(itemsError, "deleteCard order_items");
  const { error } = await supabase.from("cards").delete().eq("id", id);
  throwIfError(error, "deleteCard");
}

export async function getAvailableCardsByIds(ids) {
  if (ids.length === 0) return [];
  const { data, error } = await supabase.from("cards").select("*").in("id", ids).eq("sold", false);
  throwIfError(error, "getAvailableCardsByIds");
  return (data || []).map(cardRow);
}

// Validates a cart's requested quantities against real stock. `idCounts` is
// { [cardId]: requestedQty }. Returns { ok: true, cards } where each card has
// its requestedQty attached, or { ok: false, unavailableIds } naming which
// ids couldn't fully satisfy the request (sold out, deleted, or asked for
// more than remains in stock).
export async function getAvailableCardsWithQuantityCheck(idCounts) {
  const ids = Object.keys(idCounts).map((id) => parseInt(id, 10));
  if (ids.length === 0) return { ok: true, cards: [] };

  const { data, error } = await supabase.from("cards").select("*").in("id", ids).eq("sold", false);
  throwIfError(error, "getAvailableCardsWithQuantityCheck");

  const found = new Map((data || []).map((r) => [r.id, cardRow(r)]));
  const unavailableIds = [];
  const cards = [];

  for (const id of ids) {
    const requested = idCounts[id];
    const card = found.get(id);
    if (!card || card.quantity < requested) {
      unavailableIds.push(id);
      continue;
    }
    cards.push({ ...card, requestedQty: requested });
  }

  if (unavailableIds.length > 0) return { ok: false, unavailableIds };
  return { ok: true, cards };
}

export async function createCard({ title, category, grade, cert, price, imageUrl, imageUrlBack = null, isGraded = true, condition = null, isPreorder = false, expectedDate = null, quantity = 1 }) {
  const { data, error } = await supabase
    .from("cards")
    .insert({
      title,
      category,
      grade: isGraded ? grade : null,
      cert: isGraded ? cert : null,
      price,
      image_url: imageUrl || null,
      image_url_back: imageUrlBack || null,
      is_graded: isGraded,
      condition: isGraded ? null : condition,
      is_preorder: isPreorder,
      expected_date: isPreorder ? expectedDate : null,
      quantity,
    })
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

  // `cards` may carry a requestedQty (from getAvailableCardsWithQuantityCheck);
  // defaults to 1 for plain unique-item purchases.
  const items = cards.map((card) => ({
    order_id: order.id,
    card_id: card.id,
    price: card.price,
    quantity: card.requestedQty || 1,
  }));
  const { error: itemsError } = await supabase.from("order_items").insert(items);
  throwIfError(itemsError, "createPendingOrder items");

  return order.id;
}

export async function setOrderStripeSession(orderId, sessionId) {
  const { error } = await supabase.from("orders").update({ stripe_session_id: sessionId }).eq("id", orderId);
  throwIfError(error, "setOrderStripeSession");
}

function orderRow(order, items) {
  return {
    id: order.id,
    stripeSessionId: order.stripe_session_id,
    email: order.email,
    status: order.status,
    createdAt: order.created_at,
    shippingName: order.shipping_name,
    shippingAddress: order.shipping_address,
    shippingCost: order.shipping_cost,
    carrier: order.carrier,
    trackingNumber: order.tracking_number,
    shippedAt: order.shipped_at,
    items: (items || []).map((i) => ({ id: i.id, price: i.price, quantity: i.quantity || 1, card: { id: i.cards?.id ?? i.card_id, title: i.cards?.title } })),
  };
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
    .select("id, price, quantity, card_id, cards(id, title)")
    .eq("order_id", order.id);
  throwIfError(itemsError, "getOrderBySessionId items");

  return orderRow(order, items);
}

export async function getOrderById(orderId) {
  const { data: order, error } = await supabase.from("orders").select("*").eq("id", orderId).maybeSingle();
  throwIfError(error, "getOrderById");
  if (!order) return null;

  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("id, price, quantity, card_id, cards(id, title)")
    .eq("order_id", order.id);
  throwIfError(itemsError, "getOrderById items");

  return orderRow(order, items);
}

export async function listOrders({ status = null } = {}) {
  let query = supabase.from("orders").select("*").order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);
  const { data: orders, error } = await query;
  throwIfError(error, "listOrders");

  const results = [];
  for (const order of orders || []) {
    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select("id, price, quantity, card_id, cards(id, title)")
      .eq("order_id", order.id);
    throwIfError(itemsError, "listOrders items");
    results.push(orderRow(order, items));
  }
  return results;
}

export async function setOrderShippingDetails(orderId, { name, address, shippingCost }) {
  const { error } = await supabase
    .from("orders")
    .update({ shipping_name: name || null, shipping_address: address || null, shipping_cost: shippingCost ?? null })
    .eq("id", orderId);
  throwIfError(error, "setOrderShippingDetails");
}

export async function markOrderShipped(orderId, { carrier, trackingNumber }) {
  const { error } = await supabase
    .from("orders")
    .update({ carrier, tracking_number: trackingNumber, shipped_at: new Date().toISOString(), status: "shipped" })
    .eq("id", orderId);
  throwIfError(error, "markOrderShipped");
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
    .select("card_id, quantity")
    .eq("order_id", orderId);
  throwIfError(itemsError, "markOrderPaid items");

  const { error: updateOrderError } = await supabase
    .from("orders")
    .update({ status: "paid", email: email || null })
    .eq("id", orderId);
  throwIfError(updateOrderError, "markOrderPaid update order");

  // Decrement stock per item rather than blindly marking everything sold —
  // a card only becomes unavailable (sold=true) once its quantity hits 0,
  // so multi-unit stock items (sealed product, merch) correctly stay listed
  // with a lower count after a partial purchase.
  for (const item of items || []) {
    const purchasedQty = item.quantity || 1;
    const { data: cardRow, error: cardFetchError } = await supabase
      .from("cards")
      .select("quantity")
      .eq("id", item.card_id)
      .maybeSingle();
    throwIfError(cardFetchError, "markOrderPaid fetch card quantity");
    if (!cardRow) continue;

    const remaining = Math.max(0, (cardRow.quantity || 1) - purchasedQty);
    const { error: soldError } = await supabase
      .from("cards")
      .update({ quantity: remaining, sold: remaining <= 0 })
      .eq("id", item.card_id);
    throwIfError(soldError, "markOrderPaid update stock");
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

// ---------- Pokémon set checklist cache ----------
// Set checklists rarely change, and the external card database (pokemontcg.io)
// has an unauthenticated rate limit that made every page view unreliable.
// We cache each set's full checklist here on first successful fetch, so every
// later view — from anyone — comes straight from our own database instead.

export async function getCachedPokemonSet(setName) {
  const { data: meta, error: metaError } = await supabase
    .from("pokemon_set_meta")
    .select("*")
    .eq("set_name", setName)
    .maybeSingle();
  throwIfError(metaError, "getCachedPokemonSet meta");
  if (!meta) return null;

  const { data: cards, error: cardsError } = await supabase
    .from("pokemon_set_cards")
    .select("*")
    .eq("set_name", setName)
    .order("sort_order", { ascending: true });
  throwIfError(cardsError, "getCachedPokemonSet cards");

  return {
    name: meta.set_name,
    apiSetId: meta.api_set_id,
    logoUrl: meta.logo_url,
    releaseDate: meta.release_date,
    total: meta.total,
    standardLegal: meta.standard_legal,
    cards: (cards || []).map((c) => ({
      number: c.card_number,
      name: c.card_name,
      rarity: c.rarity,
      imageSmall: c.image_small,
    })),
  };
}

export async function cachePokemonSet(setName, meta, cards) {
  const { error: metaError } = await supabase.from("pokemon_set_meta").upsert({
    set_name: setName,
    api_set_id: meta.apiSetId,
    logo_url: meta.logoUrl,
    release_date: meta.releaseDate,
    total: meta.total,
    standard_legal: meta.standardLegal,
  });
  throwIfError(metaError, "cachePokemonSet meta");

  if (cards.length > 0) {
    const rows = cards.map((c, i) => ({
      set_name: setName,
      card_number: c.number,
      card_name: c.name,
      rarity: c.rarity,
      image_small: c.imageSmall,
      sort_order: i,
    }));
    const { error: cardsError } = await supabase.from("pokemon_set_cards").insert(rows);
    throwIfError(cardsError, "cachePokemonSet cards");
  }
}

// ---------- Notify-me requests (sold-out card / category interest) ----------

export async function createNotifyRequest({ email, category = null, cardTitle = null }) {
  const { error } = await supabase.from("notify_requests").insert({
    email,
    category,
    card_title: cardTitle,
  });
  throwIfError(error, "createNotifyRequest");
}

export async function listSubscribers() {
  const { data, error } = await supabase.from("subscribers").select("*").order("created_at", { ascending: false });
  throwIfError(error, "listSubscribers");
  return (data || []).map((s) => ({ id: s.id, email: s.email, createdAt: s.created_at }));
}

export async function deleteSubscriber(id) {
  const { error } = await supabase.from("subscribers").delete().eq("id", id);
  throwIfError(error, "deleteSubscriber");
}
