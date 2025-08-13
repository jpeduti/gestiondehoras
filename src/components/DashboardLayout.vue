<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { LogOut, User, Menu } from 'lucide-vue-next'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import NavigationMenu from './NavigationMenu.vue'
import MainContent from './MainContent.vue'

interface Props {
  user: {
    email: string
    id: string
  }
  userRole?: string
}

interface Emits {
  (e: 'logout'): void
}

const props = withDefaults(defineProps<Props>(), {
  userRole: 'jp'
})

const emit = defineEmits<Emits>()

const activeSection = ref('dashboard')
const mobileMenuOpen = ref(false)

const handleLogout = () => {
  emit('logout')
}

const handleNavigation = (section: string) => {
  activeSection.value = section
  mobileMenuOpen.value = false // Cerrar menú móvil al navegar
  console.log('Navegando a:', section)
}
</script>

<template>
  <div class="min-h-screen bg-background">
    <!-- Header -->
    <header class="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <div class="container flex h-16 items-center px-4 mx-auto">
        <div class="flex items-center gap-4">
          <!-- Mobile menu trigger -->
          <Sheet v-model:open="mobileMenuOpen">
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" class="lg:hidden">
                <Menu class="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" class="w-80">
              <NavigationMenu
                :user-role="userRole"
                :active-section="activeSection"
                @navigate="handleNavigation"
              />
            </SheetContent>
          </Sheet>

          <h1 class="text-xl font-bold">Gestión de Horas UNIACC</h1>
        </div>

        <div class="ml-auto flex items-center gap-4">
          <div class="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
            <User class="h-4 w-4" />
            <span>{{ user.email }}</span>
            <span class="text-xs px-2 py-1 bg-primary/10 text-primary rounded capitalize">
              {{ userRole }}
            </span>
          </div>

          <Button @click="handleLogout" variant="outline" size="sm">
            <LogOut class="h-4 w-4 mr-2" />
            <span class="hidden sm:inline">Salir</span>
          </Button>
        </div>
      </div>
    </header>

    <!-- Main Layout -->
    <div class="container mx-auto px-4 py-6">
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <!-- Desktop Sidebar Navigation -->
        <div class="hidden lg:block lg:col-span-1">
          <div class="sticky top-24">
            <NavigationMenu
              :user-role="userRole"
              :active-section="activeSection"
              @navigate="handleNavigation"
            />
          </div>
        </div>

        <!-- Main Content Area -->
        <div class="lg:col-span-4">
          <MainContent
            :active-section="activeSection"
            :user-role="userRole"
            :user="user"
          />
        </div>
      </div>
    </div>
  </div>
</template>
