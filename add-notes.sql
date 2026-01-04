-- Add notes column for internal notes on orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT NULL;
