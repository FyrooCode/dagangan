import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  // Ambil preferensi dari localStorage, default ke light
  const mode = ref(localStorage.getItem('data-bs-theme') || 'light')

  function initTheme() {
    // Set atribut di tag <html> agar CSS Metronic berubah
    document.documentElement.setAttribute('data-bs-theme', mode.value)
  }

  function toggleTheme() {
    mode.value = mode.value === 'light' ? 'dark' : 'light'
    localStorage.setItem('data-bs-theme', mode.value)
    document.documentElement.setAttribute('data-bs-theme', mode.value)
  }

  return { mode, initTheme, toggleTheme }
})