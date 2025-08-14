<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import LoadingScreen from '@/components/LoadingScreen.vue'
import LoginForm from '@/components/LoginForm.vue'
import DashboardLayout from '@/components/DashboardLayout.vue'
import { authService, type LoginCredentials } from '@/services/auth'
import { supabase } from '@/services/supabase'
import type { User } from '@supabase/supabase-js'

// Estado de la aplicación
const user = ref<User | null>(null)
const loading = ref(true)
const loginLoading = ref(false)
const loginError = ref('')

// Determinar rol del usuario desde la base de datos
const userRole = ref('jp')
const userProfile = ref<{
  id: string
  email: string
  full_name: string
  role: { name: string; description: string | null }
} | null>(null)

// Función para obtener el perfil del usuario
const fetchUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        *,
        role:roles(
          id,
          name,
          description
        )
      `)
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching user profile:', error)
      return
    }

    userProfile.value = data
    userRole.value = data.role?.name || 'jp'
    console.log('👤 Perfil del usuario cargado:', data.role?.name)
  } catch (error) {
    console.error('Error fetching user profile:', error)
  }
}

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

    // Si hay usuario, obtener su perfil
    if (session?.user) {
      await fetchUserProfile(session.user.id)
    }

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

    // Obtener perfil del usuario después del login
    if (result.user) {
      await fetchUserProfile(result.user.id)
    }

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
authService.onAuthStateChange(async (event, session) => {
  user.value = session?.user || null

  // Si hay usuario, obtener su perfil
  if (session?.user) {
    await fetchUserProfile(session.user.id)
  } else {
    userRole.value = 'jp'
    userProfile.value = null
  }

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
