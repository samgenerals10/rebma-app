const { Client } = require('pg')

async function main() {
  const client = new Client({
    host: 'aws-0-eu-west-1.pooler.supabase.com',
    port: 5432,
    database: 'postgres',
    user: 'postgres.hqnfkepmjrpnyrxmkode',
    password: 'sammi100!@#',
  })

  await client.connect()

  const sql = `
-- ENUMS
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('ceo', 'manager', 'supervisor', 'dept_head', 'staff');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE department_name AS ENUM ('management', 'finance', 'marketing', 'operations', 'production', 'dispatch', 'hr');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE user_status AS ENUM ('pending', 'active', 'inactive', 'suspended');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'processing', 'dispatched', 'delivered', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_method AS ENUM ('cash', 'transfer');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE delivery_status AS ENUM ('pending', 'in_transit', 'arrived', 'completed', 'failed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- DEPARTMENTS
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name department_name NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'staff',
  department department_name,
  status user_status DEFAULT 'pending',
  supervisor_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AUDIT LOG
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL,
  old_data JSONB,
  new_data JSONB,
  user_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUCTS
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  unit_of_measure TEXT DEFAULT 'unit',
  reorder_level INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STOCK
CREATE TABLE IF NOT EXISTS stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0,
  warehouse_location TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STOCK LEDGER
CREATE TABLE IF NOT EXISTS stock_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity_change INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  reference_type TEXT,
  reference_id UUID,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CUSTOMERS
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  gps_lat DECIMAL(10, 8),
  gps_lng DECIMAL(11, 8),
  address TEXT,
  risk_status TEXT DEFAULT 'normal',
  assigned_user_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ORDERS
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id),
  status order_status DEFAULT 'pending',
  total_amount DECIMAL(12, 2) DEFAULT 0,
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ORDER ITEMS
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(12, 2) NOT NULL,
  total_price DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PAYMENTS
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  amount DECIMAL(12, 2) NOT NULL,
  payment_method payment_method NOT NULL,
  reference_number TEXT,
  recorded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- EMPLOYEES
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  employee_number TEXT UNIQUE,
  department department_name NOT NULL,
  position TEXT,
  start_date DATE,
  salary DECIMAL(12, 2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ATTENDANCE
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id),
  clock_in TIMESTAMPTZ,
  clock_out TIMESTAMPTZ,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- APPROVAL QUEUE
CREATE TABLE IF NOT EXISTS approval_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  reference_id UUID,
  requester_id UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'pending',
  amount DECIMAL(12, 2),
  notes TEXT,
  approved_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES
DROP POLICY IF EXISTS "audit_log_read" ON audit_log;
CREATE POLICY "audit_log_read" ON audit_log FOR SELECT USING (true);

DROP POLICY IF EXISTS "profiles_select" ON profiles;
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (auth.uid() = id OR role IN ('ceo', 'manager', 'dept_head'));

DROP POLICY IF EXISTS "profiles_insert" ON profiles;
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "profiles_update" ON profiles;
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id OR role = 'ceo' OR role = 'manager');

DROP POLICY IF EXISTS "departments_read" ON departments;
CREATE POLICY "departments_read" ON departments FOR SELECT USING (true);

DROP POLICY IF EXISTS "stock_operations_read" ON stock;
CREATE POLICY "stock_operations_read" ON stock FOR SELECT USING (true);

DROP POLICY IF EXISTS "stock_ledger_read" ON stock_ledger;
CREATE POLICY "stock_ledger_read" ON stock_ledger FOR SELECT USING (true);

DROP POLICY IF EXISTS "customers_read" ON customers;
CREATE POLICY "customers_read" ON customers FOR SELECT USING (true);

DROP POLICY IF EXISTS "orders_read" ON orders;
CREATE POLICY "orders_read" ON orders FOR SELECT USING (true);

DROP POLICY IF EXISTS "payments_read" ON payments;
CREATE POLICY "payments_read" ON payments FOR SELECT USING (true);

DROP POLICY IF EXISTS "employees_read" ON employees;
CREATE POLICY "employees_read" ON employees FOR SELECT USING (true);

DROP POLICY IF EXISTS "approval_queue_read" ON approval_queue;
CREATE POLICY "approval_queue_read" ON approval_queue FOR SELECT USING (true);

-- AUDIT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (table_name, record_id, action, old_data, new_data, user_id)
  VALUES (TG_TABLE_NAME, COALESCE(NEW.id, OLD.id), TG_OP, CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END, CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) ELSE NULL END, auth.uid());
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- AUDIT TRIGGERS
DROP TRIGGER IF EXISTS audit_profiles ON profiles;
CREATE TRIGGER audit_profiles AFTER INSERT OR UPDATE OR DELETE ON profiles FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

DROP TRIGGER IF EXISTS audit_products ON products;
CREATE TRIGGER audit_products AFTER INSERT OR UPDATE OR DELETE ON products FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

DROP TRIGGER IF EXISTS audit_stock ON stock;
CREATE TRIGGER audit_stock AFTER INSERT OR UPDATE OR DELETE ON stock FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

DROP TRIGGER IF EXISTS audit_customers ON customers;
CREATE TRIGGER audit_customers AFTER INSERT OR UPDATE OR DELETE ON customers FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

DROP TRIGGER IF EXISTS audit_orders ON orders;
CREATE TRIGGER audit_orders AFTER INSERT OR UPDATE OR DELETE ON orders FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

DROP TRIGGER IF EXISTS audit_payments ON payments;
CREATE TRIGGER audit_payments AFTER INSERT OR UPDATE OR DELETE ON payments FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- STOCK RESERVATION FUNCTION
CREATE OR REPLACE FUNCTION reserve_stock(p_product_id UUID, p_quantity INTEGER)
RETURNS BOOLEAN AS $$
DECLARE v_current_stock INTEGER;
BEGIN
  SELECT quantity INTO v_current_stock FROM stock WHERE product_id = p_product_id FOR UPDATE;
  IF v_current_stock >= p_quantity THEN
    UPDATE stock SET quantity = quantity - p_quantity, updated_at = NOW() WHERE product_id = p_product_id;
    INSERT INTO stock_ledger (product_id, quantity_change, balance_after, reference_type, reference_id) VALUES (p_product_id, -p_quantity, v_current_stock - p_quantity, 'reservation', NULL);
    RETURN TRUE;
  END IF;
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- SEED DEPARTMENTS
INSERT INTO departments (name, description) VALUES
  ('management', 'CEO and Manager operations'),
  ('finance', 'Financial management and reporting'),
  ('marketing', 'Sales and customer management'),
  ('operations', 'Inventory and supply chain'),
  ('production', 'Manufacturing and repacking'),
  ('dispatch', 'Delivery and logistics'),
  ('hr', 'Human resources and staff management')
ON CONFLICT (name) DO NOTHING;

  `

  await client.query(sql)
  console.log('Database setup complete!')
  await client.end()
}

main().catch(console.error)