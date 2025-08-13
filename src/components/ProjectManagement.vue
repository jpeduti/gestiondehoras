<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Plus, Edit, Trash2 } from 'lucide-vue-next'
import { projectService } from '@/services/projectService'
import type { ProjectWithAssignments } from '@/types/projects'
import Button from '@/components/ui/button/Button.vue'
import ProjectModal from './ProjectModal.vue'
import StatusBadge from './StatusBadge.vue'

const projects = ref<ProjectWithAssignments[]>([])
const availableJPs = ref<Array<{ id: string; full_name: string; email: string }>>([])
const showModal = ref(false)
const selectedProject = ref<ProjectWithAssignments | null>(null)
const statusFilter = ref('')

const filteredProjects = computed(() => {
  if (!statusFilter.value) return projects.value
  return projects.value.filter(p => p.status === statusFilter.value)
})

const loadProjects = async () => {
  try {
    projects.value = await projectService.getProjects()
  } catch (error) {
    console.error('Error loading projects:', error)
  }
}

const loadAvailableJPs = async () => {
  try {
    availableJPs.value = await projectService.getAvailableJPs()
  } catch (error) {
    console.error('Error loading JPs:', error)
  }
}

const openCreateModal = () => {
  selectedProject.value = null
  showModal.value = true
}

const editProject = (project: ProjectWithAssignments) => {
  selectedProject.value = project
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedProject.value = null
}

const handleSave = async () => {
  await loadProjects()
  closeModal()
}

const deleteProject = async (id: string) => {
  if (confirm('¿Estás seguro de eliminar este proyecto?')) {
    try {
      await projectService.deleteProject(id)
      await loadProjects()
    } catch (error) {
      console.error('Error deleting project:', error)
    }
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('es-ES')
}

onMounted(() => {
  loadProjects()
  loadAvailableJPs()
})
</script>


<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold text-gray-900">Gestión de Proyectos</h2>
      <Button @click="openCreateModal" class="bg-blue-600 hover:bg-blue-700">
        <Plus class="w-4 h-4 mr-2" />
        Nuevo Proyecto
      </Button>
    </div>

    <!-- Filtros -->
    <div class="flex space-x-4">
      <select
        v-model="statusFilter"
        class="block border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Todos los estados</option>
        <option value="active">Activos</option>
        <option value="paused">Pausados</option>
        <option value="completed">Completados</option>
        <option value="cancelled">Cancelados</option>
      </select>
    </div>

    <!-- Lista de Proyectos -->
    <div class="bg-white shadow rounded-lg overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Proyecto
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Código
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              JPs Asignados
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fechas
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="project in filteredProjects" :key="project.id">
            <td class="px-6 py-4 whitespace-nowrap">
              <div>
                <div class="text-sm font-medium text-gray-900">{{ project.name }}</div>
                <div class="text-sm text-gray-500">{{ project.description }}</div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
              {{ project.code }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <StatusBadge :status="project.status" />
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex -space-x-1">
                <span class="text-sm text-gray-600">
                  {{ project.assignments?.length || 0 }} JP(s)
                </span>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              <div v-if="project.start_date">{{ formatDate(project.start_date) }}</div>
              <div v-if="project.end_date" class="text-gray-500">
                {{ formatDate(project.end_date) }}
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <Button
                @click="editProject(project)"
                variant="ghost"
                size="sm"
                class="mr-2"
              >
                <Edit class="w-4 h-4" />
              </Button>
              <Button
                @click="deleteProject(project.id)"
                variant="ghost"
                size="sm"
                class="text-red-600 hover:text-red-900"
              >
                <Trash2 class="w-4 h-4" />
              </Button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal de Crear/Editar -->
    <ProjectModal
      v-if="showModal"
      :project="selectedProject"
      :available-jps="availableJPs"
      @close="closeModal"
      @save="handleSave"
    />
  </div>
</template>
