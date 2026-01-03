-- Run this in Supabase SQL Editor to add order status

-- Add status column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled'));

-- Update existing orders to confirmed (so your historical data counts)
UPDATE orders SET status = 'confirmed' WHERE status IS NULL;
