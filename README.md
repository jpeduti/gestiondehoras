# 🕐 Gestión de Horas UNIACC

Sistema de gestión de horas y proyectos desarrollado para la Universidad UNIACC, que permite a los usuarios (JP - Jefes de Proyecto, directores y administradores) registrar y gestionar el tiempo dedicado a diferentes proyectos y actividades.

## 🚀 Características Principales

- **Gestión de Proyectos**: Crear, editar y gestionar proyectos con asignación de usuarios
- **Registro de Horas**: Sistema semanal de registro de horas trabajadas
- **Gestión de Usuarios**: Administración completa de perfiles y estados de usuario
- **Sistema de Roles**: Roles personalizables con permisos jerárquicos
- **Dashboard Inteligente**: Panel de control con estadísticas y métricas

## 🏗️ Arquitectura y Tecnologías

### Frontend
- **Vue 3** con Composition API y TypeScript
- **Vite** como bundler y servidor de desarrollo
- **Tailwind CSS** para estilos con componentes UI personalizados
- **Lucide Vue** para iconografía

### Backend
- **Supabase** como backend-as-a-service (base de datos PostgreSQL + autenticación)
- **TypeScript** para tipado estático

### Herramientas de Desarrollo
- ESLint + Oxlint para linting
- Vue TSC para verificación de tipos
- PostCSS + Autoprefixer

## 🔐 Sistema de Autenticación y Roles

El proyecto implementa un sistema de roles jerárquico:
- **`jp`** (Jefe de Proyecto): Usuario base con acceso a registro de horas
- **`director`**: Nivel intermedio con más permisos
- **`admin`**: Acceso completo al sistema

## 📊 Estados de Usuario

El sistema utiliza un sistema robusto de estados numéricos:

| Valor | Estado | Descripción | Color UI |
|-------|--------|-------------|----------|
| 0     | Bloqueado | Usuario suspendido temporalmente | 🟡 Amarillo |
| 1     | Activo | Usuario normal funcionando | 🟢 Verde |
| 2     | Eliminado | Soft delete, no mostrar en listas | 🔴 Rojo |
| 3     | Pendiente | Esperando aprobación (futuro) | 🔵 Azul |


## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js ^20.19.0 o >=22.12.0
- npm o yarn

### Instalación

```sh
# Clonar el repositorio
git clone <repository-url>
cd gestiondehoras

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Supabase

# Ejecutar en desarrollo
npm run dev
```

### Scripts Disponibles

```sh
# Desarrollo con hot-reload
npm run dev

# Build para producción
npm run build

# Verificación de tipos
npm run type-check

# Linting
npm run lint

# Preview de build
npm run preview
```

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes Vue reutilizables
│   ├── ui/             # Componentes de interfaz base
│   ├── UserManagement.vue    # Gestión de usuarios
│   ├── ProjectManagement.vue # Gestión de proyectos
│   └── TimeSheet.vue         # Registro de horas
├── services/           # Servicios de API y lógica de negocio
├── types/              # Definiciones de tipos TypeScript
├── utils/              # Utilidades y helpers
└── App.vue             # Componente principal
```

## 🔧 Configuración

### Variables de Entorno

Crear archivo `.env` con:

```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
```

### Base de Datos

El proyecto utiliza Supabase con las siguientes tablas principales:
- `user_profiles`: Perfiles de usuario con estados
- `projects`: Proyectos del sistema
- `time_entries`: Registros de horas
- `project_assignments`: Asignaciones usuario-proyecto
- `roles`: Roles del sistema

## 🧪 Pruebas

```sh
# Ejecutar pruebas de base de datos
npm run test:db

# Verificar conectividad
npm run test:connection
```

## 📚 Documentación

- **`MIGRATION_SUMMARY.md`**: Resumen de la migración completada
- **`MIGRATION_PLAN.md`**: Plan detallado de migración
- **`MIGRATION_STATUS.md`**: Estado actual de la migración

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto es privado y desarrollado para la Universidad UNIACC.

## 📞 Soporte

Para soporte técnico o preguntas sobre la migración:
- Revisar documentación en `MIGRATION_SUMMARY.md`
- Consultar el equipo de desarrollo
- Verificar logs de la aplicación

---

**Estado del Proyecto**: ✅ Activo y Funcional  
**Última Actualización**: $(date)  
**Versión**: 1.0.0  
**Equipo**: Desarrollo UNIACC
