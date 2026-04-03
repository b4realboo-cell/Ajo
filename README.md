# Ajo — Digital Thrift Platform

> *A private, multi-network digital thrift platform where users can create and belong to multiple independent savings communities — with strict privacy boundaries between networks.*

---

## Table of Contents

- [Overview](#overview)
- [Background & Concept](#background--concept)
- [Live Demo](#live-demo)
- [Features](#features)
- [Architecture & Privacy Model](#architecture--privacy-model)
- [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
- [Screens & Navigation](#screens--navigation)
- [Payment Methods](#payment-methods)
- [KYC & Verification](#kyc--verification)
- [API Connector](#api-connector)
- [Tech Stack](#tech-stack)
- [File Structure](#file-structure)
- [Getting Started](#getting-started)
- [Design System](#design-system)
- [Roadmap](#roadmap)
- [Security & Compliance](#security--compliance)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**Ajo** is a mobile-first fintech web application inspired by the traditional Yoruba *ajo* (rotating savings and credit association). It digitises the concept of communal thrift savings — allowing groups of trusted people to pool money together, rotate payouts, and hold each other accountable — while adding modern features like KYC verification, multiple payment methods, audit logging, dispute resolution, and a developer API.

The core design principle is **network isolation**: every savings community (called a *network*) is a fully private, self-governing environment. No platform owner, no global admin, and no other network can see or interfere with another network's data.

---

## Background & Concept

In many West African cultures, *ajo* (also known as *esusu*, *susu*, *tontine*, or *chit fund*) is an informal savings system where a group of people contribute a fixed amount at regular intervals, and each member takes turns receiving the full pot. It is built on deep community trust.

Ajo the platform modernises this:

- Trust is maintained through **KYC verification**, **audit logs**, and **transparent payout rotation**
- Participation is extended across **distance and diaspora** via digital payments
- Privacy is preserved — your family savings circle has no connection to your work colleagues' savings group
- Accountability is enforced through **payment reminders**, **dispute resolution**, and **admin controls**

---

## Live Demo

Open `ajo-app.html` in any modern mobile browser or use browser DevTools to emulate a mobile device (recommended width: 390–430px).

```
No server required — the prototype runs entirely in the browser.
```

---

## Features

### Multi-Network Membership
- Join or create multiple independent savings networks
- Switch between networks using the persistent network pill in the top bar
- Each network is fully isolated — members, groups, transactions, and chats are not shared

### Contribution Groups
- Create groups with **daily**, **weekly**, or **monthly** cycles
- Set contribution amounts, maximum members, and payout order (random, fixed, or bid-based)
- Real-time cycle tracking (e.g. Cycle 4/12) with visual progress bars
- Per-member payment status visible to admins

### Payout Scheduling & Rotation
- Automatic rotation schedule generated at group creation
- Current payout recipient clearly highlighted
- Completed payouts marked with confirmation
- Payout history preserved in the network audit log

### Wallet & Ledger
- Per-network wallet showing total pooled balance
- Transaction history with statuses: Completed, Pending, Failed
- Inbound and outbound amounts colour-coded (green / red)
- Reference tracking for manual bank transfers

### Payments
- Apple Pay, Stripe (card), Bank Transfer, and USSD supported
- Smart contextual instructions for bank and USSD methods
- Auto-generated payment references (e.g. `AJO-FC-202504-0423`)
- Admin confirmation flow for manual transfers

### Notifications & Reminders
- Due date reminders before contribution deadlines
- Payout confirmation alerts
- Member activity notifications (joined, missed payment)
- System announcements within each network

### Group Chat / Announcements
- Per-network group chat
- System-generated announcements (e.g. "1 member yet to pay. Cycle closes in 3 days.")
- Message history preserved within the network session

### Dispute Handling
- Raise disputes within a network (e.g. missed payment, timing issues)
- Dispute statuses: Open, Under Review, Resolved
- Reference evidence uploads (bank receipts, transfer proofs)
- Network admin resolves disputes — platform has no involvement

### Audit Logs
- Immutable, tamper-proof log of all actions within a network
- Every contribution, payout, membership change, and admin action is recorded
- Cryptographically signed entries
- Not accessible by platform infrastructure admins

### API Connector
- Full REST API scoped per network
- Publishable and secret API keys generated per network
- Webhook support for real-time event notifications
- See [API Connector](#api-connector) section for full details

---

## Architecture & Privacy Model

Ajo enforces **strict data isolation** between networks at every layer.

```
Platform Infrastructure (Ajo)
│
│  ── only manages: uptime, payment integrations, compliance flags
│  ── cannot access: member data, contributions, transactions, chats
│
├── Network A (e.g. Family Circle)
│     ├── Members (only visible within this network)
│     ├── Groups & Contribution Cycles
│     ├── Transaction Ledger
│     ├── Group Chat
│     ├── Dispute Records
│     └── Audit Log
│
├── Network B (e.g. Lagos Hustle Club)
│     └── ... (fully isolated from Network A)
│
└── Network C (e.g. Tech Savers)
      └── ... (fully isolated from Networks A and B)
```

**Key privacy guarantees:**
- A user can belong to multiple networks simultaneously but each context is isolated
- No network can query or observe another network's data
- Platform-level "Super Admin" does **not** exist — admin roles are scoped per-network only
- Audit logs are immutable and inaccessible to platform staff
- API keys are network-scoped and cannot be used to access other networks

---

## Role-Based Access Control (RBAC)

Roles are assigned **per network** and do not carry over globally.

| Role | Scope | Permissions |
|------|-------|-------------|
| **Network Owner** | Single network | Full control: assign admins, manage settings, dissolve network, initiate payouts |
| **Admin** | Single network | Manage members, groups, contributions, confirm bank transfers, resolve disputes |
| **Member** | Single network | Join groups, make payments, view own transactions, participate in chat |
| **Platform Infra** | Infrastructure only | Uptime, payment gateway config, compliance flags — **no data access** |

Roles are displayed clearly in the network list and on profile screens. A user can be an Owner in one network, an Admin in another, and a plain Member in a third.

---

## Screens & Navigation

The app has five primary screens accessible via the bottom navigation bar:

### 🏠 Home
- Network wallet balance and quick actions (Pay Dues, Withdraw, Transfer)
- Stats grid: monthly contribution, payout date, payment progress, days until cycle
- Active groups with progress bars and status badges
- Recent activity feed

### 🌐 Networks
- List of all networks the user belongs to
- Active network highlighted with gold border
- Role badge per network (Owner / Admin / Member)
- Create a new network or join via invite code
- Privacy notice reinforcing data isolation

### 👥 Groups
- Filter chips: All, Active, Pending, Completed, Monthly, Weekly
- Group cards with contribution amount, pot size, cycle progress
- Quick "Pay Now" shortcut per group
- Create Group modal with full configuration

### 💳 Payments
- Three tabs: Pay Dues, Transactions, Payouts
- Payment method selector with smart contextual info
- Transaction ledger with dates, references, and statuses
- Full payout rotation schedule with completion tracking

### 👤 Profile
- User identity with KYC verification status
- Trust score indicator
- Settings: Edit Profile, KYC & Verification, Linked Banks
- Security: Biometric login, 2FA, Audit Log
- Network Tools: Dispute Center, API Connector, Notifications
- Sign out

---

## Payment Methods

Ajo intelligently surfaces payment methods based on the user's region and device capabilities.

| Method | Provider | Details |
|--------|----------|---------|
| **Apple Pay** | Apple / Stripe | Instant, biometric auth, shown on iOS devices |
| **Card** | Stripe | Visa, Mastercard, full PCI compliance via Stripe |
| **Bank Transfer** | Manual / Bank API | Auto-generated reference code, admin confirmation flow |
| **USSD** | Telco / Bank | Works without internet, auto-generated dial code (e.g. `*737*000*25000#`) |

### Bank Transfer Flow
1. User selects Bank Transfer
2. App displays account name, number, and a unique reference (`AJO-FC-202504-0423`)
3. User makes the transfer via their bank app or USSD
4. Network admin confirms receipt (or auto-confirmed via bank webhook)
5. Transaction recorded and member status updated

### USSD Flow
1. User selects USSD
2. App displays the exact code to dial on any mobile phone
3. User dials the code — no internet required
4. Payment confirmed within 60 seconds via telco callback

---

## KYC & Verification

All users must complete identity verification before participating in any network. Verification status is **global to the user** (not per-network), but network data remains isolated.

**Verification layers:**

| Check | Method |
|-------|--------|
| Phone verification | SMS OTP |
| Email verification | Email link |
| BVN (Bank Verification Number) | NIBSS integration |
| NIN (National Identity Number) | NIMC integration |
| Face ID / Liveness check | Selfie + document match |

**Trust score** is calculated from the combination of completed checks and displayed on the profile screen. Networks can optionally require a minimum trust score for membership.

---

## API Connector

Ajo provides a fully scoped REST API so networks can integrate with external systems (accounting software, ERPs, HR platforms, etc.).

### Base URL
```
https://api.ajo.app/v1
```

### Authentication
All requests require a Bearer token using the network's secret API key:
```
Authorization: Bearer sk_live_YOUR_SECRET_KEY
```

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/networks/{id}/members` | List all members in a network |
| `GET` | `/networks/{id}/groups` | Fetch all contribution groups |
| `POST` | `/networks/{id}/contributions` | Record a contribution payment |
| `GET` | `/networks/{id}/transactions` | Get the full transaction ledger |
| `POST` | `/networks/{id}/payouts` | Trigger a payout to the next member |
| `DELETE` | `/networks/{id}/members/{uid}` | Remove a member from the network |
| `GET` | `/users/{id}/kyc` | Check a user's KYC/verification status |
| `POST` | `/networks/{id}/disputes` | Create or update a dispute record |

### API Keys
- Each network has its own **publishable key** (safe for client-side) and **secret key** (server-side only)
- Keys cannot be used to access data from any other network
- Keys can be regenerated at any time from the API Connector settings

### Webhooks

Register a URL to receive real-time POST events:

| Event | Trigger |
|-------|---------|
| `contribution.paid` | Member successfully pays their contribution |
| `payout.completed` | Payout disbursed to the next member |
| `member.joined` | A new member joins the network |
| `member.removed` | A member is removed from the network |
| `contribution.missed` | A member misses their payment deadline |
| `dispute.opened` | A new dispute is raised |
| `dispute.resolved` | A dispute is marked resolved |

---

## Tech Stack

This prototype is a **single-file HTML application** — no build tools, no frameworks, no dependencies except Google Fonts.

| Layer | Technology |
|-------|------------|
| Markup | HTML5 |
| Styling | CSS3 with custom properties (design tokens) |
| Logic | Vanilla JavaScript (ES6+) |
| Fonts | Fraunces (display) + DM Sans (body) via Google Fonts |
| Icons | Unicode emoji (zero dependency) |
| Payments (production) | Stripe JS, Apple Pay JS, USSD telco APIs |
| KYC (production) | Smile Identity / Smile ID, NIBSS, NIMC |

---

## File Structure

```
ajo/
├── ajo-app.html        # Complete single-file application
└── README.md           # This file
```

For a production build, the recommended structure would be:

```
ajo/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── TopBar.js
│   │   ├── BottomNav.js
│   │   ├── WalletCard.js
│   │   ├── GroupCard.js
│   │   ├── PaymentModal.js
│   │   ├── NetworkSwitcher.js
│   │   ├── ApiConnector.js
│   │   └── ...
│   ├── screens/
│   │   ├── Home.js
│   │   ├── Networks.js
│   │   ├── Groups.js
│   │   ├── Payments.js
│   │   └── Profile.js
│   ├── styles/
│   │   ├── tokens.css
│   │   ├── components.css
│   │   └── screens.css
│   ├── api/
│   │   ├── networks.js
│   │   ├── contributions.js
│   │   ├── payouts.js
│   │   └── kyc.js
│   └── utils/
│       ├── auth.js
│       ├── rbac.js
│       └── crypto.js
├── README.md
└── package.json
```

---

## Getting Started

### View the Prototype

1. Download `ajo-app.html`
2. Open it in any modern browser
3. For best experience, open DevTools → Toggle Device Toolbar → select iPhone 14 or similar

```bash
# Or serve locally
npx serve .
# Then open http://localhost:3000/ajo-app.html
```

### Navigating the Demo

| Action | How |
|--------|-----|
| Enter the app | Tap "Get Started" on the onboarding screen |
| Switch networks | Tap the network pill (top-left) |
| Pay dues | Home → "Pay Dues" button, or Groups → "Pay Now" |
| See payout rotation | Payments → Payouts tab |
| View audit log | Profile → Audit Log |
| Open API Connector | Profile → API Connector |
| Open group chat | Tap 💬 in the top bar |
| Raise a dispute | Profile → Dispute Center |
| Create a group | Groups → "+ Create Group" |
| Create a network | Networks → "+ Create New Network" |

---

## Design System

Ajo uses a warm, trust-driven palette inspired by natural materials — parchment, gold leaf, and forest green. The typography pairs **Fraunces** (a quirky optical-size serif for headlines and amounts) with **DM Sans** (clean humanist sans-serif for body text).

### Color Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--ink` | `#0e0e0e` | Primary text, dark backgrounds |
| `--paper` | `#f7f4ef` | App background |
| `--cream` | `#ede8df` | Secondary backgrounds, dividers |
| `--gold` | `#c8963e` | Primary accent, CTAs, network indicators |
| `--gold-light` | `#f0c97a` | Progress bars, highlights |
| `--green` | `#2d6a4f` | Success states, paid indicators |
| `--green-light` | `#52b788` | Live indicators, secondary green |
| `--red` | `#c0392b` | Error states, failed payments |
| `--blue` | `#1a56a0` | Info states, API badges |
| `--muted` | `#8a8278` | Secondary text, placeholders |

### Typography

| Role | Font | Weight | Size |
|------|------|--------|------|
| Display / Logo | Fraunces | 800 | 38–56px |
| Section titles | Fraunces | 600–700 | 18–26px |
| Monetary amounts | Fraunces | 600–800 | 15–38px |
| Body text | DM Sans | 400–500 | 14–15px |
| Labels / Meta | DM Sans | 500–600 | 11–13px |

### Component Patterns
- **Cards** — white background, 1.5px warm border, 16px radius, subtle shadow on interaction
- **Modals** — bottom sheet with handle, 24px top radius, slide-up animation
- **Chips / Pills** — 100px border-radius, compact padding, toggle between ink/paper
- **Buttons** — full-width primary (ink bg), secondary (bordered), 12px radius

---

## Roadmap

### Phase 1 — Core (Current Prototype)
- [x] Multi-network switching
- [x] Contribution group creation and management
- [x] Payout rotation scheduling
- [x] Payment method UI (Apple Pay, Stripe, Bank, USSD)
- [x] KYC verification status
- [x] Network-scoped wallet and ledger
- [x] Group chat
- [x] Audit log
- [x] Dispute center
- [x] API connector with keys, endpoints, and webhooks
- [x] RBAC (Owner / Admin / Member)

### Phase 2 — Backend Integration
- [ ] Node.js / Supabase backend with row-level security
- [ ] Real Stripe integration (cards + Apple Pay)
- [ ] Live USSD payment via Flutterwave or Paystack
- [ ] BVN / NIN verification via Smile Identity
- [ ] Push notifications (FCM)
- [ ] Real-time chat via Supabase Realtime or Socket.io

### Phase 3 — Advanced Features
- [ ] Bid-based payout ordering
- [ ] Emergency loan requests (peer lending within network)
- [ ] Interest-bearing savings pools
- [ ] Multi-currency support with FX rates
- [ ] Network analytics dashboard for admins
- [ ] Mobile app (React Native wrapper)
- [ ] Offline support via service workers

### Phase 4 — Ecosystem
- [ ] Network discovery (opt-in public listing)
- [ ] Verified network badges
- [ ] Cross-network credit scoring (privacy-preserving)
- [ ] Partner integrations (insurance, investments)

---

## Security & Compliance

| Area | Approach |
|------|----------|
| **Data isolation** | Row-level security per network in the database; API keys are network-scoped |
| **Authentication** | JWT with refresh tokens; biometric unlock (Web Authentication API) |
| **Encryption** | All data encrypted at rest (AES-256) and in transit (TLS 1.3) |
| **KYC / AML** | Third-party identity verification; transaction monitoring for suspicious patterns |
| **Audit trails** | Append-only log per network; cryptographically signed entries |
| **Payment security** | PCI-DSS compliant via Stripe; no raw card data stored |
| **Platform admin access** | Infrastructure-only; zero visibility into network financial or personal data |
| **GDPR / NDPR** | Right to deletion (member data); data portability export; consent management |

---

## Contributing

Contributions are welcome. Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes and test on mobile viewport
4. Commit with a clear message: `git commit -m "feat: add payout confirmation flow"`
5. Push and open a Pull Request

Please ensure any UI changes respect the existing design tokens and maintain the mobile-first approach (max-width 430px shell).

---

## License

MIT License — see `LICENSE` file for details.

---

*Ajo — Save together. Grow together. Trust each other.*
