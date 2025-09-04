# Library Donation

<p align="center">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-15-black?logo=nextdotjs&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white" />
  <img alt="MongoDB" src="https://img.shields.io/badge/MongoDB-6-47A248?logo=mongodb&logoColor=white" />
  <img alt="Razorpay" src="https://img.shields.io/badge/Razorpay-Checkout-0B78E3?logo=razorpay&logoColor=white" />
</p>

A Next.js app for Islamic Dawa Academy to collect and showcase donations funding student library book bundles.

## ✨ Features

- 🔐 Razorpay Checkout donation flow with server-side order + verification
- 🙌 Public donors list with visibility preferences
- 🛠️ Admin dashboard (demo client-side auth)
- 📊 Live impact stats on the homepage
- ♿ Accessible, responsive UI

## 🧰 Tech Stack

- Next.js App Router (React, TypeScript)
- MongoDB (via helper)
- Razorpay (Orders API + Checkout.js)
- Tailwind CSS

## ⚙️ Setup

1) Install dependencies

```bash
npm install
```
or 

```bash
npm install --legacy-peer-deps
```

2) Create `.env.local`

```bash
# Razorpay (test keys - replace with your own securely)
RAZORPAY_KEY_ID=your_razorpay_test_key_id
RAZORPAY_KEY_SECRET=your_razorpay_test_key_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_test_key_id

# Admin (demo credentials - never use in production)
NEXT_PUBLIC_ADMIN_EMAIL=your_admin_email@example.com
NEXT_PUBLIC_ADMIN_PASS=your_admin_password

# MongoDB
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/
MONGODB_DB=library-donations

```

3) Run

```bash
npm run dev
```

Open `http://localhost:3000`.

## 💳 Razorpay Flow

- Client requests order: `POST /api/razorpay/order`
- Client loads Checkout.js and opens with `NEXT_PUBLIC_RAZORPAY_KEY_ID` and `order_id`
- Success returns `razorpay_payment_id`, `razorpay_order_id`, `razorpay_signature`
- Client verifies via `POST /api/razorpay/verify`
- On success, donation is saved via `POST /api/donations`

Server endpoints:
- `POST /api/razorpay/order` (creates order via REST using Basic Auth)
- `POST /api/razorpay/verify` (HMAC SHA256 signature check)

Key files:
- `app/donate/page.tsx` — form + checkout + verify + save
- `app/api/razorpay/order/route.ts` — order creation
- `app/api/razorpay/verify/route.ts` — signature verification
- `app/api/donations/route.ts` — persistence and listing

## 📈 Impact Calculations

- Bundle price: ₹1100
- Total funds: sum of `donation.total`
- Bundles donated: `floor(totalFunds / 1100) - 1`
- Students helped: same as bundles (minus one)

Adjust in `app/page.tsx` as needed.

## 🔑 Admin (Demo)

- Login at `/admin` with `NEXT_PUBLIC_ADMIN_EMAIL` and `NEXT_PUBLIC_ADMIN_PASS`
- Client-side only (for demo). Use server auth for production.

## 📜 Scripts

```bash
npm run dev
npm run build
npm run start
```

## License

MIT