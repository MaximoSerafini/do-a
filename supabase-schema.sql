-- Doña Rib Burger - Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products table (hamburgers, combos, drinks)
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('burger', 'combo', 'drink')),
  image_url TEXT,
  price_simple INTEGER,
  price_doble INTEGER,
  price_triple INTEGER,
  price INTEGER,
  description TEXT,
  description_simple TEXT,
  description_doble TEXT,
  description_triple TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  items JSONB NOT NULL,
  total INTEGER NOT NULL,
  delivery_type TEXT NOT NULL CHECK (delivery_type IN ('pickup', 'delivery')),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('efectivo', 'transferencia')),
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ingredients table (stock management)
CREATE TABLE IF NOT EXISTS ingredients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'unidades',
  min_stock INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (for now - you can restrict later)
CREATE POLICY "Allow all products" ON products FOR ALL USING (true);
CREATE POLICY "Allow all orders" ON orders FOR ALL USING (true);
CREATE POLICY "Allow all ingredients" ON ingredients FOR ALL USING (true);

-- Insert sample data for burgers
INSERT INTO products (name, type, image_url, price_simple, price_doble, price_triple, description_simple, description_doble, description_triple, active) VALUES
('Cheese', 'burger', 'https://i.imgur.com/EAzgTuw.jpeg', 7500, 9000, 13000, 'Pan de papa, medallón de carne, queso cheddar + papas caseras', 'Pan de papa, doble medallón de carne, doble queso cheddar + papas caseras', 'Pan brioche, triple medallón de carne, triple queso cheddar + papas fritas', true),
('Bacon', 'burger', 'https://i.imgur.com/kzoxFME.jpeg', 8000, 9500, 13500, 'Pan de papa, medallón de carne, queso cheddar, panceta crocante + papas caseras', 'Pan de papa, doble medallón de carne, doble queso cheddar, panceta crocante + papas caseras', 'Pan brioche, triple medallón de carne, triple queso cheddar, triple panceta crocante + papas fritas', true),
('Original', 'burger', 'https://i.imgur.com/OKHQXbg.jpeg', 7700, 9700, 13700, 'Pan de papa, medallón de carne, queso tybo, queso cheddar, panceta, lechuga, tomate + papas caseras', 'Pan de papa, doble medallón de carne, queso tybo, queso cheddar, panceta, lechuga, tomate + papas caseras', 'Pan brioche, triple medallón de carne, queso cheddar, queso tybo, lechuga, tomate, panceta crocante + papas fritas', true),
('Cherry', 'burger', 'https://i.imgur.com/AUgQX2C.jpeg', 7700, 9700, 13700, 'Pan de papa, medallón de carne, queso cheddar, cebolla salteada, tomatitos cherrys, panceta crocante + papas caseras', 'Pan de papa, doble medallón de carne, doble queso cheddar, cebolla salteada, tomatitos cherrys, panceta crocante + papas caseras', 'Pan brioche, triple medallón de carne, triple cheddar, panceta crocante, cebolla salteada, tomatitos cherry + papas fritas', true),
('Blue', 'burger', 'https://i.imgur.com/89U7BDh.jpeg', 7700, 9700, 13700, 'Pan de papa, medallón de carne, queso roquefort, queso tybo, rúcula, cebolla salteada + papas caseras', 'Pan de papa, doble medallón de carne, queso roquefort, queso tybo, rúcula, cebolla salteada + papas caseras', 'Pan brioche, triple medallón de carne, queso roquefort, queso tybo, rúcula, cebolla salteada + papas fritas', true);

-- Insert sample combos
INSERT INTO products (name, type, image_url, price, description, active) VALUES
('Combo Original', 'combo', 'https://i.imgur.com/QIOjTAx.jpeg', 17400, '2 Original doble + papas caseras', true),
('Combo Cheese', 'combo', 'https://i.imgur.com/QIOjTAx.jpeg', 16200, '2 Cheese doble + papas caseras', true),
('Combo Bacon', 'combo', 'https://i.imgur.com/QIOjTAx.jpeg', 17100, '2 Bacon doble + papas caseras', true);

-- Insert sample drinks
INSERT INTO products (name, type, image_url, price, active) VALUES
('Pepsi Clásica', 'drink', 'https://i.imgur.com/VWvI0br.png', 3000, true),
('Pepsi Black', 'drink', 'https://i.imgur.com/IaF8xgi.png', 3000, true),
('Mirinda', 'drink', 'https://i.imgur.com/CQRHJgd.png', 3000, true),
('7up', 'drink', 'https://i.imgur.com/52llEiN.png', 3000, true),
('h2oh!', 'drink', 'https://i.imgur.com/pCAOj5c.png', 3000, true),
('Stella Artois', 'drink', 'https://i.imgur.com/soWSw9y.png', 4500, true);

-- Insert sample ingredients
INSERT INTO ingredients (name, quantity, unit, min_stock) VALUES
('Pan de papa', 50, 'unidades', 20),
('Pan brioche', 30, 'unidades', 15),
('Medallón de carne', 80, 'unidades', 30),
('Queso cheddar', 3, 'kg', 1),
('Queso tybo', 2, 'kg', 1),
('Queso roquefort', 1, 'kg', 0),
('Panceta', 2, 'kg', 1),
('Lechuga', 10, 'unidades', 5),
('Tomate', 15, 'unidades', 8),
('Cebolla', 10, 'unidades', 5),
('Tomatitos cherry', 2, 'kg', 1),
('Rúcula', 1, 'kg', 0),
('Papas', 10, 'kg', 5);
