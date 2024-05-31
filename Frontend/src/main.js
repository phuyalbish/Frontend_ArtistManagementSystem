import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'
import store from './store/store.js'
import ToastPlugin from 'vue-toast-notification'
import PageLayout from './PageLayout.vue'
const app = createApp(App)

app.use(router)
app.use(store)
app.use(ToastPlugin)
app.component("PageLayout", PageLayout)
app.mount('#app')
