<script setup lang="ts">
// Script básico para la prueba
</script>

<template>
  <div id="app" class="min-h-screen bg-white text-gray-900">
    <!-- Header -->
    <header class="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur">
      <div class="container flex h-16 max-w-screen-2xl items-center px-4 mx-auto">
        <h1 class="text-xl font-bold">
          Gestión de Horas UNIACC
        </h1>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8">
      <div class="space-y-8">
        <!-- Hero Section -->
        <div class="text-center">
          <h2 class="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Sistema de Gestión de Horas
          </h2>
          <p class="mt-6 text-lg leading-8 text-gray-600">
            MVP para UNIACC - Área de Transformación Digital
          </p>
        </div>

        <!-- Status Card -->
        <div class="mx-auto max-w-2xl rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 class="text-lg font-semibold mb-4 text-gray-900">
            ✅ Tailwind CSS 4 Funcionando
          </h3>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div class="flex items-center gap-2">
              <div class="h-2 w-2 bg-green-500 rounded-full"></div>
              <span>Vue 3 + TypeScript</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="h-2 w-2 bg-green-500 rounded-full"></div>
              <span>Tailwind CSS 4</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="h-2 w-2 bg-green-500 rounded-full"></div>
              <span>Supabase instalado</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="h-2 w-2 bg-orange-500 rounded-full"></div>
              <span>shadcn/ui (siguiente)</span>
            </div>
          </div>
        </div>

        <!-- Test Buttons -->
        <div class="text-center space-y-4">
          <button class="inline-flex items-center justify-center rounded-md bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
            Botón de Prueba Tailwind CSS 4
          </button>

          <div class="flex gap-2 justify-center">
            <button class="px-4 py-2 bg-gray-100 text-gray-900 rounded-md hover:bg-gray-200 transition-colors">
              Secundario
            </button>
            <button class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
              Éxito
            </button>
            <button class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
              Peligro
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
