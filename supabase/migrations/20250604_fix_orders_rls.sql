
-- Eliminar políticas existentes de orders si existen
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Users can insert their own orders" ON orders;
DROP POLICY IF EXISTS "Admins can insert orders" ON orders;
DROP POLICY IF EXISTS "Admins can update orders" ON orders;

-- Habilitar RLS en la tabla orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios vean sus propias órdenes
CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política para que los admins vean todas las órdenes
CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'Admin'
    )
  );

-- Política para que los usuarios inserten sus propias órdenes
CREATE POLICY "Users can insert their own orders" ON orders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política para que los admins inserten órdenes
CREATE POLICY "Admins can insert orders" ON orders
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'Admin'
    )
  );

-- POLÍTICA CRÍTICA: Permitir que los admins actualicen órdenes
CREATE POLICY "Admins can update orders" ON orders
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'Admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'Admin'
    )
  );

-- Política para que los admins puedan eliminar órdenes si es necesario
CREATE POLICY "Admins can delete orders" ON orders
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'Admin'
    )
  );
