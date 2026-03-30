<template>
  <div class="d-flex flex-column flex-root" id="kt_app_root" style="min-height: 100vh">
    
    <component is="style">
      body { background-image: url('/assets/media/auth/bg10.jpeg'); } 
      [data-bs-theme="dark"] body { background-image: url('/assets/media/auth/bg10-dark.jpeg'); }
    </component>

    <div class="d-flex flex-column flex-column-fluid flex-center p-10">
      <div class="bg-body d-flex flex-column flex-center rounded-4 w-md-600px p-10 shadow-sm">
        <div class="d-flex flex-center flex-column align-items-stretch h-lg-100 w-md-400px">
          

          <div class="d-flex flex-center flex-column flex-column-fluid pb-15 pb-lg-20">
            
            <router-view />

          </div>
        </div>
        </div>
      </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

onMounted(() => {
  // Memberikan class khusus body agar background image login muncul
  document.body.classList.add('app-blank', 'bgi-size-cover', 'bgi-attachment-fixed', 'bgi-position-center')
  
  // Re-init Metronic components (dropdown bahasa)
  // @ts-ignore
  if (typeof KTComponents !== 'undefined') {
    // @ts-ignore
    KTComponents.init();
  }
})

onUnmounted(() => {
  // Membersihkan class saat user masuk ke Dashboard
  document.body.classList.remove('app-blank', 'bgi-size-cover', 'bgi-attachment-fixed', 'bgi-position-center')
})
</script>