<script setup lang="ts">
import { onMounted } from 'vue'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()

onMounted(() => {
  // Biar mode dark/light Metronic langsung aktif pas buka app
  themeStore.initTheme()
})
</script>

<template>
  <router-view />
</template>

<style>
/* CSS global bisa ditaruh di sini jika perlu, 
   tapi karena kita pakai Metronic di index.html, ini biarkan kosong saja */
</style>