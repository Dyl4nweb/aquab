# Aqua B — Water Station Ordering & Delivery Management System

Aqua B is a modern e-commerce and delivery management platform tailored for local water refilling stations in Pangapisan, Lingayen, Pangasinan.

## Core Features

1. **Customer Storefront (No Login Required)**
   - Browse purified, alkaline, and mineral water products.
   - Refill / Exchange option vs. New Container purchase (container deposit fee).
   - Real-time cart calculation and 5-step checkout (COD & GCash).
   - Dedicated "How It Works" and "Delivery Areas" coverage guides.

2. **Secured Staff Dashboards**
   - **Super Admin & Admin (`/admin`):** KPIs, order processing, rider assignment, product catalog, inventory & gallon ledger, barangay delivery fees.
   - **Delivery Rider (`/rider`):** Mobile-first dispatch UI with 1-click customer call, Google Maps directions, empty gallon collection, and cash handover.

## Quick Start

1. Start PostgreSQL (Port 5434) and the Next.js server with one click:
   ```bash
   start-aquab.bat
   ```
   Or run manually:
   ```bash
   npm run dev
   ```
2. Open your browser:
   **[http://localhost:3000](http://localhost:3000)**

## Demo Accounts (Password: `Password123!`)

- **Super Admin:** `superadmin@aquab.ph`
- **Station Admin:** `admin@aquab.ph`
- **Rider:** `rider1@aquab.ph`
- **Rider 2:** `rider2@aquab.ph`
*(Demo 1-click login buttons are available at `/login`)*
