# Comanda Digital - Setup Instructions

## 🎉 Your Comanda Digital SaaS is Ready!

This is a complete digital menu and order management system for restaurants, bars, and pizzerias.

---

## 📋 What's Been Built

### ✅ Customer Journey
- **Landing Page** (`/`) - Elegant black & gold design with restaurant info
- **Order Form** (`/pedido`) - Customer details and table number capture
- **Digital Menu** (`/cardapio`) - Categorized menu with:
  - Food, Drinks, Other categories
  - Variable pricing support (weight-based items)
  - Real-time cart management
- **Comanda View** (`/comanda`) - Order summary with:
  - Item list with edit capabilities
  - 10% service charge calculation
  - Total price display
- **Payment Page** (`/pagamento`) - Mercado Pago integration:
  - Pix QR Code generation
  - Credit/Debit card payment
  - Real-time payment processing

### ✅ Integrations
- **Supabase** - Database and authentication (configured)
- **Mercado Pago** - Payment processing (TEST mode configured)
- **QR Code Generation** - Unique QR codes for each table

### ✅ Backend API Routes
All routes are under `/api/`:
- `GET/POST /api/comandas` - Manage comandas
- `GET/POST/DELETE /api/comanda-items` - Manage order items
- `GET/POST /api/products` - Product management
- `GET/POST /api/tables` - Table management
- `POST /api/payments` - Payment processing

---

## 🚀 CRITICAL: Setup Supabase Database

**You MUST run this SQL in your Supabase SQL Editor before testing:**

1. Go to: https://walzlcumeccbcogujard.supabase.co
2. Navigate to **SQL Editor**
3. Copy and paste the entire content from `supabase-schema.sql`
4. Click **Run** to create all tables and seed data

This will create:
- ✅ 5 database tables (comandas, comanda_items, products, tables, payments)
- ✅ 10 sample tables
- ✅ 25 sample products (food, drinks, desserts)
- ✅ Proper indexes and security policies

---

## 🎨 Design System

**Color Palette:**
- Primary: Gold (#D4AF37, #FFD700)
- Background: Black (#000000, #0A0A0A)
- Text: White (#FFFFFF)
- Borders: Gold with opacity

**Features:**
- Mobile-first responsive design
- Large touch targets
- Elegant gradient buttons
- Smooth transitions
- Commercial aesthetic

---

## 🧪 Testing the Application

### Step 1: Run Supabase SQL Setup
**IMPORTANT:** Execute `supabase-schema.sql` in Supabase SQL Editor first!

### Step 2: Test Customer Flow
1. Visit: `https://qrmenu-7.preview.emergentagent.com`
2. Click "Fazer Pedido"
3. Fill in:
   - Name: Test Customer
   - Phone: (11) 99999-9999
   - Table: 1
4. Browse menu and add items
5. View your comanda
6. Try payment (TEST mode - use Mercado Pago test cards)

### Step 3: Test Payment Methods
**Pix:** Will generate QR code (TEST mode)
**Card:** Will redirect to Mercado Pago (use test cards from MP docs)

---

## 🔑 Environment Variables (Already Configured)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://walzlcumeccbcogujard.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# Mercado Pago (TEST Mode)
MERCADO_PAGO_ACCESS_TOKEN=TEST-APP_USR-...
NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=TEST-APP_USR-...

# Restaurant Info
NEXT_PUBLIC_RESTAURANT_NAME=Comanda Digital
NEXT_PUBLIC_INSTAGRAM=@comandadigital
NEXT_PUBLIC_GOOGLE_MAPS=https://maps.google.com
```

---

## 📱 Features Implemented

### ✅ Core Features
- [x] Digital menu with categories
- [x] Variable pricing items (by weight)
- [x] Real-time cart management
- [x] Comanda (order) creation
- [x] Item addition/removal
- [x] 10% service charge calculation
- [x] Mercado Pago payment integration
- [x] Pix QR Code generation
- [x] Credit/Debit card payments
- [x] Table management
- [x] QR Code per table

### 🚧 Ready for Next Phase
- [ ] Admin panel (structure ready)
- [ ] Staff authentication with Supabase Auth
- [ ] Real-time order updates (Supabase subscriptions)
- [ ] Daily/Monthly reports
- [ ] Payment status tracking
- [ ] WhatsApp notifications

---

## 🎯 Quick Start Checklist

1. ✅ Dependencies installed
2. ✅ Environment variables configured
3. ✅ Supabase client setup
4. ✅ Mercado Pago integration
5. ⚠️ **PENDING:** Run SQL schema in Supabase
6. ⚠️ **PENDING:** Test customer flow
7. ⚠️ **PENDING:** Test payment integration

---

## 🔄 Next Steps

### Immediate (Do First):
1. **Run Supabase SQL Setup** - Copy `supabase-schema.sql` to Supabase SQL Editor
2. **Test Customer Journey** - Create a test order
3. **Test Payment Flow** - Try Pix and Card payments

### Phase 2 (Admin Panel):
1. Add Supabase Auth login page
2. Create admin dashboard with table overview
3. Add real-time order management
4. Implement reports and analytics
5. Add payment status webhooks

### Phase 3 (Advanced):
1. WhatsApp integration for notifications
2. Kitchen display system
3. Inventory management
4. Multi-restaurant support (SaaS features)
5. Analytics dashboard

---

## 🆘 Support

### Common Issues:

**Error: "relation 'products' does not exist"**
- Solution: Run `supabase-schema.sql` in Supabase SQL Editor

**Error: "Mercado Pago API error"**
- Check: TEST credentials are correctly set in `.env`
- Verify: Access token starts with `TEST-`

**Products not loading:**
- Check: Supabase tables are created
- Verify: RLS policies are set correctly

---

## 🎨 Customization

### Change Restaurant Info:
Edit `.env` file:
```env
NEXT_PUBLIC_RESTAURANT_NAME=Your Restaurant Name
NEXT_PUBLIC_INSTAGRAM=@yourinstagram
NEXT_PUBLIC_GOOGLE_MAPS=https://maps.google.com/your-location
```

### Add More Products:
Use Supabase dashboard or API:
```javascript
POST /api/products
{
  "name": "Product Name",
  "category": "food", // or "drinks", "other"
  "price": 25.00,
  "is_variable_price": false,
  "description": "Product description",
  "available": true
}
```

### Generate QR Codes for Tables:
```javascript
POST /api/tables
{
  "table_number": 11
}
```
Returns QR code image that customers can scan.

---

## 📊 Database Schema

**comandas** - Customer orders
**comanda_items** - Items in each order
**products** - Menu items
**tables** - Restaurant tables
**payments** - Payment records

---

## 🎉 You're All Set!

Your Comanda Digital MVP is ready. Just run the SQL setup and start testing!

**Live URL:** https://qrmenu-7.preview.emergentagent.com
