<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, LogIn, Building2 } from 'lucide-vue-next'
import { supabase } from '@/services/supabase'

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  if (!email.value || !password.value) {
    error.value = 'Por favor completa todos los campos'
    return
  }

  try {
    loading.value = true
    error.value = ''

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value
    })

    if (authError) throw authError

    console.log('✅ Login exitoso:', data.user?.email)
    // El App.vue se encargará de mostrar el dashboard

  } catch (err: any) {
    error.value = err.message || 'Error al iniciar sesión'
    console.error('❌ Error login:', err)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
    <div class="max-w-md w-full">
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="flex justify-center mb-4">
          <Building2 class="h-12 w-12 text-blue-600" />
        </div>
        <h2 class="text-3xl font-bold text-gray-900">
          Gestión de Horas UNIACC
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          Sistema de registro de horas - Transformación Digital
        </p>
      </div>

      <!-- Login Card -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <LogIn class="h-5 w-5" />
            Iniciar Sesión
          </CardTitle>
          <CardDescription>
            Accede con tus credenciales institucionales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form @submit.prevent="handleLogin" class="space-y-4">
            <!-- Error Alert -->
            <Alert v-if="error" variant="destructive">
              <AlertDescription>{{ error }}</AlertDescription>
            </Alert>

            <!-- Email Field -->
            <div class="space-y-2">
              <Label for="email">Email Institucional</Label>
              <Input
                id="email"
                v-model="email"
                type="email"
                placeholder="nombre.apellido@uniacc.cl"
                :disabled="loading"
                required
              />
            </div>

            <!-- Password Field -->
            <div class="space-y-2">
              <Label for="password">Contraseña</Label>
              <Input
                id="password"
                v-model="password"
                type="password"
                placeholder="••••••••"
                :disabled="loading"
                required
              />
            </div>

            <!-- Login Button -->
            <Button
              type="submit"
              class="w-full"
              :disabled="loading"
            >
              <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
              {{ loading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
            </Button>
          </form>

          <!-- Demo Credentials -->
          <div class="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p class="text-sm font-medium text-blue-900 mb-2">
              🧪 Credenciales de prueba (MVP)
            </p>
            <div class="text-xs text-blue-700 space-y-1">
              <p><strong>Email:</strong> admin@uniacc.cl</p>
              <p><strong>Password:</strong> 123456789</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Footer -->
      <div class="mt-8 text-center text-xs text-gray-500">
        Universidad UNIACC - Área de Transformación Digital
      </div>
    </div>
  </div>
</template>
