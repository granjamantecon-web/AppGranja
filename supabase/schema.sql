-- ============================================
-- ESQUEMA DE BASE DE DATOS - GRANJA DE HUEVOS
-- ============================================
-- Ejecutar este SQL en el SQL Editor de Supabase
-- (Dashboard > SQL Editor > New Query)

-- ============================================
-- 1. TABLA DE PRECIOS
-- ============================================
CREATE TABLE prices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  gallina_docena DECIMAL(10,2) NOT NULL DEFAULT 4.50,
  gallina_media_docena DECIMAL(10,2) NOT NULL DEFAULT 2.50,
  pato_docena DECIMAL(10,2) NOT NULL DEFAULT 6.00,
  pato_media_docena DECIMAL(10,2) NOT NULL DEFAULT 3.50,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar precios iniciales
INSERT INTO prices (gallina_docena, gallina_media_docena, pato_docena, pato_media_docena)
VALUES (4.50, 2.50, 6.00, 3.50);

-- ============================================
-- 2. TABLA DE STOCK
-- ============================================
CREATE TABLE stock (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  gallina INTEGER NOT NULL DEFAULT 120,
  pato INTEGER NOT NULL DEFAULT 60,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar stock inicial
INSERT INTO stock (gallina, pato)
VALUES (120, 60);

-- ============================================
-- 3. TABLA DE RESERVAS
-- ============================================
CREATE TABLE reservations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  egg_type TEXT NOT NULL CHECK (egg_type IN ('gallina', 'pato')),
  quantity TEXT NOT NULL CHECK (quantity IN ('media_docena', 'docena')),
  units INTEGER NOT NULL CHECK (units > 0),
  pickup_date DATE NOT NULL,
  pickup_time TEXT NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'recogido', 'cancelado')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 4. TABLA DE GASTOS
-- ============================================
CREATE TABLE expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 5. POLÍTICAS DE SEGURIDAD (RLS)
-- ============================================
-- Activar Row Level Security en todas las tablas
ALTER TABLE prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Precios: lectura pública, escritura solo autenticados
CREATE POLICY "Precios visibles públicamente"
  ON prices FOR SELECT
  USING (true);

CREATE POLICY "Precios editables por admin"
  ON prices FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Stock: lectura pública, escritura solo autenticados
CREATE POLICY "Stock visible públicamente"
  ON stock FOR SELECT
  USING (true);

CREATE POLICY "Stock editable por admin"
  ON stock FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Reservas: todos pueden crear, admin puede ver/modificar todas
CREATE POLICY "Reservas visibles públicamente"
  ON reservations FOR SELECT
  USING (true);

CREATE POLICY "Cualquiera puede crear reservas"
  ON reservations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Reservas editables por admin"
  ON reservations FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Gastos: solo admin
CREATE POLICY "Gastos visibles por admin"
  ON expenses FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Gastos editables por admin"
  ON expenses FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- 6. ÍNDICES PARA MEJOR RENDIMIENTO
-- ============================================
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_reservations_pickup_date ON reservations(pickup_date);
CREATE INDEX idx_expenses_date ON expenses(date);
CREATE INDEX idx_expenses_category ON expenses(category);

-- ============================================
-- 7. FUNCIÓN PARA ACTUALIZAR updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_prices_updated_at
  BEFORE UPDATE ON prices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stock_updated_at
  BEFORE UPDATE ON stock
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
