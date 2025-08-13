<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Clock, Users, FolderOpen, BarChart3, Construction } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import ProjectManagement from './ProjectManagement.vue'
import UserManagement from './UserManagement.vue'
import TimeSheet from './TimeSheet.vue'
import { seedService } from '@/services/seedService'
import { testDatabaseConnection, testProjectManagement } from '@/utils/testDatabase'

interface Props {
  activeSection: string
  userRole: string
  user: {
    email: string
    id: string
  }
}

const props = defineProps<Props>()

// Estado para las pruebas
const isTestingDatabase = ref(false)
const isTestingProjects = ref(false)
const isClearingData = ref(false)
const isCheckingSystem = ref(false)
const isTestingUserStatus = ref(false)
const isDemonstratingUserState = ref(false)
const testResults = ref<string[]>([])

// Función para probar la conectividad de la base de datos
const testDatabase = async () => {
  isTestingDatabase.value = true
  testResults.value = []

  // Capturar logs en un array
  const originalLog = console.log
  const originalError = console.error
  const originalWarn = console.warn

  console.log = (...args) => {
    testResults.value.push(args.join(' '))
    originalLog(...args)
  }
  console.error = (...args) => {
    testResults.value.push('❌ ' + args.join(' '))
    originalError(...args)
  }
  console.warn = (...args) => {
    testResults.value.push('⚠️ ' + args.join(' '))
    originalWarn(...args)
  }

  try {
    const result = await testDatabaseConnection()
    if (result) {
      testResults.value.push('🎉 ¡Conectividad exitosa!')
    } else {
      testResults.value.push('❌ Falló la prueba de conectividad')
    }
  } catch (error) {
    testResults.value.push('💥 Error inesperado: ' + String(error))
  } finally {
    // Restaurar console
    console.log = originalLog
    console.error = originalError
    console.warn = originalWarn
    isTestingDatabase.value = false
  }
}

// Función para probar la gestión de proyectos
const testProjectCreation = async () => {
  isTestingProjects.value = true
  testResults.value = []

  // Capturar logs
  const originalLog = console.log
  const originalError = console.error
  const originalWarn = console.warn

  console.log = (...args) => {
    testResults.value.push(args.join(' '))
    originalLog(...args)
  }
  console.error = (...args) => {
    testResults.value.push('❌ ' + args.join(' '))
    originalError(...args)
  }
  console.warn = (...args) => {
    testResults.value.push('⚠️ ' + args.join(' '))
    originalWarn(...args)
  }

  try {
    const result = await testProjectManagement()
    if (result) {
      testResults.value.push('🎉 ¡Gestión de proyectos lista!')
    } else {
      testResults.value.push('❌ Falló la prueba de proyectos')
    }
  } catch (error) {
    testResults.value.push('💥 Error inesperado: ' + String(error))
  } finally {
    // Restaurar console
    console.log = originalLog
    console.error = originalError
    console.warn = originalWarn
    isTestingProjects.value = false
  }
}

// Función para limpiar datos de prueba
const clearTestData = async () => {
  if (!confirm('¿Estás seguro de que quieres eliminar todos los datos de prueba? Esta acción no se puede deshacer.')) {
    return
  }

  isClearingData.value = true
  testResults.value = []

  // Capturar logs
  const originalLog = console.log
  const originalError = console.error
  const originalWarn = console.warn

  console.log = (...args) => {
    testResults.value.push(args.join(' '))
    originalLog(...args)
  }
  console.error = (...args) => {
    testResults.value.push('❌ ' + args.join(' '))
    originalError(...args)
  }
  console.warn = (...args) => {
    testResults.value.push('⚠️ ' + args.join(' '))
    originalWarn(...args)
  }

  try {
    const result = await seedService.clearTestData()
    if (result) {
      testResults.value.push('🎉 ¡Datos eliminados exitosamente!')
    } else {
      testResults.value.push('❌ Falló la limpieza de datos')
    }
  } catch (error) {
    testResults.value.push('💥 Error inesperado: ' + String(error))
  } finally {
    // Restaurar console
    console.log = originalLog
    console.error = originalError
    console.warn = originalWarn
    isClearingData.value = false
  }
}

// Función para verificar el estado del sistema
const checkSystemStatus = async () => {
  isCheckingSystem.value = true
  testResults.value = []
  
  // Capturar logs
  const originalLog = console.log
  const originalError = console.error
  const originalWarn = console.warn
  
  console.log = (...args) => {
    testResults.value.push(args.join(' '))
    originalLog(...args)
  }
  console.error = (...args) => {
    testResults.value.push('❌ ' + args.join(' '))
    originalError(...args)
  }
  console.warn = (...args) => {
    testResults.value.push('⚠️ ' + args.join(' '))
    originalWarn(...args)
  }

  try {
    const result = await seedService.checkSystemStatus()
    if (result) {
      testResults.value.push('🎉 ¡Verificación completada!')
    } else {
      testResults.value.push('❌ Falló la verificación del sistema')
    }
  } catch (error) {
    testResults.value.push('💥 Error inesperado: ' + String(error))
  } finally {
    // Restaurar console
    console.log = originalLog
    console.error = originalError
    console.warn = originalWarn
    isCheckingSystem.value = false
  }
}

// Función para probar gestión de estados de usuario
const testUserStatusManagement = async () => {
  isTestingUserStatus.value = true
  testResults.value = []
  
  // Capturar logs
  const originalLog = console.log
  const originalError = console.error
  const originalWarn = console.warn
  
  console.log = (...args) => {
    testResults.value.push(args.join(' '))
    originalLog(...args)
  }
  console.error = (...args) => {
    testResults.value.push('❌ ' + args.join(' '))
    originalError(...args)
  }
  console.warn = (...args) => {
    testResults.value.push('⚠️ ' + args.join(' '))
    originalWarn(...args)
  }

  try {
    const result = await seedService.testUserStatusManagement()
    if (result) {
      testResults.value.push('🎉 ¡Gestión de estados probada exitosamente!')
    } else {
      testResults.value.push('❌ Falló la prueba de gestión de estados')
    }
  } catch (error) {
    testResults.value.push('💥 Error inesperado: ' + String(error))
  } finally {
    // Restaurar console
    console.log = originalLog
    console.error = originalError
    console.warn = originalWarn
    isTestingUserStatus.value = false
  }
}

// Función para demostrar ventajas de user_state vs is_active
const demonstrateUserStateAdvantages = async () => {
  isDemonstratingUserState.value = true
  testResults.value = []
  
  // Capturar logs
  const originalLog = console.log
  const originalError = console.error
  const originalWarn = console.warn
  
  console.log = (...args) => {
    testResults.value.push(args.join(' '))
    originalLog(...args)
  }
  console.error = (...args) => {
    testResults.value.push('❌ ' + args.join(' '))
    originalError(...args)
  }
  console.warn = (...args) => {
    testResults.value.push('⚠️ ' + args.join(' '))
    originalWarn(...args)
  }

  try {
    const result = await seedService.demonstrateUserStateAdvantages()
    if (result) {
      testResults.value.push('🎉 ¡Demostración completada!')
    } else {
      testResults.value.push('❌ Falló la demostración')
    }
  } catch (error) {
    testResults.value.push('💥 Error inesperado: ' + String(error))
  } finally {
    // Restaurar console
    console.log = originalLog
    console.error = originalError
    console.warn = originalWarn
    isDemonstratingUserState.value = false
  }
}

// Contenido por sección
const getSectionContent = (section: string, role: string) => {
  const sections: Record<string, {
    title: string
    subtitle: string
    icon: typeof CheckCircle
    content: string
  }> = {
    dashboard: {
      title: 'Dashboard',
      subtitle: `Vista general para ${role}`,
      icon: CheckCircle,
      content: 'dashboard'
    },
    users: {
      title: 'Gestión de Usuarios',
      subtitle: 'Administrar usuarios del sistema',
      icon: Users,
      content: 'users'
    },
    projects: {
      title: 'Gestión de Proyectos',
      subtitle: 'Administrar proyectos',
      icon: FolderOpen,
      content: 'projects'
    },
    timesheet: {
      title: 'Registro de Horas',
      subtitle: 'Registra tus horas trabajadas',
      icon: Clock,
      content: 'timesheet'
    },
    'my-projects': {
      title: 'Mis Proyectos',
      subtitle: 'Proyectos asignados a mí',
      icon: FolderOpen,
      content: 'my-projects'
    },
    reports: {
      title: 'Reportes',
      subtitle: 'Reportes y estadísticas del sistema',
      icon: BarChart3,
      content: 'reports'
    },
    'my-reports': {
      title: 'Mis Reportes',
      subtitle: 'Mi historial de horas',
      icon: BarChart3,
      content: 'my-reports'
    },
    'team-reports': {
      title: 'Reportes de Equipo',
      subtitle: 'Reportes del área',
      icon: BarChart3,
      content: 'team-reports'
    },
    assignments: {
      title: 'Asignaciones',
      subtitle: 'Asignar JPs a proyectos',
      icon: Users,
      content: 'assignments'
    },
    settings: {
      title: 'Configuración',
      subtitle: 'Configuración del sistema',
      icon: CheckCircle,
      content: 'settings'
    }
  }

  return sections[section] || sections.dashboard
}

const currentSection = computed(() => getSectionContent(props.activeSection, props.userRole))

const initializeTestData = async () => {
  try {
    await seedService.initializeTestData()
    alert('Datos de prueba inicializados correctamente')
  } catch (error) {
    console.error('Error initializing test data:', error)
    alert('Error al inicializar datos de prueba')
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header de la sección -->
    <div class="flex items-center gap-3">
      <component :is="currentSection.icon" class="h-8 w-8 text-primary" />
      <div>
        <h1 class="text-3xl font-bold tracking-tight">{{ currentSection.title }}</h1>
        <p class="text-muted-foreground">{{ currentSection.subtitle }}</p>
      </div>
    </div>

    <!-- Contenido según la sección -->
    <div v-if="activeSection === 'dashboard'" class="space-y-6">
      <!-- Pruebas del Sistema -->
      <Card class="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle class="text-blue-900">🧪 Pruebas del Sistema</CardTitle>
          <CardDescription class="text-blue-700">
            Verifica que la base de datos esté lista para usar
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="flex gap-3 flex-wrap">
            <Button
              @click="testDatabase"
              :disabled="isTestingDatabase"
              variant="outline"
              class="border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              {{ isTestingDatabase ? 'Probando...' : '🧪 Probar Conectividad' }}
            </Button>
            <Button
              @click="testProjectCreation"
              :disabled="isTestingProjects"
              variant="outline"
              class="border-green-300 text-green-700 hover:bg-green-100"
            >
              {{ isTestingProjects ? 'Probando...' : '📁 Probar Proyectos' }}
            </Button>
            <Button
              @click="clearTestData"
              :disabled="isClearingData"
              variant="outline"
              class="border-red-300 text-red-700 hover:bg-red-100"
            >
              {{ isClearingData ? 'Limpiando...' : '🗑️ Limpiar Datos' }}
            </Button>
            <Button
              @click="checkSystemStatus"
              :disabled="isCheckingSystem"
              variant="outline"
              class="border-purple-300 text-purple-700 hover:bg-purple-100"
            >
              {{ isCheckingSystem ? 'Verificando...' : '🔍 Ver Estado' }}
            </Button>
            <Button
              @click="testUserStatusManagement"
              :disabled="isTestingUserStatus"
              variant="outline"
              class="border-orange-300 text-orange-700 hover:bg-orange-100"
            >
              {{ isTestingUserStatus ? 'Probando...' : '👥 Probar Estados' }}
            </Button>
          </div>
          
          <!-- Sección especial para análisis de migración -->
          <div class="border-t pt-4">
            <h4 class="text-sm font-semibold text-blue-900 mb-2">🔄 Análisis de Migración</h4>
            <Button
              @click="demonstrateUserStateAdvantages"
              :disabled="isDemonstratingUserState"
              variant="outline"
              class="border-indigo-300 text-indigo-700 hover:bg-indigo-100"
            >
              {{ isDemonstratingUserState ? 'Analizando...' : '📊 is_active vs user_state' }}
            </Button>
          </div>

          <!-- Resultado de las pruebas -->
          <div v-if="testResults.length > 0" class="p-3 bg-white border rounded max-h-32 overflow-y-auto">
            <div v-for="(result, index) in testResults" :key="index" class="text-sm font-mono">
              {{ result }}
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Dashboard Content -->
      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader class="pb-2">
            <CardTitle class="text-sm">Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold text-green-600">Activo</div>
            <p class="text-xs text-muted-foreground">Sistema funcionando</p>
          </CardContent>
        </Card>

        <Card v-if="userRole === 'jp'">
          <CardHeader class="pb-2">
            <CardTitle class="text-sm">Horas esta semana</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">0 / 40</div>
            <p class="text-xs text-muted-foreground">Horas registradas</p>
          </CardContent>
        </Card>

        <Card v-if="userRole === 'admin'">
          <CardHeader class="pb-2">
            <CardTitle class="text-sm">Usuarios Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">1</div>
            <p class="text-xs text-muted-foreground">En el sistema</p>
          </CardContent>
        </Card>
      </div>

      <!-- Welcome Message -->
      <Card>
        <CardHeader>
          <CardTitle>¡Bienvenido, {{ user.email }}!</CardTitle>
          <CardDescription>
            <template v-if="userRole === 'admin'">
              Como administrador, tienes acceso completo al sistema. Puedes gestionar usuarios, proyectos y ver todos los reportes.
            </template>
            <template v-else-if="userRole === 'jp'">
              Como Jefe de Proyecto, puedes registrar tus horas trabajadas y ver tus proyectos asignados.
            </template>
            <template v-else-if="userRole === 'director'">
              Como Director, puedes supervisar proyectos y ver reportes de tu área.
            </template>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div class="text-sm text-muted-foreground mb-4">
            <p>✅ Autenticación exitosa</p>
            <p>✅ Menú personalizado cargado</p>
            <p>✅ Dashboard funcional</p>
            <p>✅ Gestión de Proyectos</p>
            <p>✅ Gestión de Usuarios</p>
          </div>

          <!-- Información de acceso admin -->
          <div v-if="userRole !== 'admin'" class="bg-blue-50 p-3 rounded-md border border-blue-200 mb-4">
            <h4 class="text-sm font-medium text-blue-900 mb-1">💡 Acceso de Administrador</h4>
            <p class="text-xs text-blue-700">
              Para acceder como administrador, usa un email que contenga "admin" (ej: admin@uniacc.cl)
            </p>
          </div>

          <!-- Botón para inicializar datos de prueba (solo admin) -->
          <div v-if="userRole === 'admin'" class="border-t pt-4">
            <Button @click="initializeTestData" variant="outline" size="sm">
              Inicializar Datos de Prueba
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Gestión de Proyectos -->
    <div v-else-if="activeSection === 'projects'" class="space-y-6">
      <ProjectManagement />
    </div>

    <!-- Gestión de Usuarios -->
    <div v-else-if="activeSection === 'users'" class="space-y-6">
      <UserManagement />
    </div>

    <!-- Registro de Horas -->
    <div v-else-if="activeSection === 'timesheet'" class="space-y-6">
      <TimeSheet :user-id="user.id" />
    </div>

    <!-- Otras secciones - placeholder por ahora -->
    <div v-else class="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <Construction class="h-5 w-5" />
            En Desarrollo
          </CardTitle>
          <CardDescription>
            Esta sección está en desarrollo para el MVP
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div class="text-center py-8">
            <Construction class="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 class="text-lg font-semibold mb-2">{{ currentSection.title }}</h3>
            <p class="text-muted-foreground mb-4">
              Esta funcionalidad se implementará en las próximas iteraciones del MVP.
            </p>
            <Button variant="outline" size="sm">
              Volver al Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
