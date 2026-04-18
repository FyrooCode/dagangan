<template>
  <div class="mobile-dashboard container">
    <div v-if="loading" class="d-flex flex-column flex-center py-20">
      <span class="spinner-border text-primary"></span>
    </div>

    <div v-else class="row g-4">
      <div class="col-6">
        <div class="card bg-primary shadow-sm border-0 h-100">
          <div class="card-body d-flex flex-column justify-content-center p-6">
            <span class="fs-2hx fw-bold text-white mb-2">Rp {{ formatNumber(stats.totalOmzet) }}</span>
            <span class="fs-8 fw-bold text-white opacity-75 text-uppercase">Total Omzet</span>
          </div>
        </div>
      </div>

      <div class="col-6">
        <div class="card bg-success shadow-sm border-0 h-100">
          <div class="card-body d-flex flex-column justify-content-center p-6">
            <span class="fs-2hx fw-bold text-white mb-2">Rp {{ formatNumber(stats.totalPendapatan) }}</span>
            <span class="fs-8 fw-bold text-white opacity-75 text-uppercase">Total Pendapatan</span>
          </div>
        </div>
      </div>

      <div class="col-6">
        <div class="card bg-danger shadow-sm border-0 h-100">
          <div class="card-body d-flex flex-column justify-content-center p-6">
            <span class="fs-2hx fw-bold text-white mb-2">Rp {{ formatNumber(stats.totalPiutang) }}</span>
            <span class="fs-8 fw-bold text-white opacity-75 text-uppercase">Total Piutang</span>
          </div>
        </div>
      </div>

      <div class="col-6">
        <div class="card bg-warning shadow-sm border-0 h-100">
          <div class="card-body d-flex flex-column justify-content-center p-6">
            <span class="fs-2hx fw-bold text-white mb-2">Rp {{ formatNumber(stats.totalSisaUang) }}</span>
            <span class="fs-8 fw-bold text-white opacity-75 text-uppercase">Sisa Barang (Retur)</span>
          </div>
        </div>
      </div>

      <div class="col-12">
        <div class="card bg-white border border-gray-300 border-dashed shadow-sm mobile-summary-card">
          <div class="card-body p-4 d-flex flex-column justify-content-center">
            <div class="d-flex justify-content-between align-items-center">
              <div class="text-center w-50">
                <span class="d-block fs-2hx fw-bolder text-danger">{{ stats.countPending }}</span>
                <span class="fs-9 fw-bold text-gray-600 text-uppercase">Pending</span>
              </div>
              <div class="separator separator-vertical h-40px mx-3"></div>
              <div class="text-center w-50">
                <span class="d-block fs-2hx fw-bolder text-success">{{ stats.countLunas }}</span>
                <span class="fs-9 fw-bold text-gray-600 text-uppercase">Lunas</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-12">
        <MobileRevenueAreaChart :data="stats.chartData" />
      </div>

      <div class="col-12">
        <MobileTopProductChart :data="stats.topProductsValue" />
      </div>

      <div class="col-12">
        <MobileTopReturnProductChart :data="stats.topReturns" />
      </div>

      <div class="col-12">
        <MobileAllProductQtyChart :data="stats.allProductQty" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { mobileDashboardService } from '@/services/MobileDashboardService'
import MobileRevenueAreaChart from '@/components/mobilechart/MobileRevenueAreaChart.vue'
import MobileTopProductChart from '@/components/mobilechart/MobileTopProductChart.vue'
import MobileTopReturnProductChart from '@/components/mobilechart/MobileTopReturnProductChart.vue'
import MobileAllProductQtyChart from '@/components/mobilechart/MobileAllProductQtyChart.vue'

const loading = ref(true)
const stats = ref({
  totalOmzet: 0,
  totalPendapatan: 0,
  totalPiutang: 0,
  totalSisaUang: 0,
  countPending: 0,
  countLunas: 0,
  chartData: [] as Array<{ x: number; y: number }>,
  topProductsValue: [] as Array<{ name: string; total: number }>,
  topReturns: [] as Array<{ name: string; qty: number }>,
  allProductQty: [] as Array<{ name: string; qty: number }>
})

const formatNumber = (value: number) => new Intl.NumberFormat('id-ID').format(value || 0)

async function loadMobileStats() {
  loading.value = true
  try {
    const data = await mobileDashboardService.getMobileDashboardData()
    stats.value = data as typeof stats.value
  } catch (error) {
    console.error('Error loading mobile dashboard:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadMobileStats()
})
</script>

<style scoped>
.mobile-dashboard {
  padding: 1rem 0 6rem;
}
.card {
  border-radius: 16px;
}
.card-body {
  min-height: 140px;
}
.mobile-summary-card .card-body {
  min-height: 110px;
}
.fs-2hx {
  font-size: 2.25rem;
}
</style>
