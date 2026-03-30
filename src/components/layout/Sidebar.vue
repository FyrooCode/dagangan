<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { authService } from '@/services/AuthService'
import { dashboardService } from '@/services/DashboardService'
import { useRouter, useRoute } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

// State untuk data real
const stats = ref({
  totalNotaLunas: 0,
  totalNotaPending: 0,
  nominalLunas: 0,
  nominalPending: 0
})
const loading = ref(true)

// Fungsi format Rupiah yang lebih "Indonesia" (pake Juta/Ribu)
const formatRupiah = (n: number) => {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace('.', ',') + ' Juta'
  if (n >= 1000) return (n / 1000).toFixed(0) + ' Ribu'
  return n.toString()
}

async function fetchSidebarStats() {
  try {
    const data = await dashboardService.getDashboardData()
    if (data) {
      // Kita asumsikan dashboardService punya data count nota
      // Jika belum ada di service, pastikan query Supabase-nya narik count juga
      stats.value.totalNotaLunas = data.stats.countLunas || 0
      stats.value.totalNotaPending = data.stats.countPending || 0
      stats.value.nominalLunas = data.stats.omzetLunas || 0
      stats.value.nominalPending = data.stats.piutangPending || 0
    }
  } catch (err) {
    console.error('Sidebar Data Error:', err)
  } finally {
    loading.value = false
  }
}

async function handleLogout() {
  try {
    await authService.logout()
    router.push('/auth/login')
  } catch (error) {
    console.error('Gagal logout:', error)
  }
}

onMounted(() => {
  fetchSidebarStats()
})

watch(
  () => route.path,
  () => {
    // @ts-ignore
    const sidebarElement = document.getElementById('kt_app_sidebar');
    if (sidebarElement) {
      // @ts-ignore
      const drawer = KTDrawer.getInstance(sidebarElement);
      if (drawer) drawer.hide();
    }
  }
)
</script>

<template>
  <div id="kt_app_sidebar" class="app-sidebar flex-column" 
    data-kt-drawer="true" 
    data-kt-drawer-name="app-sidebar" 
    data-kt-drawer-activate="{default: true, lg: false}" 
    data-kt-drawer-overlay="true" 
    data-kt-drawer-width="275px" 
    data-kt-drawer-direction="start" 
    data-kt-drawer-toggle="#kt_app_sidebar_toggle">
    
    <div class="d-flex flex-stack px-4 px-lg-6 py-3 py-lg-8" id="kt_app_sidebar_logo">
      <router-link to="/" class="d-flex align-items-center">
        <img alt="Logo" src="/assets/media/logos/pwa-192x192.png" class="h-30px h-lg-40px" />
        <span class="fw-bold fs-5 ms-3 text-dark">Dagangan</span>
      </router-link>
      
      <div class="ms-3">
        <div class="cursor-pointer position-relative symbol symbol-circle symbol-40px" data-kt-menu-trigger="{default: 'click', lg: 'hover'}" data-kt-menu-attach="parent" data-kt-menu-placement="bottom-end">
          <img src="/assets/media/avatars/default.png" alt="user" />
          <div class="position-absolute rounded-circle bg-success start-100 top-100 h-8px w-8px ms-n3 mt-n3"></div>
        </div>

        <div class="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-800 menu-state-bg menu-state-color fw-semibold py-4 fs-6 w-275px" data-kt-menu="true">
          <div class="menu-item px-3">
            <div class="menu-content d-flex align-items-center px-3">
              <div class="symbol symbol-50px me-5">
                <img alt="Logo" src="/assets/media/avatars/default.png" />
              </div>
              <div class="d-flex flex-column">
                <div class="fw-bold d-flex align-items-center fs-5">
                  {{ authStore.user?.user_metadata?.full_name || 'Bell' }}
                  <span class="badge badge-light-success fw-bold fs-8 px-2 py-1 ms-2">Pro</span>
                </div>
                <span class="fw-semibold text-muted fs-7">{{ authStore.user?.email }}</span>
              </div>
            </div>
          </div>
          <div class="separator my-2"></div>
          <div class="menu-item px-5">
            <a @click.prevent="handleLogout" href="#" class="menu-link px-5">Sign Out</a>
          </div>
        </div>
      </div>
    </div>

    <div class="flex-column-fluid px-4 px-lg-8 py-4" id="kt_app_sidebar_nav">
      <div id="kt_app_sidebar_nav_wrapper" class="d-flex flex-column hover-scroll-y pe-4 me-n4" data-kt-scroll="true" data-kt-scroll-activate="true" data-kt-scroll-height="auto" data-kt-scroll-dependencies="#kt_app_sidebar_logo, #kt_app_sidebar_footer" data-kt-scroll-wrappers="#kt_app_sidebar, #kt_app_sidebar_nav" data-kt-scroll-offset="5px">
        
        <div class="mb-6">
          <h4 class="text-gray-800 fw-bold mb-4 fs-6">Status Nota</h4>
          <div class="d-flex">
            <div class="border border-gray-300 border-dashed rounded min-w-100px w-100 py-2 px-4 me-4 bg-light-danger">
              <span class="fs-8 text-gray-600 fw-bold">Belum Bayar</span>
              <div class="fs-4 fw-bolder text-danger">{{ stats.totalNotaPending }} <span class="fs-8 fw-normal">Nota</span></div>
            </div>
            <div class="border border-gray-300 border-dashed rounded min-w-100px w-100 py-2 px-4 bg-light-success">
              <span class="fs-8 text-gray-600 fw-bold">Lunas</span>
              <div class="fs-4 fw-bolder text-success">{{ stats.totalNotaLunas }} <span class="fs-8 fw-normal">Nota</span></div>
            </div>
          </div>
        </div>

        <div class="mb-8">
          <h4 class="text-gray-800 fw-bold mb-4 fs-6">Total Tagihan</h4>
          <div class="d-flex flex-column gap-3">
            <div class="border border-gray-300 border-dashed rounded w-100 py-3 px-4 bg-white">
              <span class="fs-8 text-gray-500 fw-bold text-uppercase">Total Belum Bayar</span>
              <div class="fs-3 fw-bold text-danger">Rp {{ formatRupiah(stats.nominalPending) }}</div>
            </div>
            <div class="border border-gray-300 border-dashed rounded w-100 py-3 px-4 bg-white">
              <span class="fs-8 text-gray-500 fw-bold text-uppercase">Total Sudah Bayar</span>
              <div class="fs-3 fw-bold text-success">Rp {{ formatRupiah(stats.nominalLunas) }}</div>
            </div>
          </div>
        </div>

        <div class="mb-6">
          <h3 class="text-gray-800 fw-bold mb-8">Menu Utama</h3>
          <div class="row row-cols-3 g-3">
            <div class="col">
              <router-link to="/" class="btn btn-icon btn-outline btn-bg-light btn-active-light-primary btn-flex flex-column flex-center w-100 h-75px border-gray-200">
                <i class="ki-outline ki-element-11 fs-1 mb-1"></i>
                <span class="fs-8 fw-bold">Beranda</span>
              </router-link>
            </div>
            <div class="col">
              <router-link to="/shipments" class="btn btn-icon btn-outline btn-bg-light btn-active-light-primary btn-flex flex-column flex-center w-100 h-75px border-gray-200">
                <i class="ki-outline ki-delivery-3 fs-1 mb-1"></i>
                <span class="fs-8 fw-bold">Penjualan</span>
              </router-link>
            </div>
            <div class="col">
              <router-link to="/returns" class="btn btn-icon btn-outline btn-bg-light btn-active-light-primary btn-flex flex-column flex-center w-100 h-75px border-gray-200">
                <i class="ki-outline ki-arrows-loop fs-1 mb-1"></i>
                <span class="fs-8 fw-bold">Retur</span>
              </router-link>
            </div>
            <div class="col">
              <router-link to="/payments" class="btn btn-icon btn-outline btn-bg-light btn-active-light-primary btn-flex flex-column flex-center w-100 h-75px border-gray-200">
                <i class="ki-outline ki-wallet fs-1 mb-1 text-success"></i>
                <span class="fs-8 fw-bold">Keuangan</span>
              </router-link>
            </div>
            <div class="col">
              <router-link to="/products" class="btn btn-icon btn-outline btn-bg-light btn-active-light-primary btn-flex flex-column flex-center w-100 h-75px border-gray-200">
                <i class="ki-outline ki-basket fs-1 mb-1"></i>
                <span class="fs-8 fw-bold">Produk</span>
              </router-link>
            </div>
            <div class="col">
              <router-link to="/partners" class="btn btn-icon btn-outline btn-bg-light btn-active-light-primary btn-flex flex-column flex-center w-100 h-75px border-gray-200">
                <i class="ki-outline ki-profile-user fs-1 mb-1"></i>
                <span class="fs-8 fw-bold">Partner</span>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bg-light-danger { background-color: #fff5f8 !important; }
.bg-light-success { background-color: #e8fff3 !important; }
.fs-8 { font-size: 0.75rem !important; }
</style>