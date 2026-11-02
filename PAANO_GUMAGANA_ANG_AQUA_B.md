# Aqua B — Quick Guide (Mabilisang Gabay)
> **Lokasyon:** Pangapisan, Lingayen, Pangasinan (Delivery coverage sa buong Lingayen)

## Paano Gumagana ang System

```
[Customer Storefront] ➔ Pumili ng Refill / New Gallon ➔ Checkout (Walang Login)
        │
[Admin Portal]        ➔ I-confirm ang order ➔ I-assign sa Rider
        │
[Rider Mobile App]    ➔ Tanggapin ang Delivery ➔ Kunin ang Basyo at Bayad ➔ Tapos!
```

---

## 3 Pangunahing Bahagi

### 1. Customer Storefront (`/`)
* **Walang account o login kailangan.**
* **Gallon Options:**
  * **Refill:** May isasauling basyo (tubig lang ang babayaran).
  * **New Gallon:** Walang basyo (+₱180 bagong lalagyan).
* **5-Step Checkout:** Info ➔ Delivery/Pickup ➔ Oras ➔ Bayad (COD / GCash) ➔ Place Order.
* **How It Works & Delivery Areas:** May sariling gabay at listahan ng barangay fees sa Lingayen.

### 2. Admin Dashboard (`/admin`)
* **Orders (`/admin/orders`):** Confirm, cancel, at pag-assign ng rider.
* **Products (`/admin/products`):** Presyo, bagong produkto, at gallon settings.
* **Inventory (`/admin/inventory`):** Stock in, stock out, at bilang ng basyong naibalik.

### 3. Rider Mobile App (`/rider`)
* Para sa cellphone ng rider.
* 1-Click **"Call Customer"** at **"Open Google Maps"**.
* Makikita kung ilang basyo ang kukunin at magkano ang sisingilin.
* Pindutan: `Accept` ➔ `Out for Delivery` ➔ `Delivered`.

---

## Paano Patakbuhin (Quick Start)

* **URL ng App:** `http://localhost:3000`
* **Para Simulan:** I-double-click lang ang `start-aquab.bat` (o patakbuhin ang `npm run dev` matapos simulan ang database).

---

## Demo Accounts (Password: `Password123!`)

* **Super Admin:** `superadmin@aquab.ph` (Full Control)
* **Station Admin:** `admin@aquab.ph` (Orders & Inventory)
* **Rider:** `rider1@aquab.ph` (Deliveries)

*(May 1-click login buttons sa `/login`)*
