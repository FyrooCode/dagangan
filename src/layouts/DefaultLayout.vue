<template>
  <div class="d-flex flex-column flex-root app-root" id="kt_app_root">
    <div class="app-page flex-column flex-column-fluid" id="kt_app_page">
      
      <Header />

      <div class="app-wrapper flex-column flex-row-fluid" id="kt_app_wrapper">
        
        <Sidebar />

        <div class="app-main flex-column flex-row-fluid" id="kt_app_main">
          <div class="d-flex flex-column flex-column-fluid">
            
            <div id="kt_app_content" class="app-content flex-column-fluid">
              <div id="kt_app_content_container" class="app-container container-xxl">
                <router-view /> </div>
            </div>
            </div>
          <Footer />
        </div>
        </div>
      </div>
    </div>
  </template>

<script setup lang="ts">
import Header from '@/components/layout/Header.vue'
import Sidebar from '@/components/layout/Sidebar.vue'
import Footer from '@/components/layout/Footer.vue'
import { onMounted } from 'vue'

onMounted(() => {
  // Penting: Memastikan komponen Metronic (drawer, scroll, toggle) 
  // diinisialisasi ulang saat pindah halaman di Vue
  // @ts-ignore
  if (typeof KTComponents !== 'undefined') {
    // @ts-ignore
    KTComponents.init();
  }
})
</script>