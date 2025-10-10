-- Comanda Digital - Supabase Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tables table
CREATE TABLE IF NOT EXISTS tables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_number INTEGER UNIQUE NOT NULL,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'payment_pending')),
  qr_code_data TEXT,
  qr_code_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comandas table
CREATE TABLE IF NOT EXISTS comandas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  table_number INTEGER NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'paid', 'payment_pending')),
  total_amount NUMERIC(10, 2) DEFAULT 0,
  service_charge_applied BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('food', 'drinks', 'other')),
  price NUMERIC(10, 2),
  is_variable_price BOOLEAN DEFAULT false,
  description TEXT,
  image_url TEXT,
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comanda Items table
CREATE TABLE IF NOT EXISTS comanda_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comanda_id UUID REFERENCES comandas(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(10, 2) NOT NULL,
  total_price NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comanda_id UUID REFERENCES comandas(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('pix', 'credit_card', 'debit_card')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  mercado_pago_payment_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_comandas_table_number ON comandas(table_number);
CREATE INDEX IF NOT EXISTS idx_comandas_status ON comandas(status);
CREATE INDEX IF NOT EXISTS idx_comanda_items_comanda_id ON comanda_items(comanda_id);
CREATE INDEX IF NOT EXISTS idx_payments_comanda_id ON payments(comanda_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_available ON products(available);

-- Insert sample tables (1-20)
INSERT INTO tables (table_number, status) VALUES
  (1, 'available'),
  (2, 'available'),
  (3, 'available'),
  (4, 'available'),
  (5, 'available'),
  (6, 'available'),
  (7, 'available'),
  (8, 'available'),
  (9, 'available'),
  (10, 'available')
ON CONFLICT (table_number) DO NOTHING;

-- Insert sample products
-- Food items
INSERT INTO products (name, category, price, is_variable_price, description, available) VALUES
  ('Hambúrguer Artesanal', 'food', 35.00, false, 'Pão brioche, 180g de carne, queijo cheddar, bacon e molho especial', true),
  ('Pizza Margherita', 'food', 45.00, false, 'Molho de tomate, mussarela, manjericão fresco', true),
  ('Batata Frita Grande', 'food', 18.00, false, 'Batatas crocantes com tempero especial', true),
  ('Açaí', 'food', null, true, 'Açaí puro - preço por peso', true),
  ('Self-Service', 'food', null, true, 'Buffet livre - preço por kg', true),
  ('Picanha Grelhada', 'food', 65.00, false, '300g de picanha premium com guarnições', true),
  ('Salada Caesar', 'food', 28.00, false, 'Alface romana, croutons, parmesão e molho caesar', true),
  ('Pastel de Carne', 'food', 8.00, false, 'Massa crocante recheada com carne temperada', true),
  ('Porção de Frango', 'food', 32.00, false, 'Frango à passarinho crocante', true),
  ('Tilápia Grelhada', 'food', 42.00, false, 'Filé de tilápia com legumes', true)
ON CONFLICT DO NOTHING;

-- Drinks items
INSERT INTO products (name, category, price, is_variable_price, description, available) VALUES
  ('Coca-Cola Lata', 'drinks', 6.00, false, 'Refrigerante 350ml gelado', true),
  ('Suco de Laranja', 'drinks', 12.00, false, 'Suco natural 500ml', true),
  ('Cerveja Heineken', 'drinks', 10.00, false, 'Long neck 330ml', true),
  ('Água Mineral', 'drinks', 4.00, false, 'Garrafa 500ml', true),
  ('Caipirinha', 'drinks', 18.00, false, 'Tradicional de limão', true),
  ('Vinho Taça', 'drinks', 22.00, false, 'Taça de vinho tinto ou branco', true),
  ('Café Expresso', 'drinks', 5.00, false, 'Café expresso tradicional', true),
  ('Chopp Brahma', 'drinks', 12.00, false, 'Chopp 300ml', true),
  ('Refrigerante 2L', 'drinks', 12.00, false, 'Refrigerante 2 litros', true),
  ('Suco de Maracujá', 'drinks', 14.00, false, 'Suco natural 500ml', true)
ON CONFLICT DO NOTHING;

-- Other items
INSERT INTO products (name, category, price, is_variable_price, description, available) VALUES
  ('Sobremesa do Dia', 'other', 15.00, false, 'Pergunte ao garçom', true),
  ('Couvert Artístico', 'other', 12.00, false, 'Pães e patês', true),
  ('Mousse de Chocolate', 'other', 14.00, false, 'Mousse cremoso artesanal', true),
  ('Petit Gateau', 'other', 22.00, false, 'Bolinho quente com sorvete', true),
  ('Pudim de Leite', 'other', 12.00, false, 'Pudim tradicional caseiro', true)
ON CONFLICT DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE comandas ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE comanda_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed for production)
-- Allow read access to products
CREATE POLICY "Public can read products" ON products
  FOR SELECT USING (true);

-- Allow all operations on comandas (you may want to restrict this in production)
CREATE POLICY "Public can manage comandas" ON comandas
  FOR ALL USING (true);

-- Allow all operations on comanda_items
CREATE POLICY "Public can manage comanda_items" ON comanda_items
  FOR ALL USING (true);

-- Allow all operations on tables
CREATE POLICY "Public can read tables" ON tables
  FOR SELECT USING (true);

-- Allow all operations on payments
CREATE POLICY "Public can manage payments" ON payments
  FOR ALL USING (true);

-- Admin policies (you can add authenticated user policies here)
CREATE POLICY "Authenticated users can manage products" ON products
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage tables" ON tables
  FOR ALL USING (auth.role() = 'authenticated');
