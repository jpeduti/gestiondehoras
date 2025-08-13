<template>
  <span :class="badgeClasses">
    {{ statusText }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { UserStatus, USER_STATUS_LABELS, USER_STATUS_COLORS } from '@/types/index'

interface Props {
  status: UserStatus
}

const props = defineProps<Props>()

const statusText = computed(() => {
  return USER_STATUS_LABELS[props.status] || 'Desconocido'
})

const badgeClasses = computed(() => {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'

  const statusClasses = {
    [UserStatus.BLOCKED]: 'bg-yellow-100 text-yellow-800',
    [UserStatus.ACTIVE]: 'bg-green-100 text-green-800',
    [UserStatus.DELETED]: 'bg-red-100 text-red-800',
    [UserStatus.PENDING]: 'bg-blue-100 text-blue-800'
  }

  return `${baseClasses} ${statusClasses[props.status] || 'bg-gray-100 text-gray-800'}`
})
</script>
