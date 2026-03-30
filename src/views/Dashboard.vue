<template>
  <div v-if="loading" class="d-flex flex-column flex-center py-20">
    <span class="spinner-border text-primary"></span>
  </div>

  <div v-else>
    <div class="parent">
      <div class="div1 card bg-danger shadow-sm border-0">
        <div class="card-body d-flex flex-column justify-content-center align-items-start p-6">
          <span class="fs-2hx fw-bold text-white mb-2">Rp {{ formatNumber(summary.piutangPending) }}</span>
          <span class="fs-8 fw-bold text-white opacity-75 text-uppercase">Total Belum Bayar</span>
        </div>
      </div>

      <div class="div4 card bg-success shadow-sm border-0">
        <div class="card-body d-flex flex-column justify-content-center align-items-start p-6">
          <span class="fs-2hx fw-bold text-white mb-2">Rp {{ formatNumber(summary.omzetLunas) }}</span>
          <span class="fs-8 fw-bold text-white opacity-75 text-uppercase">Earning Bersih</span>
        </div>
      </div>

      <div class="div2 card bg-white border border-gray-300 border-dashed shadow-sm">
        <div class="card-body d-flex flex-stack justify-content-center p-6">
          <div class="text-center">
            <span class="d-block fs-2hx fw-bolder text-danger">{{ summary.countPending }}</span>
            <span class="fs-9 fw-bold text-gray-600 text-uppercase">Pending</span>
          </div>
          <div class="separator separator-vertical h-30px mx-4"></div>
          <div class="text-center">
            <span class="d-block fs-2hx fw-bolder text-success">{{ summary.countLunas }}</span>
            <span class="fs-9 fw-bold text-gray-600 text-uppercase">Lunas</span>
          </div>
        </div>
      </div>

      <div class="div3 card bg-warning shadow-sm border-0">
        <div class="card-body d-flex flex-column justify-content-center align-items-start p-6">
          <span class="fs-2hx fw-bold text-white mb-2">Rp {{ formatNumber(summary.totalSisaUang) }}</span>
          <span class="fs-8 fw-bold text-white opacity-75 text-uppercase">Sisa Barang (Retur)</span>
        </div>
      </div>

      <div class="div5">
        <RevenueAreaChart :data="chartTrend" />
      </div>
    </div>

    <div class="row g-5 g-xl-10 mt-5">
      <div class="col-xl-6">
        <TopProductChart :data="topProductsValue" />
      </div>
      <div class="col-xl-6">
        <TopReturnProductChart :data="topReturns" />
      </div>
    </div>

    <div class="row g-5 g-xl-10 mt-5">
      <div class="col-12">
        <AllProductQtyChart :data="allProductQty" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { dashboardService } from '@/services/DashboardService'
import RevenueAreaChart from '@/components/chart/RevenueAreaChart.vue'
import TopProductChart from '@/components/chart/TopProductChart.vue'
import TopReturnProductChart from '@/components/chart/TopReturnProductChart.vue'
import AllProductQtyChart from '@/components/chart/AllProductQtyChart.vue'

const loading = ref(true)
const summary = ref({ omzetLunas: 0, piutangPending: 0, totalSisaUang: 0, countLunas: 0, countPending: 0 })
const chartTrend = ref<{ x: number; y: number }[]>([])
const topProductsValue = ref<{ name: string; total: number }[]>([])
const topReturns = ref<{ name: string; qty: number }[]>([])
const allProductQty = ref<{ name: string; qty: number }[]>([])

const formatNumber = (n: number) => new Intl.NumberFormat('id-ID').format(n || 0)

onMounted(async () => {
  try {
    const data = await dashboardService.getDashboardData()
    summary.value = data.stats
    chartTrend.value = data.chartData
    topProductsValue.value = data.topProductsValue
    topReturns.value = data.topReturns
    allProductQty.value = data.allProductQty
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
/* Grid lo yang saklek tetap dipertahankan */
.parent {
    display: grid;
    grid-template-columns: 220px 220px 1fr;
    grid-template-rows: 220px 220px;
    gap: 20px;
}
.div1 { grid-column: 1; grid-row: 1; }
.div4 { grid-column: 2; grid-row: 1; }
.div2 { grid-column: 1; grid-row: 2; }
.div3 { grid-column: 2; grid-row: 2; }
.div5 { grid-column: 3; grid-row: 1 / span 2; }
.card { height: 100%; width: 100%; border-radius: 12px; }
@media (max-width: 1200px) {
    .parent { grid-template-columns: 1fr 1fr; grid-template-rows: 220px 220px auto; }
    .div5 { grid-column: 1 / span 2; grid-row: 3; min-height: 400px; }
}
</style>