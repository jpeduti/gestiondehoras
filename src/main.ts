import { createApp } from 'vue'
import App from './App.vue'
import './style.css'  // Importar Tailwind
import { seedService } from './services/seedService'

// Inicializar datos de prueba en desarrollo
if (import.meta.env.DEV) {
  seedService.initializeTestData()
    .catch(console.error)
}

createApp(App).mount('#app')
