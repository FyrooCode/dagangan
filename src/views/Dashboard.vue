<template>
  <DesktopDashboard v-if="!isMobile" />
  <MobileDashboard v-else />
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import DesktopDashboard from '@/components/dashboard/DesktopDashboard.vue'
import MobileDashboard from '@/components/dashboard/MobileDashboard.vue'

const isMobile = ref(false)
let mediaQuery: MediaQueryList | null = null

function updateIsMobile() {
  isMobile.value = mediaQuery?.matches ?? false
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    mediaQuery = window.matchMedia('(max-width: 991px)')
    updateIsMobile()
    mediaQuery.addEventListener('change', updateIsMobile)
  }
})

onBeforeUnmount(() => {
  mediaQuery?.removeEventListener('change', updateIsMobile)
})
</script>

<style scoped>
</style>