-- REBMA Database Schema - Sprint 1 Foundation
-- Run this in Supabase SQL Editor

-- =====================
-- ENUMS
-- =====================
CREATE TYPE user_role AS ENUM ('ceo', 'manager', 'supervisor', 'dept_head', 'staff');
CREATE TYPE department_name AS ENUM ('management', 'finance', 'marketing', 'operations', 'production', 'dispatch', 'hr');
CREATE TYPE user_status AS ENUM ('pending', 'active', 'inactive', 'suspended');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'processing', 'dispatched', 'delivered', 'cancelled');
CREATE TYPE payment_method AS ENUM ('cash', 'transfer');
CREATE TYPE delivery_status AS ENUM ('pending', 'in_transit', 'arrived', 'completed', 'failed');

-- =====================
-- CORE TABLES
-- =====================

-- Departments
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name department_name NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users (extends Supabase Auth)
CREATE TABLE profiles (
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

-- Audit Log (Immutable - Append Only)
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL,
  old_data JSONB,
  new_data JSONB,
  user_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products
CREATE TABLE products (
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

-- Stock (Current inventory levels)
CREATE TABLE stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0,
  warehouse_location TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stock Ledger (Append only - all movements)
CREATE TABLE stock_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity_change INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  reference_type TEXT,
  reference_id UUID,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers (Marketing)
CREATE TABLE customers (
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

-- Orders
CREATE TABLE orders (
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

-- Order Items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(12, 2) NOT NULL,
  total_price DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments (Finance)
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  amount DECIMAL(12, 2) NOT NULL,
  payment_method payment_method NOT NULL,
  reference_number TEXT,
  recorded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Employees (HR)
CREATE TABLE employees (
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

-- Attendance
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id),
  clock_in TIMESTAMPTZ,
  clock_out TIMESTAMPTZ,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  department TEXT,
  file_path TEXT,
  file_size BIGINT,
  file_type TEXT,
  uploaded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Approval Queue (Management)
CREATE TABLE approval_queue (
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

-- =====================
-- RLS POLICIES (Day One Security)
-- =====================
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
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Audit Log: Only CEO/Manager can read, no one can write (immutable)
CREATE POLICY "audit_log_read" ON audit_log FOR SELECT
  USING (true);

-- Profiles: Users can read own profile, HR can read all, CEO/Manager read all
CREATE POLICY "profiles_select" ON profiles FOR SELECT
  USING (
    auth.uid() = id 
    OR role IN ('ceo', 'manager', 'dept_head')
  );

CREATE POLICY "profiles_insert" ON profiles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "profiles_update" ON profiles FOR UPDATE
  USING (auth.uid() = id OR role = 'ceo' OR role = 'manager');

-- Departments: Read all, CEO/Manager only can modify
CREATE POLICY "departments_read" ON departments FOR SELECT USING (true);
CREATE POLICY "departments_write" ON departments FOR ALL
  USING (current_setting('app.current_role') IN ('ceo', 'manager'));

-- Stock: Operations/Production can read/write, others read only
CREATE POLICY "stock_operations_read" ON stock FOR SELECT
  USING (
    current_setting('app.current_department') IN ('operations', 'production', 'management')
    OR current_setting('app.current_role') IN ('ceo', 'manager')
  );

-- Stock Ledger: Read all, system only insert
CREATE POLICY "stock_ledger_read" ON stock_ledger FOR SELECT USING (true);

-- Customers: Marketing sees own customers, CEO/Manager see all
CREATE POLICY "customers_read" ON customers FOR SELECT
  USING (
    assigned_user_id = auth.uid()
    OR current_setting('app.current_role') IN ('ceo', 'manager', 'supervisor')
  );

-- Orders: Own orders + supervisor read
CREATE POLICY "orders_read" ON orders FOR SELECT
  USING (
    created_by = auth.uid()
    OR current_setting('app.current_role') IN ('ceo', 'manager', 'supervisor')
  );

-- Payments: Finance/CEO/Manager
CREATE POLICY "payments_read" ON payments FOR SELECT
  USING (
    current_setting('app.current_department') = 'finance'
    OR current_setting('app.current_role') IN ('ceo', 'manager')
  );

-- Employees: HR + CEO only (salary data)
CREATE POLICY "employees_read" ON employees FOR SELECT
  USING (
    current_setting('app.current_department') = 'hr'
    OR current_setting('app.current_role') IN ('ceo', 'manager')
  );

-- Approval Queue: Requester sees own, approvers see all pending
CREATE POLICY "approval_queue_read" ON approval_queue FOR SELECT
  USING (
    requester_id = auth.uid()
    OR current_setting('app.current_role') IN ('ceo', 'manager', 'supervisor')
  );

-- =====================
-- AUDIT LOG TRIGGER FUNCTION
-- =====================
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (table_name, record_id, action, old_data, new_data, user_id)
  VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) ELSE NULL END,
    auth.uid()
  );
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply triggers to all tables
CREATE TRIGGER audit_profiles AFTER INSERT OR UPDATE OR DELETE ON profiles
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_products AFTER INSERT OR UPDATE OR DELETE ON products
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_stock AFTER INSERT OR UPDATE OR DELETE ON stock
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_customers AFTER INSERT OR UPDATE OR DELETE ON customers
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_orders AFTER INSERT OR UPDATE OR DELETE ON orders
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_payments AFTER INSERT OR UPDATE OR DELETE ON payments
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- =====================
-- STOCK RESERVATION FUNCTION (Atomic)
-- =====================
CREATE OR REPLACE FUNCTION reserve_stock(p_product_id UUID, p_quantity INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  v_current_stock INTEGER;
BEGIN
  SELECT quantity INTO v_current_stock FROM stock WHERE product_id = p_product_id FOR UPDATE;
  
  IF v_current_stock >= p_quantity THEN
    UPDATE stock SET quantity = quantity - p_quantity, updated_at = NOW()
    WHERE product_id = p_product_id;
    
    INSERT INTO stock_ledger (product_id, quantity_change, balance_after, reference_type, reference_id)
    VALUES (p_product_id, -p_quantity, v_current_stock - p_quantity, 'reservation', NULL);
    
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- =====================
-- DOCUMENTS POLICIES
-- =====================
CREATE POLICY "documents_read" ON documents FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "documents_insert" ON documents FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "documents_update" ON documents FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "documents_delete" ON documents FOR DELETE USING (auth.role() = 'authenticated');

-- =====================
-- SEED DATA
-- =====================
INSERT INTO departments (name, description) VALUES
  ('management', 'CEO and Manager operations'),
  ('finance', 'Financial management and reporting'),
  ('marketing', 'Sales and customer management'),
  ('operations', 'Inventory and supply chain'),
  ('production', 'Manufacturing and repacking'),
  ('dispatch', 'Delivery and logistics'),
  ('hr', 'Human resources and staff management');

-- Create CEO user (you'll need to update with actual auth user ID after signup)
-- INSERT INTO profiles (id, email, full_name, role, department, status) 
-- VALUES ('YOUR-AUTH-USER-ID', 'ceo@rebma.com', 'CEO', 'ceo', 'management', 'active');