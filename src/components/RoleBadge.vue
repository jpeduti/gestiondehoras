<template>
  <span :class="badgeClasses">
    {{ roleText }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  role: string
}

const props = defineProps<Props>()

const roleText = computed(() => {
  const texts: Record<string, string> = {
    admin: 'Administrador',
    jp: 'Jefe de Proyecto',
    director: 'Director',
    'sin-rol': 'Sin Rol'
  }
  return texts[props.role.toLowerCase()] || props.role
})

const badgeClasses = computed(() => {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'

  const roleClasses: Record<string, string> = {
    admin: 'bg-purple-100 text-purple-800',
    jp: 'bg-blue-100 text-blue-800', 
    director: 'bg-green-100 text-green-800',
    'sin-rol': 'bg-gray-100 text-gray-800'
  }

  const roleClass = roleClasses[props.role.toLowerCase()] || 'bg-gray-100 text-gray-800'
  return `${baseClasses} ${roleClass}`
})
</script>