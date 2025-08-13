<template>
  <span :class="badgeClasses">
    {{ statusIcon }} {{ statusText }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  status: 'active' | 'paused' | 'completed' | 'cancelled'
}

const props = defineProps<Props>()

const statusText = computed(() => {
  const texts = {
    active: 'Activo',
    paused: 'Pausado',
    completed: 'Completado',
    cancelled: 'Cancelado'
  }
  return texts[props.status]
})

const statusIcon = computed(() => {
  const icons = {
    active: '🟢',
    paused: '🟡',
    completed: '🔵',
    cancelled: '🔴'
  }
  return icons[props.status]
})

const badgeClasses = computed(() => {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'

  const statusClasses = {
    active: 'bg-green-100 text-green-800 border border-green-200',
    paused: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    completed: 'bg-blue-100 text-blue-800 border border-blue-200',
    cancelled: 'bg-red-100 text-red-800 border border-red-200'
  }

  return `${baseClasses} ${statusClasses[props.status]}`
})
</script>
