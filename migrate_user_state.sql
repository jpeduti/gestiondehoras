    -- MIGRACIÓN: is_active → user_state
    -- Script para migrar de is_active (boolean) a user_state (integer)

    -- Paso 1: Agregar nueva columna user_state
    ALTER TABLE user_profiles 
    ADD COLUMN user_state INTEGER DEFAULT 1;

    -- Paso 2: Migrar datos existentes
    UPDATE user_profiles 
    SET user_state = CASE 
        WHEN is_active = true THEN 1   -- ACTIVE
        WHEN is_active = false THEN 0  -- BLOCKED (asumimos bloqueado por defecto)
        ELSE 1 -- DEFAULT to ACTIVE
    END;

    -- Paso 3: Crear índice para optimizar consultas
    CREATE INDEX idx_user_profiles_user_state ON user_profiles(user_state);

    -- Paso 4: Agregar constraint para valores válidos
    ALTER TABLE user_profiles 
    ADD CONSTRAINT chk_user_state_valid 
    CHECK (user_state IN (0, 1, 2)); -- 0=BLOCKED, 1=ACTIVE, 2=DELETED

    -- Paso 5: Comentario para documentar
    COMMENT ON COLUMN user_profiles.user_state IS 'User state: 0=Blocked, 1=Active, 2=Deleted';

    -- Paso 6: (OPCIONAL) Una vez que todo funcione, eliminar is_active
    -- ALTER TABLE user_profiles DROP COLUMN is_active;

    -- Vistas útiles para transición:
    CREATE VIEW users_active AS
    SELECT * FROM user_profiles WHERE user_state = 1;

    CREATE VIEW users_blocked AS  
    SELECT * FROM user_profiles WHERE user_state = 0;

    CREATE VIEW users_deleted AS
    SELECT * FROM user_profiles WHERE user_state = 2;

    -- Función helper para compatibilidad durante migración
    CREATE OR REPLACE FUNCTION get_is_active(state INTEGER)
    RETURNS BOOLEAN AS $$
    BEGIN
        RETURN state = 1; -- Solo activo si state = 1
    END;
    $$ LANGUAGE plpgsql;
