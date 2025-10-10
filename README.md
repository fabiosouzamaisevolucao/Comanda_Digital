# 🍽️ Comanda Digital - Digital Menu & Order Management SaaS

A modern, elegant digital menu and order management system for restaurants, bars, and pizzerias built with Next.js, Supabase, and Mercado Pago.

## 🎨 Features

### ✅ Customer Experience
- **Elegant Landing Page** - Black & gold design with restaurant branding
- **QR Code Ordering** - Customers scan table QR codes to start ordering
- **Digital Menu** - Categorized menu (Food, Drinks, Other) with search
- **Variable Pricing** - Support for weight-based items (açaí, self-service)
- **Live Cart** - Real-time order management with quantity controls
- **Digital Comanda** - View all ordered items with totals
- **Integrated Payments** - Mercado Pago (Pix + Credit/Debit cards)

### ✅ Integrations
- **Supabase** - PostgreSQL database with real-time capabilities
- **Mercado Pago** - Payment processing (TEST mode configured)
- **QR Code Generation** - Automatic QR code per table
- **Responsive Design** - Mobile-first, works on any device

## 🚀 Quick Start

### 1. Setup Supabase Database (REQUIRED)

**You MUST run this SQL before using the app:**

1. Visit: [https://walzlcumeccbcogujard.supabase.co](https://walzlcumeccbcogujard.supabase.co)
2. Go to **SQL Editor** (left sidebar)
3. Copy the entire content from `supabase-schema.sql`
4. Paste and click **RUN**

This creates:
- All database tables
- 10 sample restaurant tables
- 25 sample menu items
- Security policies

### 2. Test the Application

Visit: **https://qrmenu-7.preview.emergentagent.com**

Try the full customer journey:
1. Click "Fazer Pedido"
2. Fill in name, phone, table number
3. Browse menu and add items
4. View comanda with 10% service charge
5. Test payment (TEST mode - use Mercado Pago test credentials)

### 3. Verify Setup (Optional)

Run the verification script:
```bash
node setup-supabase.js
```

## 📱 Application Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with restaurant info and CTA |
| `/pedido` | Customer registration (name, phone, table) |
| `/cardapio` | Digital menu with categories and cart |
| `/comanda` | Order summary with item management |
| `/pagamento` | Payment page (Pix QR code + Cards) |

## 🔧 API Endpoints

All endpoints are under `/api/`:

### Comandas
- `GET /api/comandas?id={id}` - Get comanda by ID
- `POST /api/comandas` - Create new comanda
- `PUT /api/comandas` - Update comanda

### Items
- `GET /api/comanda-items?comanda_id={id}` - Get all items
- `POST /api/comanda-items` - Add item to comanda
- `DELETE /api/comanda-items?id={id}` - Remove item

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create new product

### Tables
- `GET /api/tables` - Get all tables
- `POST /api/tables` - Create table with QR code

### Payments
- `POST /api/payments` - Process payment with Mercado Pago

## 🎨 Design System

**Colors:**
- Primary: Gold (#D4AF37, #FFD700)
- Background: Black (#000000, #0A0A0A)
- Text: White (#FFFFFF)
- Accents: Gold with varying opacity

**Typography:**
- Font: Inter (Google Fonts)
- Mobile-first responsive sizing
- Clear hierarchy and readability

## 🔐 Environment Variables

Already configured in `.env`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://walzlcumeccbcogujard.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# Mercado Pago (TEST Mode)
MERCADO_PAGO_ACCESS_TOKEN=TEST-APP_USR-...
NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=TEST-APP_USR-...

# Restaurant Info (Customizable)
NEXT_PUBLIC_RESTAURANT_NAME=Comanda Digital
NEXT_PUBLIC_INSTAGRAM=@comandadigital
NEXT_PUBLIC_GOOGLE_MAPS=https://maps.google.com
```

## 📊 Database Schema

### Tables
- **comandas** - Customer orders/tabs
- **comanda_items** - Items in each order
- **products** - Menu items
- **tables** - Restaurant tables with QR codes
- **payments** - Payment transactions

Full schema in `supabase-schema.sql`

## 🛠️ Tech Stack

- **Frontend:** Next.js 14, React 18, Tailwind CSS
- **UI Components:** shadcn/ui (Radix UI)
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth (ready for admin panel)
- **Payments:** Mercado Pago SDK
- **QR Codes:** qrcode library

## 📝 Customization

### Change Restaurant Info

Edit `.env`:
```env
NEXT_PUBLIC_RESTAURANT_NAME=Your Restaurant
NEXT_PUBLIC_INSTAGRAM=@yourhandle
NEXT_PUBLIC_GOOGLE_MAPS=https://maps.google.com/your-location
```

### Add Menu Items

Via API or Supabase dashboard:
```javascript
POST /api/products
{
  "name": "New Dish",
  "category": "food", // "food", "drinks", "other"
  "price": 29.90,
  "is_variable_price": false,
  "description": "Delicious description",
  "image_url": "https://...",
  "available": true
}
```

### Generate Table QR Codes

```javascript
POST /api/tables
{
  "table_number": 15
}
```
Returns QR code image customers can scan.

## 🚧 Next Phase: Admin Panel

Ready to build:
- [ ] Staff login with Supabase Auth
- [ ] Real-time order dashboard
- [ ] Table status management
- [ ] Payment tracking
- [ ] Daily/Monthly reports
- [ ] Kitchen display system

## 🐛 Troubleshooting

**"Table 'products' not found"**
→ Run `supabase-schema.sql` in Supabase SQL Editor

**"Payment failed"**
→ Check TEST credentials in `.env`
→ Verify Mercado Pago API is accessible

**Products not loading**
→ Check Supabase connection
→ Verify RLS policies are set

## 📖 Additional Files

- `SETUP_INSTRUCTIONS.md` - Detailed setup guide
- `supabase-schema.sql` - Complete database schema
- `setup-supabase.js` - Database verification script

## 🎉 You're Ready!

1. ✅ Run SQL in Supabase SQL Editor
2. ✅ Visit https://qrmenu-7.preview.emergentagent.com
3. ✅ Create a test order
4. ✅ Test payment flow

---

**Built with ❤️ for restaurants, bars, and pizzerias**

*Need help? Check `SETUP_INSTRUCTIONS.md` for detailed guidance.*
