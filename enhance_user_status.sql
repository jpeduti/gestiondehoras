-- Script SQL para agregar gestión de estados de usuario más robusta
-- Este script es opcional y mejora la funcionalidad actual

-- 1. Agregar columna status a user_profiles para manejar estados específicos
ALTER TABLE user_profiles 
ADD COLUMN status INTEGER DEFAULT 1;

-- 2. Actualizar registros existentes basándose en is_active
UPDATE user_profiles 
SET status = CASE 
    WHEN is_active = true THEN 1  -- ACTIVE
    WHEN is_active = false THEN 0 -- BLOCKED
    ELSE 1 -- DEFAULT to ACTIVE
END;

-- 3. Crear índice para optimizar consultas por estado
CREATE INDEX idx_user_profiles_status ON user_profiles(status);

-- 4. Crear tabla de auditoría para cambios de estado (opcional)
CREATE TABLE user_status_audit (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    old_status INTEGER,
    new_status INTEGER,
    reason TEXT,
    changed_by UUID REFERENCES user_profiles(id),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Crear función para registrar cambios de estado
CREATE OR REPLACE FUNCTION log_user_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Solo log si el status cambió
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO user_status_audit (user_id, old_status, new_status, changed_at)
        VALUES (NEW.id, OLD.status, NEW.status, NOW());
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Crear trigger para auditoría automática
CREATE TRIGGER trigger_user_status_change
    AFTER UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION log_user_status_change();

-- 7. Crear políticas RLS (Row Level Security) para user_profiles si es necesario
-- ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 8. Crear vista para usuarios activos (optimización)
CREATE VIEW active_users AS
SELECT * FROM user_profiles 
WHERE status = 1 AND is_active = true;

-- 9. Comentarios sobre los estados
COMMENT ON COLUMN user_profiles.status IS 'User status: 1=Active, 0=Blocked, 2=Deleted';
COMMENT ON TABLE user_status_audit IS 'Audit log for user status changes';

-- 10. Ejemplo de consultas útiles:

-- Obtener estadísticas de usuarios por estado:
-- SELECT 
--     status,
--     COUNT(*) as count,
--     CASE 
--         WHEN status = 1 THEN 'Activos'
--         WHEN status = 0 THEN 'Bloqueados'  
--         WHEN status = 2 THEN 'Eliminados'
--         ELSE 'Desconocido'
--     END as status_label
-- FROM user_profiles
-- GROUP BY status;

-- Obtener historial de cambios de un usuario:
-- SELECT 
--     usa.*,
--     up.full_name,
--     CASE 
--         WHEN usa.old_status = 1 THEN 'Activo'
--         WHEN usa.old_status = 0 THEN 'Bloqueado'  
--         WHEN usa.old_status = 2 THEN 'Eliminado'
--         ELSE 'Desconocido'
--     END as old_status_label,
--     CASE 
--         WHEN usa.new_status = 1 THEN 'Activo'
--         WHEN usa.new_status = 0 THEN 'Bloqueado'  
--         WHEN usa.new_status = 2 THEN 'Eliminado'
--         ELSE 'Desconocido'
--     END as new_status_label
-- FROM user_status_audit usa
-- JOIN user_profiles up ON usa.user_id = up.id
-- WHERE usa.user_id = 'UUID_DEL_USUARIO'
-- ORDER BY usa.changed_at DESC;
