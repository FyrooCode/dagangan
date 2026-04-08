<template>
  <div class="d-flex flex-column flex-column-fluid">
    <!-- <div class="card bg-light-primary mb-10 shadow-sm">
      <div class="card-body py-10 text-center">
        <h1 class="text-dark fw-bolder mb-3">Halo, {{ authStore.user?.user_metadata?.full_name || 'Bell' }}!</h1>
        <p class="text-gray-600 fs-5 fw-semibold mb-0">Mau cek dagangan apa hari ini?</p>
      </div>
    </div> -->

    <div class="row g-5 g-xl-10 mb-8">
      <div class="col-6 col-md-6">
        <div class="card card-flush h-100 bgi-no-repeat bgi-size-contain bgi-position-x-end shadow-sm bg-danger">
          <div class="card-body d-flex flex-column justify-content-center text-center p-8">
            <div class="mb-4">
              <i class="ki-outline ki-document-text fs-3hx text-white"></i>
            </div>
            <span class="text-white fw-bold fs-5">Nota Belum Bayar</span>
            <span class="text-white fw-bolder" style="font-size: 3rem; line-height: 1;">{{ unpaidCount }}</span>
          </div>
        </div>
      </div>
      <div class="col-6 col-md-6">
        <div class="card card-flush h-100 bgi-no-repeat bgi-size-contain bgi-position-x-end shadow-sm bg-success">
          <div class="card-body d-flex flex-column justify-content-center text-center p-8">
            <div class="mb-4">
              <i class="ki-outline ki-document-text fs-3hx text-white"></i>
            </div>
            <span class="text-white fw-bold fs-5">Nota Lunas</span>
            <span class="text-white fw-bolder" style="font-size: 3rem; line-height: 1;">{{ paidCount }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="row g-5 g-xl-10">
      <div v-for="menu in menus" :key="menu.path" class="col-6 col-md-4">
        <router-link :to="menu.path" class="card card-flush h-100 bgi-no-repeat bgi-size-contain bgi-position-x-end shadow-sm card-hover">
          <div class="card-body d-flex flex-column justify-content-center text-center p-8">
            <div class="mb-4">
              <i :class="menu.icon" class="fs-3hx text-primary"></i>
            </div>
            <span class="text-gray-800 fw-bold fs-5">{{ menu.title }}</span>
            <span class="text-gray-400 fw-semibold fs-7 mt-1">{{ menu.desc }}</span>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { shipmentService } from '@/services/ShipmentService'

const authStore = useAuthStore()
const unpaidCount = ref(0)
const paidCount = ref(0)

const menus = [
  { path: '/dashboard', title: 'Dashboard', desc: 'Statistik & Tren', icon: 'ki-outline ki-element-11' },
  { path: '/shipments', title: 'Pengiriman', desc: 'Input Nota Baru', icon: 'ki-outline ki-delivery-3' },
  { path: '/returns', title: 'Sisa', desc: 'Input Sisa', icon: 'ki-outline ki-arrows-loop' },
  { path: '/payments', title: 'Pembayaran', desc: 'Konfirmasi Pembayaran', icon: 'ki-outline ki-wallet' },
  { path: '/products', title: 'Produk', desc: 'Input Barang', icon: 'ki-outline ki-basket' },
  { path: '/partners', title: 'Partner', desc: 'Daftar Partner', icon: 'ki-outline ki-profile-user' },
]

async function loadShipmentCounts() {
  try {
    const shipments = await shipmentService.getAll()
    unpaidCount.value = shipments.filter(s => s.status !== 'paid').length
    paidCount.value = shipments.filter(s => s.status === 'paid').length
  } catch (error) {
    console.error('Error loading shipment counts:', error)
  }
}

onMounted(() => {
  loadShipmentCounts()
})
</script>

<style scoped>
.card-hover:hover {
  border: 1px solid var(--kt-primary) !important;
  transform: translateY(-5px);
  transition: all 0.2s ease;
}
</style>