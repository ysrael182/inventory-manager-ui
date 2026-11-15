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
        themes: {
            light: {
                colors: {
                    primary: '#2d67ad',
                    secondary: '#d59a50',
                    background: '#f4f7fb',
                    surface: '#ffffff',
                    error: '#c84f4f',
                    success: '#318369',
                    warning: '#d59a50',
                    info: '#4685a0',
                },
            },
        },
    },
 }
)

const app = createApp(App)
app.use(router)
app.use(createPinia())
app.use(vuetify)
app.mount('#app')
