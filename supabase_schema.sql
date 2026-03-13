-- Categories Table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products Table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  barcode TEXT UNIQUE,
  category_id UUID REFERENCES categories(id),
  purchase_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  sale_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  stock_actual INTEGER NOT NULL DEFAULT 0,
  stock_min INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cash Registers Table
CREATE TABLE cash_registers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opened_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  closed_at TIMESTAMP WITH TIME ZONE,
  initial_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  final_amount DECIMAL(12,2),
  expected_amount DECIMAL(12,2),
  status TEXT CHECK (status IN ('open', 'closed')) DEFAULT 'open',
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sales Table
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cash_register_id UUID REFERENCES cash_registers(id),
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  payment_method TEXT CHECK (payment_method IN ('cash', 'card', 'transfer')),
  status TEXT CHECK (status IN ('completed', 'cancelled')) DEFAULT 'completed',
  customer_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sale Items Table
CREATE TABLE sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(12,2) NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory Movements Table
CREATE TABLE inventory_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id),
  type TEXT CHECK (type IN ('sale', 'purchase', 'adjustment', 'loss')),
  quantity INTEGER NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cash Movements Table
CREATE TABLE cash_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cash_register_id UUID REFERENCES cash_registers(id),
  type TEXT CHECK (type IN ('income', 'expense')),
  amount DECIMAL(12,2) NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_sales_created_at ON sales(created_at);
CREATE INDEX idx_inventory_movements_product ON inventory_movements(product_id);
