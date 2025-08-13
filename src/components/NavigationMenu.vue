<script setup lang="ts">
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  FolderOpen,
  Clock,
  BarChart3,
  Settings,
  Home,
  UserCheck,
  PlusCircle,
  ChevronDown
} from 'lucide-vue-next'
import { cn } from '@/lib/utils'
import { computed } from 'vue'

interface Props {
  userRole?: string
  activeSection?: string
}

interface Emits {
  (e: 'navigate', section: string): void
}

const props = withDefaults(defineProps<Props>(), {
  userRole: 'jp',
  activeSection: 'dashboard'
})

const emit = defineEmits<Emits>()

// Definir estructura de menús por rol
const menuStructure = {
  admin: {
    primary: [
      { id: 'dashboard', label: 'Dashboard', icon: Home }
    ],
    sections: [
      {
        title: 'Administración',
        items: [
          { id: 'users', label: 'Usuarios', icon: Users, description: 'Gestionar usuarios y roles' },
          { id: 'projects', label: 'Proyectos', icon: FolderOpen, description: 'Administrar proyectos' },
          { id: 'settings', label: 'Configuración', icon: Settings, description: 'Configuración del sistema' }
        ]
      },
      {
        title: 'Reportes',
        items: [
          { id: 'reports', label: 'Reportes Generales', icon: BarChart3, description: 'Estadísticas del sistema' },
          { id: 'analytics', label: 'Analytics', icon: BarChart3, description: 'Análisis avanzado' }
        ]
      }
    ]
  },
  jp: {
    primary: [
      { id: 'dashboard', label: 'Dashboard', icon: Home }
    ],
    sections: [
      {
        title: 'Mi Trabajo',
        items: [
          { id: 'timesheet', label: 'Registro de Horas', icon: Clock, description: 'Registrar horas trabajadas' },
          { id: 'my-projects', label: 'Mis Proyectos', icon: FolderOpen, description: 'Proyectos asignados' }
        ]
      },
      {
        title: 'Reportes',
        items: [
          { id: 'my-reports', label: 'Mis Reportes', icon: BarChart3, description: 'Mi historial de horas' }
        ]
      }
    ]
  },
  director: {
    primary: [
      { id: 'dashboard', label: 'Dashboard', icon: Home }
    ],
    sections: [
      {
        title: 'Gestión',
        items: [
          { id: 'projects', label: 'Proyectos', icon: FolderOpen, description: 'Supervisar proyectos' },
          { id: 'assignments', label: 'Asignaciones', icon: UserCheck, description: 'Asignar JPs a proyectos' }
        ]
      },
      {
        title: 'Reportes',
        items: [
          { id: 'team-reports', label: 'Reportes de Equipo', icon: BarChart3, description: 'Reportes del área' }
        ]
      }
    ]
  }
}

const currentMenu = computed(() => {
  return menuStructure[props.userRole as keyof typeof menuStructure] || menuStructure.jp
})

const handleNavigation = (sectionId: string) => {
  emit('navigate', sectionId)
}
</script>

<template>
  <div class="w-full">
    <!-- Header del menú -->
    <div class="mb-6 p-4 bg-muted/50 rounded-lg">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="font-semibold">Menú Principal</h3>
          <p class="text-sm text-muted-foreground">
            Rol actual
          </p>
        </div>
        <Badge variant="secondary" class="capitalize">
          {{ userRole }}
        </Badge>
      </div>
    </div>

    <!-- Navigation Menu -->
    <NavigationMenu orientation="vertical" class="w-full">
      <NavigationMenuList class="flex-col space-x-0 space-y-1 w-full">

        <!-- Items principales (Dashboard) -->
        <NavigationMenuItem
          v-for="item in currentMenu.primary"
          :key="item.id"
          class="w-full"
        >
          <NavigationMenuLink
            @click="handleNavigation(item.id)"
            :class="cn(
              'group inline-flex h-10 w-full items-center justify-start rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
              activeSection === item.id && 'bg-accent text-accent-foreground'
            )"
          >
            <component :is="item.icon" class="mr-2 h-4 w-4" />
            {{ item.label }}
          </NavigationMenuLink>
        </NavigationMenuItem>

        <!-- Secciones agrupadas -->
        <NavigationMenuItem
          v-for="section in currentMenu.sections"
          :key="section.title"
          class="w-full"
        >
          <NavigationMenuTrigger class="w-full justify-between">
            {{ section.title }}
            <ChevronDown class="h-4 w-4" />
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div class="w-80 p-4">
              <div class="grid gap-3">
                <div class="text-sm font-medium text-muted-foreground mb-2">
                  {{ section.title }}
                </div>
                <div
                  v-for="item in section.items"
                  :key="item.id"
                  @click="handleNavigation(item.id)"
                  :class="cn(
                    'group grid h-auto w-full items-center justify-start gap-1 rounded-md bg-background p-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
                    activeSection === item.id && 'bg-accent text-accent-foreground'
                  )"
                >
                  <div class="flex items-center gap-2">
                    <component :is="item.icon" class="h-4 w-4" />
                    <div class="text-sm font-medium">{{ item.label }}</div>
                  </div>
                  <div class="text-xs text-muted-foreground">
                    {{ item.description }}
                  </div>
                </div>
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

      </NavigationMenuList>
    </NavigationMenu>

    <!-- Info del rol -->
    <div class="mt-6 p-3 bg-primary/5 rounded-md border border-primary/20">
      <div class="flex items-center gap-2 mb-2">
        <div class="h-2 w-2 bg-primary rounded-full"></div>
        <span class="text-sm font-medium">Permisos activos</span>
      </div>
      <p class="text-xs text-muted-foreground">
        <template v-if="userRole === 'admin'">
          👑 Acceso completo - Gestión total del sistema
        </template>
        <template v-else-if="userRole === 'jp'">
          ⏰ Registro de horas - Gestión de proyectos asignados
        </template>
        <template v-else-if="userRole === 'director'">
          📊 Supervisión - Gestión de equipo y proyectos
        </template>
      </p>
    </div>
  </div>
</template>
