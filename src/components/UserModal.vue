<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
      <div class="mt-3">
        <h3 class="text-lg font-medium text-gray-900 mb-4">
          {{ isEditing ? 'Editar Usuario' : 'Invitar Nuevo Usuario' }}
        </h3>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- ID Empleado -->
          <div>
            <label class="block text-sm font-medium text-gray-700">ID Empleado</label>
            <input
              v-model="form.employee_id"
              type="text"
              placeholder="Ej: JP001"
              class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- Nombre Completo -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Nombre Completo *</label>
            <input
              v-model="form.full_name"
              type="text"
              required
              class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- Email -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Email *</label>
            <input
              v-model="form.email"
              type="email"
              required
              class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- Rol -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Rol *</label>
            <select
              v-model="form.role_id"
              required
              class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar rol</option>
              <option
                v-for="role in availableRoles"
                :key="role.id"
                :value="role.id"
              >
                {{ role.description }}
              </option>
            </select>
          </div>

          <!-- Departamento -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Departamento</label>
            <input
              v-model="form.department"
              type="text"
              placeholder="Ej: Tecnología"
              class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- Estado (solo en edición) -->
          <div v-if="isEditing">
            <label class="block text-sm font-medium text-gray-700">Estado</label>
            <select
              v-model="form.user_state"
              class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option :value="1">Activo</option>
              <option :value="0">Bloqueado</option>
              <option :value="2">Eliminado</option>
              <option :value="3">Pendiente</option>
            </select>
          </div>

          <!-- Botones -->
          <div class="flex justify-end space-x-3 pt-4">
            <Button type="button" @click="$emit('close')" variant="outline">
              Cancelar
            </Button>
            <Button type="submit" :disabled="loading">
              {{ loading ? 'Guardando...' : 'Guardar' }}
            </Button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { userService } from '@/services/userService'
import type { UserProfile, Role } from '@/types/projects'
import Button from '@/components/ui/button/Button.vue'

interface Props {
  user?: UserProfile | null
  availableRoles: Role[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  save: []
}>()

const loading = ref(false)
const form = ref({
  id: '',
  employee_id: '',
  full_name: '',
  email: '',
  role_id: '',
  department: '',
  user_state: 1
})

const isEditing = computed(() => !!props.user)

const handleSubmit = async () => {
  loading.value = true
  try {
    if (isEditing.value && props.user) {
      // Editar usuario existente
      await userService.updateUserProfile(props.user.id, {
        employee_id: form.value.employee_id,
        full_name: form.value.full_name,
        email: form.value.email,
        role_id: form.value.role_id,
        department: form.value.department,
        user_state: form.value.user_state
      })
    } else {
      // Invitar nuevo usuario (crea perfil pendiente)
      const result = await userService.inviteUser({
        email: form.value.email,
        full_name: form.value.full_name,
        role_id: form.value.role_id,
        department: form.value.department,
        employee_id: form.value.employee_id
      })

      if (!result.success) {
        throw new Error(result.error || 'Error al invitar usuario')
      }

      alert('Usuario invitado exitosamente. Se ha creado una invitación pendiente. El usuario debe registrarse en el sistema para activar su cuenta.')
    }
    emit('save')
  } catch (error) {
    console.error('Error saving user:', error)
    alert('Error al guardar el usuario')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (props.user) {
    form.value = {
      id: props.user.id,
      employee_id: props.user.employee_id || '',
      full_name: props.user.full_name,
      email: props.user.email,
      role_id: props.user.role_id,
      department: props.user.department || '',
      user_state: props.user.user_state || 1
    }
  }
})
</script>
