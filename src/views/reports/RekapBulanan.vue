<template>
  <div id="kt_app_toolbar" class="app-toolbar py-4">
    <div id="kt_app_toolbar_container" class="app-container container-xxl d-flex flex-stack">
      <div class="d-flex align-items-center">
        <router-link to="/lainnya" class="btn btn-sm btn-icon btn-primary me-3 shadow-sm">
          <i class="ki-outline ki-arrow-left fs-2 text-white"></i>
        </router-link>
        <h1 class="text-gray-900 fw-bolder fs-2 mb-0">Rekap Bulanan</h1>
      </div>
    </div>
  </div>

  <div id="kt_app_content" class="app-content flex-column-fluid pt-0">
    <div id="kt_app_content_container" class="app-container container-xxl">
      
      <div v-if="loading" class="text-center py-20">
        <span class="spinner-border text-primary"></span>
        <div class="text-gray-500 mt-3 fw-bold">Memuat data laporan...</div>
      </div>

      <div v-else>
        <!-- Filter bar -->
        <div class="p-1 bg-gray-100 rounded-pill d-flex mb-8 shadow-sm border border-gray-200" style="height: 52px;">
          <button @click="setTab('all')" class="btn flex-grow-1 d-flex align-items-center justify-content-center fw-bolder fs-6 transition-all rounded-pill border-0" :class="activeTab === 'all' ? 'bg-primary text-white shadow' : 'text-gray-600'">
            Semua
          </button>
          <button @click="openYearModal" class="btn flex-grow-1 d-flex align-items-center justify-content-center fw-bolder fs-6 transition-all rounded-pill border-0" :class="activeTab === 'filtered' ? 'bg-primary text-white shadow' : 'text-gray-600'">
            {{ activeTab === 'filtered' ? 'Tahun ' + selectedYear : 'Filter Tahun' }}
          </button>
        </div>

        <div class="row g-5">
          <div v-for="monthData in filteredMonths" :key="monthData.key" class="col-12 col-md-6 col-xl-4">
            <div class="card shadow-sm border border-gray-200">
              <div class="card-header collapsible cursor-pointer rotate" data-bs-toggle="collapse" :data-bs-target="'#kt_docs_card_collapsible_' + monthData.key">
                  <h3 class="card-title">{{ monthData.label }}</h3>
                  <div class="card-toolbar rotate-180">
                      <i class="ki-duotone ki-down fs-1"></i>
                  </div>
              </div>
              <div :id="'kt_docs_card_collapsible_' + monthData.key" class="collapse">
                  <div class="card-body">
                      <p class="text-gray-600 mb-0">
                        Cetak laporan rekapitulasi pengiriman, potongan sisa, dan performa produk untuk {{ monthData.label }}.
                      </p>
                  </div>
                  <div class="card-footer d-flex gap-3">
                      <button class="btn btn-danger btn-sm fw-bold shadow-sm d-flex align-items-center" @click="handleExportPDF(monthData)" :disabled="exporting[monthData.key]">
                        <span v-if="exporting[monthData.key]" class="spinner-border spinner-border-sm me-2"></span>
                        <i v-else class="ki-outline ki-file fs-3 me-1"></i> Cetak PDF
                      </button>
                      <button class="btn btn-success btn-sm fw-bold shadow-sm d-flex align-items-center" disabled title="Coming Soon">
                        <i class="ki-outline ki-file-sheet fs-3 me-1"></i> Excel
                      </button>
                  </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>

  <!-- Filter Modal -->
  <div class="modal fade" id="modal_filter_year" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered mw-375px">
      <div class="modal-content rounded-4 border-0 shadow-lg">
        <div class="modal-body p-10">
          <div class="text-center mb-8">
            <h1 class="mb-1 text-gray-900 fs-3 fw-bolder">Filter Tahun</h1>
            <div class="text-muted fw-bold fs-7">Pilih tahun rekapitulasi yang ingin ditampilkan</div>
          </div>

          <div class="d-flex flex-column gap-5 mb-8">
            <div class="fv-row">
              <label class="fs-6 fw-bold mb-2">Tahun</label>
              <select v-model="tempYear" class="form-select form-select-solid fw-bolder">
                <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
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
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { reportService } from '@/services/ReportService'
import { exportRekapToPDF } from '@/utils/pdfGenerator'

const loading = ref(true)
const activeTab = ref('all')
const selectedYear = ref<string | number>('Semua')
const tempYear = ref<number>(new Date().getFullYear())
const availableYears = ref<number[]>([])
const availablePeriods = ref<Record<number, number[]>>({})
const exporting = ref<Record<string, boolean>>({})

let filterModal: any = null

onMounted(async () => {
  // @ts-ignore
  filterModal = new bootstrap.Modal(document.getElementById('modal_filter_year'))
  
  try {
    const periods = await reportService.getAvailablePeriods()
    availablePeriods.value = periods
    
    const years = Object.keys(periods).map(Number).sort((a, b) => b - a)
    availableYears.value = years
    
    if (years.length > 0 && years[0] !== undefined) {
      selectedYear.value = years[0]
      tempYear.value = years[0]
    }
  } catch (error) {
    console.error('Failed to fetch available periods', error)
  } finally {
    loading.value = false
  }
})

function setTab(tab: string) {
  activeTab.value = tab
}

function openYearModal() {
  if (selectedYear.value !== 'Semua') {
    tempYear.value = selectedYear.value as number
  } else if (availableYears.value.length > 0 && availableYears.value[0] !== undefined) {
    tempYear.value = availableYears.value[0]
  }
  filterModal.show()
}

function applyFilter() {
  selectedYear.value = tempYear.value
  activeTab.value = 'filtered'
  filterModal.hide()
}

const filteredMonths = computed(() => {
  if (activeTab.value === 'all') {
    return [{ key: 'all', year: null, month: null, label: 'Semua Periode (Keseluruhan)' }]
  } else {
    const year = selectedYear.value as number
    const months = availablePeriods.value[year] || []
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
    
    return months.map(m => ({
      key: `${year}-${m}`,
      year: year,
      month: m,
      label: `${monthNames[m-1]} ${year}`
    }))
  }
})

const handleExportPDF = async (monthData: any) => {
  exporting.value[monthData.key] = true
  try {
    const data = await reportService.getMonthlyData(monthData.year, monthData.month)
    await exportRekapToPDF(data, monthData.label)
  } catch (err: any) {
    alert('Gagal generate PDF: ' + err.message)
  } finally {
    exporting.value[monthData.key] = false
  }
}
</script>

<style scoped>
.transition-all { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.scroll-hide::-webkit-scrollbar { display: none; }
.scroll-hide { -ms-overflow-style: none; scrollbar-width: none; }
#kt_app_content {
  padding-bottom: 7rem;
}
</style>
