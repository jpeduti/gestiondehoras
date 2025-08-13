-- =====================================================
-- VERIFICACIÓN DE BASE DE DATOS: PROYECTOS
-- =====================================================
-- Este script verifica que la estructura de la base de datos
-- esté correctamente configurada para proyectos

-- =====================================================
-- VERIFICAR ESTRUCTURA DE TABLAS
-- =====================================================

-- Verificar que la tabla projects existe y tiene la estructura correcta
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'projects' 
ORDER BY ordinal_position;

-- Verificar que la tabla project_assignments existe
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'project_assignments' 
ORDER BY ordinal_position;

-- =====================================================
-- VERIFICAR CONSTRAINTS
-- =====================================================

-- Verificar constraints de la tabla projects
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'projects'::regclass
ORDER BY conname;

-- Verificar constraints de la tabla project_assignments
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'project_assignments'::regclass
ORDER BY conname;

-- =====================================================
-- VERIFICAR ÍNDICES
-- =====================================================

-- Verificar índices de la tabla projects
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'projects'
ORDER BY indexname;

-- Verificar índices de la tabla project_assignments
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'project_assignments'
ORDER BY indexname;

-- =====================================================
-- VERIFICAR DATOS
-- =====================================================

-- Contar proyectos por estado
SELECT 
  status,
  COUNT(*) as count
FROM projects 
GROUP BY status 
ORDER BY status;

-- Contar asignaciones activas
SELECT 
  COUNT(*) as total_assignments,
  COUNT(*) FILTER (WHERE is_active = true) as active_assignments,
  COUNT(*) FILTER (WHERE is_active = false) as inactive_assignments
FROM project_assignments;

-- Ver proyectos con asignaciones
SELECT 
  p.code,
  p.name,
  p.status,
  COUNT(pa.jp_id) FILTER (WHERE pa.is_active = true) as active_jps
FROM projects p
LEFT JOIN project_assignments pa ON p.id = pa.project_id
GROUP BY p.id, p.code, p.name, p.status
ORDER BY p.code;

-- =====================================================
-- VERIFICAR FUNCIONES Y TRIGGERS
-- =====================================================

-- Verificar funciones existentes
SELECT 
  proname as function_name,
  prosrc as function_source
FROM pg_proc 
WHERE proname IN ('update_updated_at_column', 'validate_project_status')
ORDER BY proname;

-- Verificar triggers
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  tgfoid::regproc as function_name
FROM pg_trigger 
WHERE tgrelid IN ('projects'::regclass, 'project_assignments'::regclass)
ORDER BY table_name, trigger_name;

-- =====================================================
-- VERIFICAR VISTAS
-- =====================================================

-- Verificar vistas existentes
SELECT 
  viewname as view_name,
  definition
FROM pg_views 
WHERE viewname LIKE 'projects_%'
ORDER BY viewname;

-- =====================================================
-- PRUEBA DE INSERCIÓN
-- =====================================================

-- Intentar insertar un proyecto de prueba (solo si no existe)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM projects WHERE code = 'TEST-001') THEN
    INSERT INTO projects (code, name, description, status) 
    VALUES ('TEST-001', 'Proyecto de Prueba', 'Proyecto para verificar la base de datos', 'active');
    
    RAISE NOTICE 'Proyecto de prueba insertado correctamente';
  ELSE
    RAISE NOTICE 'El proyecto de prueba ya existe';
  END IF;
END $$;

-- Verificar que se insertó correctamente
SELECT * FROM projects WHERE code = 'TEST-001';

-- =====================================================
-- RESUMEN DE VERIFICACIÓN
-- =====================================================

-- Resumen final
SELECT 
  'VERIFICACIÓN COMPLETADA' as status,
  (SELECT COUNT(*) FROM projects) as total_projects,
  (SELECT COUNT(*) FROM project_assignments) as total_assignments,
  (SELECT COUNT(*) FROM pg_indexes WHERE tablename = 'projects') as projects_indexes,
  (SELECT COUNT(*) FROM pg_indexes WHERE tablename = 'project_assignments') as assignments_indexes,
  (SELECT COUNT(*) FROM pg_constraint WHERE conrelid = 'projects'::regclass) as projects_constraints,
  (SELECT COUNT(*) FROM pg_constraint WHERE conrelid = 'project_assignments'::regclass) as assignments_constraints;
