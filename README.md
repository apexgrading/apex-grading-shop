# Apex Grading Company — shop

A real, working storefront: database of graded cards, cart, and Stripe Checkout.
Built with Next.js (App Router) and Node's built-in SQLite — no external database
service or native module install required.

## What's in here

- **Catalog** — cards live in a SQLite file at `data/apex.db`. Each card is a single
  unique unit (no quantities) with a grade, cert number, price, category, and photo
  or placeholder art.
- **Shop page** (`/shop`) — filters by category and grade, sorts, searches, paginates
  against a live API (`/api/cards`). Built to handle a 200–500 card catalog.
- **Card detail page** (`/cards/[id]`) — full spec sheet + Add to cart.
- **Cart** (`/cart`) — client-side, persisted in the browser via localStorage.
- **Checkout** — `/api/checkout` re-validates every card and its price against the
  database (never trusts the browser), creates a Stripe Checkout Session, and
  redirects there. Apple Pay and Google Pay show automatically alongside card
  payment — see the Apple Pay section below.
- **Webhook** (`/api/webhook`) — on `checkout.session.completed`, marks the order
  paid, the cards sold, and sends the buyer an order confirmation email.
- **Accounts** — `/signup` and `/signin`, with a password show/hide (eye) toggle,
  cookie-based sessions (30 days), and passwords hashed with Node's built-in
  `scrypt` (no external auth service or extra dependency).
- **Newsletter** — a signup form in the footer (and the account checkbox on sign-up)
  posts to `/api/subscribe`, storing emails in a `subscribers` table and sending a
  welcome email.
- **Customer notifications** — every email (welcome, order confirmation) is durably
  logged in the `notifications` table via `lib/email.js`, whether or not real
  delivery is configured yet — so nothing is lost while you're setting up a
  provider.
- **Admin upload** (`/admin`) — password-gated (`ADMIN_PASSWORD` in `.env`) page to
  add a new graded card — title, category, grade, cert, price, and a photo — live
  on the site immediately, no redeploy needed.
- **Legal pages** — `/terms` and `/privacy`, drafted with the sections a card
  marketplace typically needs. **Have these reviewed by a lawyer before launch** —
  they're a starting point, not legal advice.
- **Main site link** — the nav and footer link out to
  `https://www.apexgradingcompany.com`; update that URL in `components/Nav.js` and
  `components/Footer.js` if it changes.

## Run it locally

```bash
npm install
npm run migrate   # creates the SQLite schema
npm run seed       # loads your 2 real graded cards + a sample catalog
npm run dev         # http://localhost:3000
```

Copy `.env.example` to `.env` and fill in:

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
ADMIN_PASSWORD=pick-something-only-your-team-knows
RESEND_API_KEY=            # optional, see "Email" below
EMAIL_FROM="Apex Grading <orders@apexgradingcompany.com>"
```

Get your test keys from the Stripe dashboard: https://dashboard.stripe.com/test/apikeys

To receive webhooks locally, install the Stripe CLI and run:

```bash
stripe listen --forward-to localhost:3000/api/webhook
```

That prints a `whsec_...` value — put that in `.env` as `STRIPE_WEBHOOK_SECRET`.

## Apple Pay

Checkout uses Stripe's `automatic_payment_methods`, so Apple Pay and Google Pay
appear on their own next to card payment — there's no separate integration code.
Two things to do on Stripe's side before it shows up for real customers:

1. **Verify your domain** — Stripe Dashboard → Settings → Payment methods → Apple
   Pay → Add a new domain. This is required by Apple, and only works over HTTPS on
   your real domain (not `localhost`).
2. Make sure Apple Pay / Google Pay are toggled on under Settings → Payment methods.

## Email

Every welcome and order-confirmation email is logged to the `notifications` table
regardless of whether real sending is configured — so you can see what *would* have
gone out from day one. To actually deliver them, sign up at https://resend.com,
put the API key in `RESEND_API_KEY`, and set `EMAIL_FROM` to a verified sender.
Swapping in a different provider (Postmark, SendGrid, etc.) only means editing the
one `fetch` call in `lib/email.js`.

## Accounts & admin

- Customer accounts are separate from the admin login — a customer signing up at
  `/signup` has no special access.
- `/admin` is gated by a single shared password (`ADMIN_PASSWORD`), which is fine
  for a small internal team. If more than one person needs upload access with
  individual logins, that's a natural next step (reusing the same `users` table
  with an `isAdmin` flag would be the quickest path there).

## Growing the catalog to 200–500 cards

Right now `db/seed.mjs` generates a 60-card sample (plus your two real photographed
cards) so the shop's filtering and pagination have something realistic to work
against. To load your real inventory:

1. Replace the generated loop in `db/seed.mjs` with real rows (from a CSV export,
   a spreadsheet, or wherever your grading records live), **or**
2. Build a small admin form/route that inserts a `cards` row per newly-graded card
   as it comes off the line (title, category, grade, cert, price, image path) —
   a natural next step once this is live.

Every card needs a unique `cert` value; everything else (filters, sort, search,
pagination, checkout, sold-tracking) already works against however many rows are
in the table.

## Deploying

This needs a **Node.js server runtime** (not a static host) because of the API
routes and the SQLite file. Vercel, Render, Railway, or Fly.io all work.

One thing to know about SQLite specifically: on platforms with an ephemeral or
read-only filesystem (like Vercel's default), the `data/apex.db` file won't persist
between deploys or across serverless instances. For a small catalog (a few hundred
cards) this is completely fine on a platform with a persistent disk (Render, Fly.io,
a VPS, or Vercel with a mounted volume). If you outgrow that, swapping the queries
in `lib/data.js` for a hosted Postgres database (e.g. via Vercel Postgres, Supabase,
or Neon) is a contained change — the rest of the app doesn't need to know.

Steps, once you've picked a host:

1. Push this repo to GitHub.
2. Connect it to your host, set the environment variables above (using your **live**
   Stripe keys once you're ready to take real payments).
3. Run `npm run migrate && npm run seed` once against the production database (or
   just `migrate` if you're loading real inventory yourself).
4. Add a **production** webhook endpoint in the Stripe dashboard pointing at
   `https://yourdomain.com/api/webhook`, and copy its signing secret into
   `STRIPE_WEBHOOK_SECRET` on your host.

## Notes on what's simplified for now

- **No inventory locking during checkout** — a card is only marked sold once Stripe
  confirms payment. Extremely unlikely to matter for one-of-a-kind items, but two
  people could theoretically start checkout on the same card at once; only one
  payment will succeed against the live cert data since it's re-validated at the
  point of sale — but you may want a short "reserved" hold if this becomes an issue
  at higher traffic.
- **Admin access is a single shared password**, not per-person logins (see
  "Accounts & admin" above).
- **Email sending needs a provider key** (see "Email" above) — without one,
  everything still works, but customers won't actually receive the emails, only
  Apex will have a record of them in the `notifications` table.
- **Legal pages are a starting draft** — get them reviewed before launch.
