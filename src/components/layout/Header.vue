<template>
  <div 
    id="kt_app_header" 
    class="app-header" 
    data-kt-sticky="true" 
    data-kt-sticky-activate="{default: true, lg: true}" 
    data-kt-sticky-name="app-header-sticky" 
    data-kt-sticky-offset="{default: '10px', lg: '10px'}"
  >
    <div class="app-container container-xxl d-flex align-items-stretch justify-content-between" id="kt_app_header_container">
      
      <div class="app-header-wrapper d-flex flex-grow-1 align-items-stretch justify-content-between" id="kt_app_header_wrapper">
        
        <div 
          class="app-header-menu app-header-mobile-drawer align-items-start align-items-lg-center w-100" 
          data-kt-drawer="true" 
          data-kt-drawer-name="app-header-menu" 
          data-kt-drawer-activate="{default: true, lg: false}" 
          data-kt-drawer-overlay="true" 
          data-kt-drawer-width="250px" 
          data-kt-drawer-direction="end" 
          data-kt-drawer-toggle="#kt_app_header_menu_toggle" 
          data-kt-swapper="true" 
          data-kt-swapper-mode="{default: 'append', lg: 'prepend'}" 
          data-kt-swapper-parent="{default: '#kt_app_body', lg: '#kt_app_header_wrapper'}"
        >
          <div class="menu menu-rounded menu-column menu-lg-row menu-active-bg menu-state-primary menu-title-gray-700 menu-arrow-gray-500 menu-bullet-gray-500 my-5 my-lg-0 align-items-stretch fw-semibold px-2 px-lg-0" id="#kt_header_menu" data-kt-menu="true">
            
            <div data-kt-menu-trigger="{default: 'click', lg: 'hover'}" data-kt-menu-placement="bottom-start" class="menu-item here show menu-here-bg menu-lg-down-accordion me-0 me-lg-2">
              <span class="menu-link">
                <span class="menu-title">Dashboards</span>
                <span class="menu-arrow d-lg-none"></span>
              </span>
              
              <div class="menu-sub menu-sub-lg-down-accordion menu-sub-lg-dropdown p-0 w-100 w-lg-850px">
                <div class="menu-state-bg menu-extended overflow-hidden overflow-lg-visible" data-kt-menu-dismiss="true">
                  <div class="row">
                    <div class="col-lg-8 mb-3 mb-lg-0 py-3 px-3 py-lg-6 px-lg-6">
                      <div class="row">
                        <div class="col-lg-6 mb-3">
                          <div class="menu-item p-0 m-0">
                            <router-link to="/" class="menu-link active">
                              <span class="menu-custom-icon d-flex flex-center flex-shrink-0 rounded w-40px h-40px me-3">
                                <i class="ki-outline ki-element-11 text-primary fs-1"></i>
                              </span>
                              <span class="d-flex flex-column">
                                <span class="fs-6 fw-bold text-gray-800">Default</span>
                                <span class="fs-7 fw-semibold text-muted">Reports & statistics</span>
                              </span>
                            </router-link>
                          </div>
                        </div>
                        </div>
                    </div>
                    
                    <div class="menu-more bg-light col-lg-4 py-3 px-3 py-lg-6 px-lg-6 rounded-end">
                      <h4 class="fs-6 fs-lg-4 text-gray-800 fw-bold mt-3 mb-3 ms-4">Menu Cepat</h4>
                      <div class="menu-item p-0 m-0">
                        <router-link to="/shipments" class="menu-link py-2">
                          <span class="menu-title">Input Penjualan</span>
                        </router-link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              </div>
          </div>
          </div>
        <div class="d-flex align-items-center">
          <div class="btn btn-icon btn-color-gray-600 btn-active-color-primary ms-n3 me-2 d-none" id="kt_app_sidebar_toggle">
            <i class="ki-outline ki-abstract-14 fs-2"></i>
          </div>
          <router-link to="/" class="d-flex d-lg-none align-items-center">
            <img alt="Dagangan Logo" src="/assets/media/logos/logo.png" class="h-30px" />
            <span class="fw-bold fs-6 ms-2 text-dark">Dagangan</span>
          </router-link>
        </div>

        <div class="app-navbar flex-shrink-0">
          <div class="app-navbar-item ms-1 ms-lg-3">
            <div 
              class="btn btn-icon btn-circle btn-color-gray-500 btn-active-color-primary btn-custom shadow-xs bg-body" 
              @click="themeStore.toggleTheme()"
            >
              <i class="ki-outline ki-night-day fs-1"></i>
            </div>
          </div>

          <div class="app-navbar-item d-lg-none ms-2 me-n4 d-none">
            <div class="btn btn-icon btn-color-gray-600 btn-active-color-primary" id="kt_app_header_menu_toggle">
              <i class="ki-outline ki-text-align-left fs-2 fw-bold"></i>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  </template>

<script setup lang="ts">
import { useThemeStore } from '@/stores/theme'
const themeStore = useThemeStore()
</script>

<style scoped>
/* Transisi halus agar tidak 'balapan' antara teks dan background putih */
.app-header {
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

/* Sembunyikan menu link secara halus jika belum sticky (opsional) */
/* .menu-link { transition: color 0.2s ease; } */
</style>