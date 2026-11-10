# 🎫 PulseDesk: Cross-Platform Enterprise Ticketing Management System

A full-stack, enterprise-grade ticketing management platform accessible via **Web (Next.js)** and **Mobile (React Native / Expo)**, sharing types, validation schemas, and REST API contracts in a monorepo.

---

## 🏛️ Monorepo Architecture

```
sgt/
├── packages/
│   └── shared/                 # @repo/shared (TypeScript types, Zod schemas, constants)
│       ├── src/auth.schemas.ts
│       ├── src/ticket.schemas.ts
│       ├── src/constants.ts
│       └── src/types.ts
├── apps/
│   ├── api/                    # Node.js + Fastify + Prisma ORM + JWT + SQLite / Postgres
│   │   ├── prisma/schema.prisma
│   │   ├── src/routes/auth.ts
│   │   ├── src/routes/tickets.ts
│   │   ├── src/routes/stats.ts
│   │   ├── src/middleware/auth.ts
│   │   └── src/seed.ts
│   ├── web/                    # Next.js 14 (App Router) + Tailwind CSS + TanStack Query
│   │   ├── src/app/login/
│   │   ├── src/app/register/
│   │   ├── src/app/dashboard/
│   │   │   ├── page.tsx        # Queue, Metrics, Filters, Create Ticket Dialog
│   │   │   └── tickets/[id]/   # Status Switcher, Assignee Selector, Comment Stream
│   │   └── src/lib/auth-context.tsx
│   └── mobile/                 # React Native (Expo) + Expo Router + Expo SecureStore
│       ├── app/(auth)/login.tsx
│       ├── app/(tabs)/index.tsx
│       ├── app/(tabs)/create.tsx
│       ├── app/(tabs)/profile.tsx
│       ├── app/ticket/[id].tsx
│       └── src/storage.ts      # Hardware SecureStore with fallback
├── pnpm-workspace.yaml
├── turbo.json
└── package.json
```

---

## 🔑 Authentication & Token Management

- **Short-Lived Access Tokens (JWT):** 15-minute expiry, contains payload `{ userId, email, role, name }`.
- **Rotating Refresh Tokens:** 7-day expiry, stored with revocation tracking in the database.
- **Web App (`apps/web`):** Refresh token securely stored in `HttpOnly`, `SameSite=Lax` cookies; access token managed in-memory with automatic silent refresh on `401 Unauthorized`.
- **Mobile App (`apps/mobile`):** Refresh token persisted via `expo-secure-store` (hardware-backed Android Keystore / iOS Keychain); bearer authorization attached on all API requests.

---

## 👥 Seeded Demo Accounts

You can test either app immediately using the one-click quick-fill buttons or manual login:

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Admin** | `admin@example.com` | `Password123!` | View all tickets, reassign agents, post staff notes, manage status |
| **Agent** | `agent@example.com` | `Password123!` | View all tickets, update ticket status & priority, add internal notes |
| **Customer** | `customer@example.com` | `Password123!` | Create tickets, view personal tickets, reply on public timeline |

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Generate Prisma & Seed Database
```bash
pnpm db:generate
pnpm db:push
pnpm db:seed
```

### 3. Run Applications

- **Backend API (Port 4000):**
  ```bash
  pnpm dev:api
  ```
- **Web App (Port 3000):**
  ```bash
  pnpm dev:web
  ```
- **Mobile App (Expo):**
  ```bash
  pnpm dev:mobile
  ```

### 4. Run Automated E2E Verification
```bash
node test-e2e.mjs
```

---

## 🧪 Verified Test Suite

All 12 automated integration tests verified:
1. Healthcheck endpoint
2. Customer login & JWT issuance
3. Authenticated `/auth/me` user profile retrieval
4. Ticket creation with category & priority
5. Customer public comment timeline submission
6. Agent login & role verification
7. Ticket status transition & agent assignment
8. Internal staff note creation
9. Role isolation check (staff notes hidden from customers)
10. Refresh token rotation & issuance of new token pair
11. Immediate revocation of previous refresh tokens
12. Dashboard system metrics & queue aggregation
