import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Ionic
import { IonicVue } from '@ionic/vue'
import '@ionic/core/css/ionic.bundle.css'

// Crea la aplicación
const app = createApp(App)
  .use(IonicVue)
  .use(router)

router.isReady().then(() => {
  app.mount('#app')
})