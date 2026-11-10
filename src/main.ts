import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'

// Vuetify setup
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import './assets/main.css'
import '@mdi/font/css/materialdesignicons.css'

const vuetify = createVuetify(
 {
    theme: {
        defaultTheme: 'light',
    },
 }
)

const app = createApp(App)
app.use(router)
app.use(createPinia())
app.use(vuetify)
app.mount('#app')
