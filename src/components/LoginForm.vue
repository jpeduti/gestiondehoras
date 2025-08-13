<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, LogIn, Building2 } from 'lucide-vue-next'

interface Props {
  loading?: boolean
  error?: string
}

interface Emits {
  (e: 'login', credentials: { email: string; password: string }): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: ''
})

const emit = defineEmits<Emits>()

const email = ref('')
const password = ref('')

const handleSubmit = () => {
  if (!email.value || !password.value) return

  emit('login', {
    email: email.value,
    password: password.value
  })
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
          Sistema MVP - Transformación Digital
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
            Accede con tus credenciales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <!-- Error Alert -->
            <Alert v-if="error" variant="destructive">
              <AlertDescription>{{ error }}</AlertDescription>
            </Alert>

            <!-- Email Field -->
            <div class="space-y-2">
              <Label for="email">Email</Label>
              <Input
                id="email"
                v-model="email"
                type="email"
                placeholder="admin@uniacc.cl"
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
              :disabled="loading || !email || !password"
            >
              <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
              {{ loading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
            </Button>
          </form>

          <!-- Demo Info -->
          <div class="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p class="text-sm font-medium text-blue-900 mb-2">
              🧪 Credenciales de prueba
            </p>
            <div class="text-xs text-blue-700 space-y-1">
              <p><strong>Email:</strong> admin@uniacc.cl</p>
              <p><strong>Password:</strong> 123456789</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
