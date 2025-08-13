<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold text-gray-900">Gestión de Usuarios</h2>
      <Button @click="openCreateModal" class="bg-blue-600 hover:bg-blue-700">
        <Plus class="w-4 h-4 mr-2" />
        Nuevo Usuario
      </Button>
    </div>

    <!-- Filtros -->
    <div class="flex space-x-4">
      <select
        v-model="roleFilter"
        class="block border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Todos los roles</option>
        <option value="admin">Administradores</option>
        <option value="jp">Jefes de Proyecto</option>
        <option value="director">Directores</option>
      </select>

      <select
        v-model="statusFilter"
        class="block border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Todos los estados</option>
        <option value="true">Activos</option>
        <option value="false">Inactivos</option>
      </select>
    </div>

    <!-- Lista de Usuarios -->
    <div class="bg-white shadow rounded-lg overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Usuario
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ID Empleado
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rol
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Departamento
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="user in filteredUsers" :key="user.id">
            <td class="px-6 py-4 whitespace-nowrap">
              <div>
                <div class="text-sm font-medium text-gray-900">{{ user.full_name }}</div>
                <div class="text-sm text-gray-500">{{ user.email }}</div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
              {{ user.employee_id || '-' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <RoleBadge :role="user.role?.name || 'sin-rol'" />
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ user.department || '-' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span 
                :class="{
                  'bg-green-100 text-green-800': user.is_active,
                  'bg-yellow-100 text-yellow-800': !user.is_active
                }"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
              >
                {{ getUserStatusLabel(user) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <div class="flex justify-end space-x-2">
                <Button
                  @click="editUser(user)"
                  variant="ghost"
                  size="sm"
                  class="text-blue-600 hover:text-blue-900"
                >
                  <Edit class="w-4 h-4" />
                </Button>
                
                <!-- Botones de estado -->
                <Button
                  v-if="user.is_active"
                  @click="blockUser(user)"
                  variant="ghost"
                  size="sm"
                  class="text-yellow-600 hover:text-yellow-900"
                  title="Bloquear usuario"
                >
                  <UserX class="w-4 h-4" />
                </Button>
                
                <Button
                  v-if="!user.is_active"
                  @click="activateUser(user)"
                  variant="ghost"
                  size="sm"
                  class="text-green-600 hover:text-green-900"
                  title="Activar usuario"
                >
                  <UserCheck class="w-4 h-4" />
                </Button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Estado vacío -->
      <div v-if="filteredUsers.length === 0" class="text-center py-8">
        <Users class="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 class="text-lg font-semibold text-gray-900 mb-2">No hay usuarios</h3>
        <p class="text-gray-500 mb-4">
          {{ users.length === 0 ? 'Aún no hay usuarios en el sistema.' : 'No hay usuarios que coincidan con los filtros.' }}
        </p>
        <Button @click="openCreateModal" v-if="users.length === 0">
          <Plus class="w-4 h-4 mr-2" />
          Crear primer usuario
        </Button>
      </div>
    </div>

    <!-- Modal de Crear/Editar -->
    <UserModal
      v-if="showModal"
      :user="selectedUser"
      :available-roles="availableRoles"
      @close="closeModal"
      @save="handleSave"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Plus, Edit, Users, UserX, UserCheck } from 'lucide-vue-next'
import { userService } from '@/services/userService'
import type { UserProfile, Role } from '@/types/projects'
import { UserStatus, USER_STATUS_LABELS } from '@/types/index'
import Button from '@/components/ui/button/Button.vue'
import UserModal from './UserModal.vue'
import RoleBadge from './RoleBadge.vue'

const users = ref<UserProfile[]>([])
const availableRoles = ref<Role[]>([])
const showModal = ref(false)
const selectedUser = ref<UserProfile | null>(null)
const roleFilter = ref('')
const statusFilter = ref('')

const filteredUsers = computed(() => {
  let filtered = users.value

  if (roleFilter.value) {
    filtered = filtered.filter(u => u.role?.name === roleFilter.value)
  }

  if (statusFilter.value !== '') {
    const isActive = statusFilter.value === 'true'
    filtered = filtered.filter(u => u.is_active === isActive)
  }

  return filtered
})

const loadUsers = async () => {
  try {
    // Cargar todos los usuarios incluyendo los bloqueados/eliminados
    users.value = await userService.getAllUsersWithStatus()
  } catch (error) {
    console.error('Error loading users:', error)
  }
}

const loadRoles = async () => {
  try {
    // Obtener roles desde la tabla roles
    const { data, error } = await userService.getAllRoles()
    if (error) throw error
    availableRoles.value = (data || []) as Role[]
  } catch (error) {
    console.error('Error loading roles:', error)
  }
}

const openCreateModal = () => {
  selectedUser.value = null
  showModal.value = true
}

const editUser = (user: UserProfile) => {
  selectedUser.value = user
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedUser.value = null
}

const handleSave = async () => {
  await loadUsers()
  closeModal()
}

// ========== GESTIÓN DE ESTADOS ==========

const changeUserStatus = async (user: UserProfile, newStatus: UserStatus, reason?: string) => {
  const statusLabel = USER_STATUS_LABELS[newStatus]
  const confirmed = confirm(
    `¿Estás seguro de cambiar el estado de ${user.full_name} a "${statusLabel}"?${reason ? `\n\nRazón: ${reason}` : ''}`
  )
  
  if (!confirmed) return

  try {
    await userService.changeUserStatus(user.id, newStatus)
    await loadUsers()
    console.log(`✅ Estado de ${user.full_name} cambiado a: ${statusLabel}`)
  } catch (error) {
    console.error(`Error cambiando estado a ${statusLabel}:`, error)
    alert(`Error al cambiar el estado del usuario: ${error}`)
  }
}

const activateUser = (user: UserProfile) => {
  changeUserStatus(user, UserStatus.ACTIVE, 'Usuario reactivado desde gestión')
}

const blockUser = (user: UserProfile) => {
  const reason = prompt('Razón para bloquear el usuario (opcional):')
  if (reason !== null) { // Solo proceder si no canceló
    changeUserStatus(user, UserStatus.BLOCKED, reason || 'Usuario bloqueado desde gestión')
  }
}

const deleteUser = (user: UserProfile) => {
  const reason = prompt('Razón para eliminar el usuario (opcional):')
  if (reason !== null) { // Solo proceder si no canceló
    changeUserStatus(user, UserStatus.DELETED, reason || 'Usuario eliminado desde gestión')
  }
}

// Obtener label del estado
const getUserStatusLabel = (user: UserProfile): string => {
  if (user.is_active) {
    return USER_STATUS_LABELS[UserStatus.ACTIVE]
  } else {
    return USER_STATUS_LABELS[UserStatus.BLOCKED]
  }
}

onMounted(() => {
  loadUsers()
  loadRoles()
})
</script>
