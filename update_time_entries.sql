-- Agregar columna other_activity a la tabla time_entries
ALTER TABLE time_entries 
ADD COLUMN other_activity text;

-- Permitir que project_id sea NULL para registros de "Otros"
ALTER TABLE time_entries 
ALTER COLUMN project_id DROP NOT NULL;

-- Actualizar la restricción unique para incluir other_activity
-- Primero eliminar la restricción existente
ALTER TABLE time_entries 
DROP CONSTRAINT IF EXISTS time_entries_jp_id_project_id_week_start_key;

-- Crear nueva restricción que permita múltiples entradas por semana
-- pero evite duplicados exactos
ALTER TABLE time_entries 
ADD CONSTRAINT time_entries_unique_entry 
UNIQUE (jp_id, project_id, week_start, other_activity);

-- Comentarios para documentar los cambios
COMMENT ON COLUMN time_entries.other_activity IS 'Descripción de la actividad cuando no es un proyecto específico';
COMMENT ON COLUMN time_entries.project_id IS 'ID del proyecto (NULL para actividades otras)';
COMMENT ON COLUMN time_entries.comments IS 'Comentarios adicionales sobre el trabajo realizado';
