# Aqua B — Suki Credit & Utang System (Feature Design & Implementation Plan)

## 1. Overview & Business Logic
Sa kasalukuyang operasyon ng Aqua B:
- **Bagong Customer (Guest / New Client):**
  - Nakakapag-order sa storefront **nang walang login o account registration**.
  - Direct checkout gamit ang Pangalan, Phone Number, at Delivery Address.
  - Payment: **Cash on Delivery (COD)** o **GCash** lamang.
- **Suki Client (Trusted / Regular Customer):**
  - Binibigyan ng **Suki Account** ng Admin/Owner.
  - May sariling **Suki Portal** para ma-check ang kanilang:
    - **Running Balance (Utang):** Magkano pa ang hindi bayad mula sa nakaraang deliveries.
    - **Gallon Container Tracker:** Ilang basyo/galon pa ang nasa kanilang bahay/opisina.
    - **Past Orders:** Kasaysayan ng mga naunang order.
  - **Payment Privilege:** May opsyon sa checkout na **"Charge to Suki Balance (Bayad sa susunod na order)"**.

---

## 2. Customer Workflow

```
[Customer visits Aqua B]
       │
       ├───> BAGONG CUSTOMER (Guest) ───> Add to Cart ───> Fast Checkout ───> Bayad COD / GCash
       │
       └───> SUKI CUSTOMER ──────────────> Suki Login (Phone + PIN)
                                                 │
                                                 ├──> Tingnan ang Balance & Hiniram na Galon
                                                 └──> Checkout na may option: "Pay on Next Delivery"
```

---

## 3. Database Schema (Prisma) Plan

```prisma
// Customer Suki Profile
model CustomerAccount {
  id              String           @id @default(uuid())
  name            String
  phone           String           @unique
  pinCode         String           // 4-digit PIN o simple password
  address         String?
  barangayId      String?
  barangay        Barangay?        @relation(fields: [barangayId], references: [id])
  isSuki          Boolean          @default(true)
  currentBalance  Float            @default(0.00) // Kasalukuyang utang
  creditLimit     Float            @default(1000.00) // Max utang limit
  gallonsOnHand   Int              @default(0)    // Bilang ng galon na nasa kanila
  orders          Order[]
  ledgerEntries   CustomerLedger[]
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
}

// Transparent Ledger para sa Utang at Bayad
model CustomerLedger {
  id                String          @id @default(uuid())
  customerId        String
  customer          CustomerAccount @relation(fields: [customerId], references: [id], onDelete: Cascade)
  type              LedgerType      // CHARGE (Bagong Order), PAYMENT (Bayad), ADJUSTMENT
  amount            Float           // Halaga
  runningBalance    Float           // Balanse matapos ang transaksyon
  orderId           String?
  order             Order?          @relation(fields: [orderId], references: [id])
  notes             String?         // e.g. "Order #AQ-1002", "Paid to Rider 1"
  recordedById      String?
  recordedBy        User?           @relation(fields: [recordedById], references: [id])
  createdAt         DateTime        @default(now())
}

enum LedgerType {
  CHARGE
  PAYMENT
  ADJUSTMENT
}
```

---

## 4. UI Components to Build
1. **Storefront:**
   - Navbar: `Suki Portal` button katabi ng Cart.
   - Checkout: Kapag naka-login si Suki, lalabas ang radio button:
     `[🔘 Bayad sa Susunod na Delivery / Charge to Balance]`
2. **Suki Portal (`/suki/portal`):**
   - Clean, mobile-friendly card ng Running Balance, Gallons on hand, at Past Orders.
3. **Admin Dashboard (`/admin/suki`):**
   - Listahan ng mga Suki at kanilang balances.
   - Button para sa **"Promote Customer to Suki"** at **"Record Payment"** (kapag nagbayad si customer sa istasyon o sa rider).
4. **Rider App Integration:**
   - Display reminder: *"Suki Client — Kolektahin: ₱[Amount] o Pinayagang sa susunod magbayad"*.

