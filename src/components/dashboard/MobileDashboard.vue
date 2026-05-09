<template>
  <div class="mobile-dashboard container">
    <div class="p-1 bg-gray-100 rounded-pill d-flex mb-8 shadow-sm border border-gray-200" style="height: 52px;">
      <button @click="setTab('all')" class="btn flex-grow-1 d-flex align-items-center justify-content-center fw-bolder fs-6 transition-all rounded-pill border-0" :class="activeTab === 'all' ? 'bg-primary text-white shadow' : 'text-gray-600'">
        Semua
      </button>
      <button @click="openFilterModal" class="btn flex-grow-1 d-flex align-items-center justify-content-center fw-bolder fs-6 transition-all rounded-pill border-0" :class="activeTab === 'filtered' ? 'bg-primary text-white shadow' : 'text-gray-600'">
        {{ activeTab === 'filtered' ? getMonthName(selectedMonth) + ' ' + selectedYear : 'Filter Bulan' }}
      </button>
    </div>

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
              <div class="text-center flex-grow-1">
                <span class="d-block fs-2hx fw-bolder text-primary">{{ stats.countTotal }}</span>
                <span class="fs-9 fw-bold text-gray-600 text-uppercase">Total</span>
              </div>
              <div class="separator separator-vertical h-40px mx-3"></div>
              <div class="text-center flex-grow-1">
                <span class="d-block fs-2hx fw-bolder text-danger">{{ stats.countPending }}</span>
                <span class="fs-9 fw-bold text-gray-600 text-uppercase">Pending</span>
              </div>
              <div class="separator separator-vertical h-40px mx-3"></div>
              <div class="text-center flex-grow-1">
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

    <!-- Filter Modal -->
    <div class="modal fade" id="modal_filter_dashboard" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered mw-375px">
        <div class="modal-content rounded-4 border-0 shadow-lg">
          <div class="modal-body p-10">
            <div class="text-center mb-8">
              <h1 class="mb-1 text-gray-900 fs-3 fw-bolder">Filter Dashboard</h1>
              <div class="text-muted fw-bold fs-7">Pilih bulan dan tahun yang ingin ditampilkan</div>
            </div>

            <div class="d-flex flex-column gap-5 mb-8">
              <div class="fv-row">
                <label class="fs-6 fw-bold mb-2">Bulan</label>
                <select v-model="tempMonth" class="form-select form-select-solid fw-bolder">
                  <option v-for="(name, index) in months" :key="index" :value="index + 1">{{ name }}</option>
                </select>
              </div>

              <div class="fv-row">
                <label class="fs-6 fw-bold mb-2">Tahun</label>
                <select v-model="tempYear" class="form-select form-select-solid fw-bolder">
                  <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
                </select>
              </div>
            </div>

            <div class="d-flex flex-column gap-3">
              <button @click="applyFilter" class="btn btn-lg btn-primary fw-bold w-100 py-4 shadow-sm">
                <i class="ki-outline ki-check fs-3 me-2"></i> Terapkan Filter
              </button>
              <button class="btn btn-lg btn-secondary fw-bold w-100 py-4 shadow-sm" data-bs-dismiss="modal" style="background-color: #e4e6ef; color: #3f4254; border: none;">
                Batal
              </button>
            </div>
          </div>
        </div>
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
const activeTab = ref('all')
const selectedMonth = ref(new Date().getMonth() + 1)
const selectedYear = ref(new Date().getFullYear())
const tempMonth = ref(new Date().getMonth() + 1)
const tempYear = ref(new Date().getFullYear())

let filterModal: any = null

const months = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)

const stats = ref({
  totalOmzet: 0,
  totalPendapatan: 0,
  totalPiutang: 0,
  totalSisaUang: 0,
  countPending: 0,
  countLunas: 0,
  countTotal: 0,
  chartData: [] as Array<{ x: number; y: number }>,
  topProductsValue: [] as Array<{ name: string; total: number }>,
  topReturns: [] as Array<{ name: string; qty: number }>,
  allProductQty: [] as Array<{ name: string; qty: number }>
})

const formatNumber = (value: number) => new Intl.NumberFormat('id-ID').format(value || 0)
const getMonthName = (m: number) => months[m - 1]

async function loadMobileStats() {
  loading.value = true
  try {
    const data = activeTab.value === 'all' 
      ? await mobileDashboardService.getMobileDashboardData()
      : await mobileDashboardService.getMobileDashboardData(selectedMonth.value, selectedYear.value)
    stats.value = data as typeof stats.value
  } catch (error) {
    console.error('Error loading mobile dashboard:', error)
  } finally {
    loading.value = false
  }
}

function setTab(tab: string) {
  if (activeTab.value === tab) return
  activeTab.value = tab
  loadMobileStats()
}

function openFilterModal() {
  tempMonth.value = selectedMonth.value
  tempYear.value = selectedYear.value
  filterModal.show()
}

function applyFilter() {
  selectedMonth.value = tempMonth.value
  selectedYear.value = tempYear.value
  activeTab.value = 'filtered'
  filterModal.hide()
  loadMobileStats()
}

onMounted(() => {
  // @ts-ignore
  filterModal = new bootstrap.Modal(document.getElementById('modal_filter_dashboard'))
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
.transition-all { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
</style>
