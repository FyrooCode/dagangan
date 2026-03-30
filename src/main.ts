import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia) // Harus urutan pertama
app.use(router)

const authStore = useAuthStore()

// Cek session Supabase sebelum aplikasi muncul
supabase.auth.getSession().then(({ data: { session } }) => {
  authStore.user = session?.user ?? null
  app.mount('#app') // Mount aplikasi SETELAH cek session selesai
})

// Monitor jika ada perubahan status login (login/logout/expired)
supabase.auth.onAuthStateChange((_event, session) => {
  authStore.user = session?.user ?? null
  
  if (_event === 'SIGNED_OUT') {
    authStore.clearAuth()
    router.push('/auth/login')
  }
})