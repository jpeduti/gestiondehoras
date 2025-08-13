# 🗄️ Base de Datos: Gestión de Horas UNIACC

## 📋 **Resumen Ejecutivo**

Este documento explica cómo se estructura y funciona la base de datos del sistema de Gestión de Horas UNIACC, específicamente para la gestión de proyectos con estados y fechas opcionales.

## 🏗️ **Arquitectura de la Base de Datos**

### **Tecnología Utilizada**
- **Sistema**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth integrado
- **API**: PostgREST para operaciones CRUD
- **Seguridad**: Row Level Security (RLS) habilitado

### **Estructura Principal**
```
user_profiles (usuarios)
    ↓
projects (proyectos)
    ↓
project_assignments (asignaciones)
    ↓
time_entries (registro de horas)
```

## 📊 **Tablas Principales**

### **1. Tabla `projects`**
Almacena la información principal de los proyectos.

| Campo | Tipo | Descripción | Restricciones |
|-------|------|-------------|---------------|
| `id` | UUID | Identificador único | PRIMARY KEY, auto-generado |
| `code` | VARCHAR(50) | Código del proyecto | NOT NULL, UNIQUE |
| `name` | VARCHAR(255) | Nombre del proyecto | NOT NULL |
| `description` | TEXT | Descripción opcional | NULL permitido |
| `status` | VARCHAR(20) | Estado del proyecto | NOT NULL, CHECK |
| `start_date` | DATE | Fecha de inicio | NULL permitido |
| `end_date` | DATE | Fecha de fin | NULL permitido |
| `created_by` | UUID | Usuario creador | FK a user_profiles |
| `created_at` | TIMESTAMP | Fecha de creación | auto-generado |
| `updated_at` | TIMESTAMP | Fecha de actualización | auto-actualizado |

**Estados Válidos**: `'active'`, `'paused'`, `'completed'`, `'cancelled'`

### **2. Tabla `project_assignments`**
Gestiona la asignación de Jefes de Proyecto (JPs) a proyectos.

| Campo | Tipo | Descripción | Restricciones |
|-------|------|-------------|---------------|
| `id` | UUID | Identificador único | PRIMARY KEY, auto-generado |
| `project_id` | UUID | ID del proyecto | FK a projects, NOT NULL |
| `jp_id` | UUID | ID del JP asignado | FK a user_profiles, NOT NULL |
| `assigned_at` | TIMESTAMP | Fecha de asignación | auto-generado |
| `is_active` | BOOLEAN | Estado de la asignación | DEFAULT true |

## 🔐 **Seguridad y Permisos**

### **Row Level Security (RLS)**
- **Habilitado** en todas las tablas de proyectos
- **Políticas** basadas en roles de usuario
- **Acceso** controlado por autenticación

### **Políticas de Acceso**
- **Ver proyectos**: Usuarios autenticados
- **Crear proyectos**: Solo admins y directors
- **Editar proyectos**: Admins, directors y creador del proyecto
- **Gestionar asignaciones**: Solo admins y directors

## 📝 **Cómo se Guardan los Datos**

### **1. Flujo de Creación de Proyecto**

```typescript
// 1. Usuario llena el formulario en ProjectModal.vue
const projectData = {
  code: "TD-001",
  name: "Proyecto Demo",
  description: "Descripción del proyecto",
  status: "active", // OBLIGATORIO
  start_date: "2024-01-01", // OPCIONAL
  end_date: "2024-12-31",   // OPCIONAL
  assigned_jps: ["user-id-1", "user-id-2"]
}

// 2. Se envía al servicio
await projectService.createProject(projectData)

// 3. El servicio separa los datos
const { assigned_jps, ...projectData } = project

// 4. Se inserta en la tabla projects
const { data, error } = await supabase
  .from('projects')
  .insert(projectData)
  .select()
  .single()

// 5. Se crean las asignaciones en project_assignments
if (assigned_jps && assigned_jps.length > 0) {
  await this.assignJPsToProject(data.id, assigned_jps)
}
```

### **2. Validaciones Automáticas**

#### **Validación de Estado**
- **Obligatorio**: No se puede crear proyecto sin estado
- **Valores válidos**: Solo los 4 estados permitidos
- **Trigger**: `validate_project_status()` se ejecuta automáticamente

#### **Validación de Fechas**
- **Opcionales**: Ambas fechas pueden ser NULL
- **Coherencia**: Si ambas están presentes, start_date ≤ end_date
- **Trigger**: Validación automática en inserción/actualización

#### **Validación de Código**
- **Único**: No puede haber dos proyectos con el mismo código
- **Constraint**: UNIQUE en la columna `code`

### **3. Estructura de Respuesta**

```typescript
// Respuesta del servicio
interface Project {
  id: string
  code: string
  name: string
  description: string | null
  status: 'active' | 'paused' | 'completed' | 'cancelled'
  start_date: string | null
  end_date: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

// Con asignaciones (para el frontend)
interface ProjectWithAssignments extends Project {
  created_by_profile?: UserProfile
  assignments: Array<ProjectAssignment & {
    jp_profile: UserProfile
  }>
}
```

## 🚀 **Operaciones CRUD**

### **Crear Proyecto**
```sql
INSERT INTO projects (code, name, description, status, start_date, end_date, created_by)
VALUES ('TD-001', 'Proyecto Demo', 'Descripción', 'active', '2024-01-01', '2024-12-31', 'user-uuid');
```

### **Actualizar Proyecto**
```sql
UPDATE projects 
SET 
  name = 'Nuevo Nombre',
  status = 'paused',
  updated_at = NOW()
WHERE id = 'project-uuid';
```

### **Eliminar Proyecto (Soft Delete)**
```sql
UPDATE projects 
SET status = 'cancelled', updated_at = NOW()
WHERE id = 'project-uuid';
```

### **Asignar JP a Proyecto**
```sql
INSERT INTO project_assignments (project_id, jp_id, is_active)
VALUES ('project-uuid', 'jp-uuid', true);
```

## 📈 **Optimizaciones y Rendimiento**

### **Índices Creados**
- `idx_projects_code`: Búsquedas rápidas por código
- `idx_projects_status`: Filtros por estado
- `idx_projects_dates`: Filtros por rango de fechas
- `idx_project_assignments_active`: Asignaciones activas
- `idx_project_assignments_jp`: JP por asignación

### **Vistas Optimizadas**
- `projects_active`: Solo proyectos activos
- `projects_paused`: Solo proyectos pausados
- `projects_completed`: Solo proyectos completados
- `projects_cancelled`: Solo proyectos cancelados
- `projects_with_assignments`: Proyectos con conteo de JPs

## 🔍 **Consultas Comunes**

### **Proyectos por Estado**
```sql
SELECT * FROM projects WHERE status = 'active';
```

### **Proyectos con Fechas Definidas**
```sql
SELECT * FROM projects 
WHERE start_date IS NOT NULL OR end_date IS NOT NULL;
```

### **Proyectos por JP Asignado**
```sql
SELECT p.* FROM projects p
JOIN project_assignments pa ON p.id = pa.project_id
WHERE pa.jp_id = 'jp-uuid' AND pa.is_active = true;
```

### **Proyectos con Asignaciones Activas**
```sql
SELECT 
  p.*,
  COUNT(pa.jp_id) as jp_count
FROM projects p
LEFT JOIN project_assignments pa ON p.id = pa.project_id AND pa.is_active = true
GROUP BY p.id;
```

## 🧪 **Pruebas y Verificación**

### **Scripts de Verificación**
1. **`database_schema.sql`**: Crea/actualiza la estructura completa
2. **`verify_projects_db.sql`**: Verifica que todo esté funcionando

### **Comandos de Verificación**
```bash
# Ejecutar en Supabase SQL Editor
\i database_schema.sql

# Verificar estructura
\i verify_projects_db.sql
```

## ⚠️ **Consideraciones Importantes**

### **Integridad de Datos**
- **Foreign Keys**: Referencias a `user_profiles` y `roles`
- **Constraints**: Validaciones automáticas de estado y fechas
- **Triggers**: Actualización automática de timestamps

### **Seguridad**
- **RLS habilitado**: Control de acceso por usuario
- **Políticas**: Permisos basados en roles
- **Validación**: Verificación de datos en frontend y backend

### **Performance**
- **Índices**: Optimización de consultas comunes
- **Vistas**: Datos pre-agregados para reportes
- **Constraints**: Validación a nivel de base de datos

## 🔧 **Mantenimiento**

### **Backup Automático**
- Supabase realiza backups automáticos diarios
- Retención configurada según el plan

### **Monitoreo**
- Logs de acceso y operaciones
- Métricas de performance
- Alertas de errores

### **Actualizaciones**
- Scripts de migración versionados
- Rollback planificado
- Testing en ambiente de desarrollo

## 📞 **Soporte**

### **En Caso de Problemas**
1. **Verificar logs**: Supabase Dashboard > Logs
2. **Ejecutar verificación**: `verify_projects_db.sql`
3. **Revisar políticas RLS**: Supabase Dashboard > Authentication > Policies
4. **Contactar equipo**: Documentación técnica disponible

---

**Última Actualización**: $(date)  
**Versión**: 1.0.0  
**Responsable**: Equipo de Desarrollo UNIACC
