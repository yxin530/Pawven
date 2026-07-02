# Design Document: Pawven App

## Overview

Pawven is a community-driven mobile application for animal welfare enthusiasts, focusing on community cat management, IoT-enabled feeding, local event coordination, and Trap-Neuter-Return (TNR) case tracking. The app connects caretakers with smart feeders, NGOs, veterinary clinics, and community events through a rich mobile experience with map-based discovery.

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Expo 52 + React Native |
| Language | TypeScript |
| Navigation | Expo Router (file-based) |
| Styling | StyleSheet (React Native) |
| State Management | Global state (`global.__pawven_*`) + Zustand stores |
| Authentication | Clerk (JWT) + Mock auth (dev mode) |
| Maps | react-native-maps (Apple Maps default provider) |
| Payments | Stripe Test Mode (stripe-node backend + client stub) |
| Camera/Media | expo-image-picker |
| Backend | Express (Node.js + TypeScript) |
| Database | Supabase (PostgreSQL) |
| Photo Storage | Supabase Storage (planned) |
| IoT Protocol | MQTT (mqtt.js) — hardware pending, mock data |
| Security | Clerk JWT verification + Supabase RLS (planned) |

### Key Design Decisions

1. **Expo Router file-based routing** — Routes defined by filesystem under `app/`, enabling automatic deep linking, type-safe navigation, and clean separation of auth/tab/detail flows via route groups `(auth)`, `(tabs)`.

2. **Clerk Auth + Mock mode** — Clerk provides JWT-based authentication. The `requireAuth` middleware on the backend verifies Bearer tokens. Current dev mode allows mock sign-up flow that skips verification for fast testing.

3. **Supabase (PostgreSQL) as database** — Relational schema with UUID primary keys, foreign key constraints, and all tables defined in `backend/src/db/schema.sql`. Accessed via `@supabase/supabase-js` client in the Express backend.

4. **MQTT for IoT communication** — Lightweight pub/sub protocol for feeder dispense commands. Backend would publish to feeder topic after confirmed payment. Hardware integration pending — currently uses mock dispense logic.

5. **react-native-maps for spatial discovery** — Native Apple Maps integration with custom markers, radar pulse animation for user location, swipeable sidebar, and bottom sheet interaction on marker tap.

6. **Stripe Test Mode for payments** — Backend creates mock PaymentIntents. Client-side stubs payment confirmation. Uses Stripe test card numbers (4242...) for development. Real charges are never processed.

7. **StyleSheet for styling** — All screens use React Native `StyleSheet.create()`. NativeWind/Tailwind is configured but not actively used for existing components.

8. **Global state for user session** — `(global as any).__pawven_name`, `__pawven_role`, `__pawven_avatar` etc. store user session data set during profile creation. Zustand stores exist for feeders, badges, TNR, cart, and follow state.

## Architecture

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Mobile Client (Expo 52)                    │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Screens │  │  Stores  │  │   Hooks  │  │   Lib    │   │
│  │ (app/)   │  │ (store/) │  │ (hooks/) │  │  (lib/)  │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
│       │              │              │              │          │
│       └──────────────┴──────────────┴──────────────┘          │
│                           │                                   │
│                    fetch() + Bearer JWT                        │
└───────────────────────────┼───────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Backend (Express + TypeScript)               │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐      │
│  │  Routes  │  │Middleware │  │     Config            │      │
│  │/api/*    │  │auth, error│  │ env, supabase client │      │
│  └────┬─────┘  └──────────┘  └──────────────────────┘      │
│       │                                                      │
└───────┼──────────────────────────────────────────────────────┘
        │
        ▼
┌───────────────────┐     ┌────────────────┐
│   Supabase        │     │   Stripe API   │
│   (PostgreSQL)    │     │   (Test Mode)  │
│                   │     │                │
│  - users          │     │  PaymentIntent │
│  - feeders        │     │  (mock/test)   │
│  - events         │     └────────────────┘
│  - rsvps          │
│  - organizations  │     ┌────────────────┐
│  - tnr_reports    │     │  MQTT Broker   │
│  - updates        │     │  (pending HW)  │
│  - badges         │     └────────────────┘
│  - transactions   │
│  - feeder_rentals │
└───────────────────┘
```

### Navigation Structure

```
app/
├── _layout.tsx              → Root Stack (headerless)
├── index.tsx                → Splash / Entry
├── onboarding.tsx           → Onboarding carousel
├── roleSelect.tsx           → Role selection (Standard/NGO/Vet)
├── createProfile.tsx        → Profile creation
├── (auth)/
│   ├── _layout.tsx          → Auth stack
│   ├── sign-up.tsx          → Sign up
│   ├── email_screen.tsx     → Email verification
│   └── phone_screen.tsx     → Phone verification
├── (tabs)/
│   ├── _layout.tsx          → Bottom tab bar
│   ├── home.tsx             → Home feed
│   ├── discover.tsx         → Discover + filters
│   ├── tnr.tsx              → TNR reporting
│   ├── normalProfile.tsx    → Standard user profile
│   ├── ngoProfile.tsx       → NGO/Vet profile
│   └── applySmartFeeder.tsx → Feeder application
├── discoverMapScreen.tsx    → Map view with sidebar
├── smartFeeder.tsx          → Smart feeder (live cam + dispense)
├── eventDetail.tsx          → Event details + RSVP
├── createEvent.tsx          → Create event form
├── orgProfile.tsx           → Organization profile
├── communityProfile.tsx     → Community profile
├── feederManagement.tsx     → Feeder management (owner)
├── badgesScreen.tsx         → All badges
├── listEvents.tsx           → All events list
├── listFeeders.tsx          → All feeders list
├── listNgos.tsx             → All NGOs list
├── listVets.tsx             → All vets list
├── listCommunities.tsx      → All communities list
└── notificationEvent_screen.tsx → Notifications
```

### Payment Flow (Stripe Test Mode)

```
User taps "Dispense Now" on Smart Feeder
         │
         ▼
┌─────────────────────┐
│ Select portion size │  (20g/$0.99, 50g/$2.59, 100g/$4.89)
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  Payment Sheet      │  (Apple Pay / TnG / PayPal / TrueMoney / Card)
│  Client-side stub   │
└─────────┬───────────┘
          │
          ▼ (simulated 900ms delay)
┌─────────────────────┐
│  Mock confirmation  │  Test card: 4242 4242 4242 4242 → success
│                     │  Test card: 4000 0000 0000 0002 → declined
└─────────┬───────────┘
          │
          ├─── Success → Confirmation modal (confetti + tqCat.png)
          │               └─→ Backend: POST /api/dispense (update kibble level)
          │
          └─── Failure → Error modal ("Payment failed, not charged")
```

**Note:** In production, the client would call `POST /api/pay/kibble` to get a real `clientSecret`, then use `@stripe/stripe-react-native` to confirm the payment. Currently both steps are stubbed client-side for testing.

## Backend API

### Routes

| Route File | Base Path | Endpoints |
|-----------|-----------|-----------|
| `feeders.ts` | `/api/feeders` | `GET /` (list), `POST /dispense` (dispense kibbles) |
| `events.ts` | `/api/events` | `GET /` (list), `POST /` (create), `POST /:id/rsvp`, `GET /:id/attendees`, `PATCH /:id/attendees/:rsvpId`, `POST /:id/updates` |
| `orgs.ts` | `/api/orgs` | `GET /` (list), `GET /:id` (detail) |
| `tnr.ts` | `/api` | `POST /report`, `GET /reports`, `PATCH /reports/:id`, `GET /reports/:id/updates`, `POST /reports/:id/updates` |
| `payments.ts` | `/api/pay` | `POST /kibble`, `POST /donate`, `POST /rental` |
| `badges.ts` | `/api/badges` | `GET /` (list user badges) |

### Middleware

- **`requireAuth`** — Verifies Clerk JWT from `Authorization: Bearer <token>` header. Extracts `userId` from JWT `sub` claim. Returns 401 if missing/invalid/expired.
- **`errorHandler`** — Global Express error handler. Logs error, returns `{ error: { statusCode, message } }`.

### Database Schema (Supabase PostgreSQL)

```sql
-- Core tables (from backend/src/db/schema.sql)
users           (id UUID PK, clerk_id, email, name, role, verified, profile_image_url)
feeders         (id UUID PK, name, lat, lng, address, status, kibble_level, last_dispensed, owner_id FK, mqtt_topic, stream_url)
events          (id UUID PK, title, description, cover_photo_url, lat, lng, address, start_time, end_time, host_user_id FK, rsvp_count, status, category)
rsvps           (id UUID PK, event_id FK, user_id FK)
organizations   (id UUID PK, name, type, logo_url, description, phone, email, website, hours, donate_url, lat, lng, address)
tnr_reports     (id UUID PK, stray_photo_url, lat, lng, address, notes, activity_type, reported_by FK, assigned_to FK, status)
updates         (id UUID PK, thread_type, thread_id, author_id FK, message)
badges          (id UUID PK, user_id FK, badge_id)
transactions    (id UUID PK, user_id FK, type, amount, currency, stripe_payment_intent_id, feeder_id FK, status)
feeder_rentals  (id UUID PK, user_id FK, feeder_id FK, stripe_subscription_id, status, start_date, end_date)
```

## Client State Management

| Store | File | Purpose |
|-------|------|---------|
| Auth (global) | `global.__pawven_*` | User session: name, role, avatar, bio |
| Follow | `store/follow-store.ts` | Track followed org/community IDs (in-memory Set) |
| Feeder | `store/feeder-store.ts` | Feeder list cache |
| Badge | `store/badge-store.ts` | User badges |
| Cart | `store/cart-store.ts` | Kibble cart items |
| TNR | `store/tnr-store.ts` | TNR reports + drafts |
| Auth | `store/auth-store.ts` | Auth session (Zustand) |

## Error Handling Strategy

| Error Type | Where | Current Status | Handling |
|-----------|-------|----------------|----------|
| Network timeout | Frontend fetch calls | ⚠️ Partial — uses try/catch, keeps mock data | Show fallback data, log error |
| 401 Unauthorized | Backend auth middleware | ✅ Implemented | Return 401 JSON |
| 404 Not Found | Backend routes (event, feeder) | ✅ Implemented | Return 404 JSON |
| 409 Conflict | RSVP duplicate | ✅ Implemented | Return 409 JSON |
| 403 Forbidden | Host-only actions | ✅ Implemented | Return 403 JSON |
| 400 Bad Request | Input validation | ✅ Implemented | Return 400 with field error |
| 500 Server Error | Unhandled exceptions | ✅ Global handler | Log + return generic error |
| Payment declined | Stripe test mode | ✅ Client-side stub | Show error modal |
| Form validation | TNR, events, sign-up | ⚠️ Basic (client-side only) | Inline error messages |
| Missing auth token | Frontend → Backend | ❌ Not implemented | Frontend needs to attach Bearer token |

## Security Considerations

1. **Auth tokens** — Backend validates JWT signature (currently simplified base64 decode; production should verify against Clerk JWKS).
2. **Input validation** — All POST/PATCH routes validate required fields and types.
3. **Authorization** — Host-only routes check `host_user_id` match before allowing mutations.
4. **No secrets in client** — Stripe secret key only on backend; client receives `clientSecret` for payment confirmation.
5. **CORS** — Enabled globally (production should restrict to app origin).

## Deployment

- **Backend:** Node.js Express server (currently local development on port 3000)
- **Database:** Supabase cloud PostgreSQL instance
- **Mobile:** Expo Go (development) → EAS Build (production iOS/Android)
- **Environment:** `.env` file with SUPABASE_URL, SUPABASE_ANON_KEY, CLERK_SECRET_KEY, STRIPE_SECRET_KEY
