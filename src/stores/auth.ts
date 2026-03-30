import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User } from '@supabase/supabase-js'

export const useAuthStore = defineStore('auth', () => {
  // State untuk menyimpan data user
  const user = ref<User | null>(null)

  // Action untuk membersihkan session saat logout
  function clearAuth() {
    user.value = null
  }

  return { 
    user, 
    clearAuth 
  }
})