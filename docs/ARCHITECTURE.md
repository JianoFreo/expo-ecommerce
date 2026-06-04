# Architecture: shared backend + two UI shells

This project follows **one API, two clients** — not a “web version of mobile.”

```
                    ┌─────────────────┐
                    │  Express API    │
                    │  (MongoDB)      │
                    │  + Serializers  │
                    │  + Socket.io    │
                    │  + Inngest      │
                    └────────┬────────┘
                             │
           ┌─────────────────┼─────────────────┐
           │                 │                 │
    ┌──────▼──────┐   ┌──────▼──────┐   ┌──────▼──────┐
    │ Expo mobile │   │ React admin │   │  (future)   │
    │  (buyer/    │   │  dashboard  │   │  storefront │
    │   seller)   │   │             │   │             │
    └─────────────┘   └─────────────┘   └─────────────┘
```

## User flows (from product diagram)

| Entry | Path |
|-------|------|
| Guest | `visit as guest` → browse products (controlled by `guestEnabled` setting) |
| Register | registration form → login as buyer or seller |
| Login | buyer or seller role branches |
| Seller (no shop) | register shop → shop dashboard |
| Seller (has shop) | products / orders / profile |
| Buyer | browse → cart → checkout → orders → invoice |

## Phase 1 — unified data layer (in progress)

**Canonical response envelopes** (all list endpoints):

| Entity | List | Single |
|--------|------|--------|
| Product | `{ products: Product[] }` | `{ product: Product }` |
| Order | `{ orders: Order[] }` | `{ order: Order }` |
| Shop | `{ shops: Shop[] }` | `{ shop: Shop }` |
| User | `{ users: User[] }` | `{ user: User }` |

**Field conventions**

- IDs: `_id` (string)
- Order total: `totalPrice`
- Line items: `orderItems[]`
- User role: `user` \| `seller` \| `super-admin` (legacy `customer` mapped to `user` on write)

**Backend serializers:** `backend/src/lib/serializers.js`

## Phase 2 — shared TypeScript contract

**Package:** `packages/contract/src/index.ts`

Imported by:

- `admin` via `@expo-ecommerce/contract`
- `mobile` via `@expo-ecommerce/contract`

Admin re-exports: `admin/src/shared/types.ts`  
Mobile re-exports: `mobile/types/index.ts`

## Phase 3 — admin as API-only client

Rules:

- No business logic in admin (stock checks, role rules, shop assignment → backend only)
- Use `admin/src/lib/api.js` for HTTP — not raw paths like `POST /products`
- Display data using contract types (`_id`, `totalPrice`, etc.)

## Phase 4 — real-time sync

**Socket.io** (push to clients):

- Server: `backend/src/lib/realtime.js`
- Events: `catalog:product`, `orders:changed`
- Mobile: `mobile/hooks/useRealtimeSync.ts` + `RealtimeBridge` invalidates React Query caches

**Inngest** (async workflows):

- `catalog/product.changed`
- `orders/status.changed`
- Published from `backend/src/lib/syncEvents.js` on create/update/delete

### Subscribe from a client

```ts
import { io } from "socket.io-client";
const socket = io(API_ORIGIN);
socket.emit("subscribe", ["products", "orders"]);
socket.on("catalog:product", () => refetchProducts());
socket.on("orders:changed", () => refetchOrders());
```

## What not to do

- Duplicate product/order/shop rules in admin or mobile
- Use different field names per client (`id` vs `_id`, `total` vs `totalPrice`)
- Build a separate “web app backend” — extend the same Express API

## Next steps

1. Finish migrating any remaining endpoints that still return raw arrays or unserialized docs
2. Add admin `RealtimeBridge` (same pattern as mobile)
3. Consolidate duplicate seller product controllers into one service module
4. Wire orphaned Inngest email functions in `emailService.js`
