

<script setup lang="ts">
import { onMounted } from 'vue'
import { useThemeStore } from '@/stores/theme'
import MobileNavbar from '@/components/layout/MobileNavbar.vue'
import { useRoute } from 'vue-router'

const themeStore = useThemeStore()
const route = useRoute()

onMounted(() => {
  // Biar mode dark/light Metronic langsung aktif pas buka app
  themeStore.initTheme()
})
</script>

<template>
  <router-view />
  <MobileNavbar v-if="route.name !== 'login'" />
</template>

<style>
/* CSS global bisa ditaruh di sini jika perlu, 
  tapi karena kita pakai Metronic di index.html, ini biarkan kosong saja */
</style>