<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import LoadingScreen from '@/components/LoadingScreen.vue'
import LoginForm from '@/components/LoginForm.vue'
import DashboardLayout from '@/components/DashboardLayout.vue'
import { authService, type LoginCredentials } from '@/services/auth'
import type { User } from '@supabase/supabase-js'

// Estado de la aplicación
const user = ref<User | null>(null)
const loading = ref(true)
const loginLoading = ref(false)
const loginError = ref('')

// Determinar rol del usuario (temporal - en producción vendría de la base de datos)
const userRole = computed(() => {
  if (!user.value) return 'jp'

  // Por ahora, determinar rol basado en el email
  const email = user.value.email || ''

  if (email.includes('admin') || email === 'admin@uniacc.cl') {
    return 'admin'
  } else if (email.includes('director')) {
    return 'director'
  } else {
    return 'jp'
  }
})

// Formatear user para el componente
const userFormatted = computed(() => {
  if (!user.value) return null
  return {
    email: user.value.email || '',
    id: user.value.id
  }
})

// Inicializar aplicación
const initApp = async () => {
  try {
    const session = await authService.getSession()
    user.value = session?.user || null

    console.log('App inicializada:', session?.user?.email || 'No autenticado')
  } catch (error) {
    console.error('Error inicializando app:', error)
  } finally {
    loading.value = false
  }
}

// Manejar login
const handleLogin = async (credentials: LoginCredentials) => {
  try {
    loginLoading.value = true
    loginError.value = ''

    const result = await authService.signIn(credentials)
    user.value = result.user

    console.log('✅ Login exitoso:', result.user?.email)
  } catch (error: unknown) {
    loginError.value = (error as Error).message || 'Error al iniciar sesión'
    console.error('❌ Error login:', error)
  } finally {
    loginLoading.value = false
  }
}

// Manejar logout
const handleLogout = async () => {
  try {
    await authService.signOut()
    user.value = null
    console.log('✅ Logout exitoso')
  } catch (error) {
    console.error('❌ Error logout:', error)
  }
}

// Escuchar cambios de autenticación
authService.onAuthStateChange((event, session) => {
  user.value = session?.user || null
  console.log('🔄 Auth cambió:', event, session?.user?.email || 'Desconectado')
})

// Inicializar al montar
onMounted(() => {
  initApp()
})
</script>

<template>
  <div id="app">
    <!-- Estado: Cargando -->
    <LoadingScreen
      v-if="loading"
      message="Inicializando aplicación..."
    />

    <!-- Estado: No autenticado -->
    <LoginForm
      v-else-if="!user"
      :loading="loginLoading"
      :error="loginError"
      @login="handleLogin"
    />

    <!-- Estado: Autenticado -->
    <DashboardLayout
      v-else-if="user && userFormatted"
      :user="userFormatted"
      :user-role="userRole"
      @logout="handleLogout"
    />
  </div>
</template>
