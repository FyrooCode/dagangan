<template>
  <div id="kt_app_toolbar" class="app-toolbar py-4">
    <div id="kt_app_toolbar_container" class="app-container container-xxl d-flex flex-stack">
      <div class="d-flex align-items-center">
        <router-link to="/" class="btn btn-sm btn-icon btn-warning me-3 shadow-sm">
          <i class="ki-outline ki-arrow-left fs-2 text-white"></i>
        </router-link>
        <h1 class="text-gray-900 fw-bolder fs-2 mb-0">Manajemen Pembayaran</h1>
      </div>
    </div>
  </div>

  <div id="kt_app_content" class="app-content flex-column-fluid pt-0">
    <div id="kt_app_content_container" class="app-container container-xxl">
      
      <div class="p-1 bg-gray-100 rounded-pill d-flex mb-8 shadow-sm border border-gray-200" style="height: 52px;">
        <button 
          @click="activeTab = 'unpaid'"
          class="btn flex-grow-1 d-flex align-items-center justify-content-center fw-bolder fs-7 transition-all rounded-pill border-0"
          :class="activeTab === 'unpaid' ? 'bg-warning text-white shadow' : 'text-gray-600'"
        >
          Belum Lunas
          <span class="badge ms-2" :class="activeTab === 'unpaid' ? 'badge-light text-warning' : 'badge-light-dark'">
            {{ unpaidShipments.length }}
          </span>
        </button>
        <button 
          @click="activeTab = 'paid'"
          class="btn flex-grow-1 d-flex align-items-center justify-content-center fw-bolder fs-7 transition-all rounded-pill border-0"
          :class="activeTab === 'paid' ? 'bg-success text-white shadow' : 'text-gray-600'"
        >
          Sudah Lunas
          <span class="badge ms-2" :class="activeTab === 'paid' ? 'badge-light text-success' : 'badge-light-dark'">
            {{ paidShipments.length }}
          </span>
        </button>
      </div>

      <div v-if="loading" class="text-center py-20">
        <span class="spinner-border text-warning"></span>
        <div class="text-gray-500 mt-3 fw-bold">Memproses data pembayaran...</div>
      </div>

      <div v-else class="row g-5">
        <div v-for="shipment in filteredList" :key="shipment.id" class="col-12 col-md-6 col-xl-4">
          <div class="card card-flush h-100 border border-gray-200 shadow-sm cursor-pointer card-hover" @click="openPayModal(shipment)">
            <div class="card-body p-5">
              <div class="d-flex justify-content-between align-items-start mb-4">
                <span class="badge badge-light-dark fw-bold">#{{ shipment.id.substring(0, 5).toUpperCase() }}</span>
                <div class="d-flex gap-2">
                  <span v-if="shipment.total_retur_nominal > 0" class="badge badge-light-danger fw-bold">ADA SISA</span>
                  <span v-if="shipment.status === 'paid'" class="badge badge-success fw-bolder px-3 py-1">LUNAS</span>
                  <span v-else class="badge badge-light-warning fw-bolder px-3 py-1 text-uppercase">Belum Bayar</span>
                </div>
              </div>

              <div class="d-flex align-items-center mb-5">
                <div class="symbol symbol-40px symbol-circle me-3">
                  <div class="symbol-label fs-4 bg-light-warning text-warning fw-bolder">{{ shipment.partners?.name.charAt(0) }}</div>
                </div>
                <div class="d-flex flex-column">
                  <span class="fs-6 fw-bolder text-gray-900 mb-0">{{ shipment.partners?.name }}</span>
                  <span class="text-muted fs-7 text-truncate w-150px">{{ shipment.partners?.address || '-' }}</span>
                </div>
              </div>
              
              <div class="separator separator-dashed my-4"></div>
              
              <div class="d-flex flex-column gap-2 mt-2">
                <div class="d-flex justify-content-between align-items-center">
                  <span class="text-gray-400 fs-9 fw-bold text-uppercase">Total Kirim</span>
                  <span class="fs-6 fw-bolder text-gray-800">Rp {{ formatNumber(shipment.total_amount) }}</span>
                </div>
                <div v-if="shipment.total_retur_nominal > 0" class="d-flex justify-content-between align-items-center">
                  <span class="text-gray-400 fs-9 fw-bold text-uppercase">Potongan Sisa</span>
                  <span class="fs-6 fw-bolder text-danger">- Rp {{ formatNumber(shipment.total_retur_nominal) }}</span>
                </div>
                <div v-if="shipment.status === 'paid'" class="d-flex justify-content-between align-items-center">
                  <span class="text-gray-400 fs-9 fw-bold text-uppercase">Diterima</span>
                  <span class="fs-6 fw-bolder text-success">Rp {{ formatNumber(shipment.total_received) }}</span>
                </div>
              </div>

              <div class="separator separator-dashed my-4"></div>

              <div v-if="shipment.status === 'paid'" class="bg-light-primary rounded-2 p-3 border border-dashed border-primary mb-3">
                <div class="d-flex justify-content-between align-items-center">
                  <span class="text-primary fs-8 fw-bold text-uppercase">Tanggal Kirim:</span>
                  <span class="text-gray-800 fs-7 fw-bolder">{{ formatDate(shipment.shipment_date) }}</span>
                </div>
              </div>

              <div v-if="shipment.status === 'paid'" class="bg-light-success rounded-2 p-3 border border-dashed border-success mb-3">
                <div class="d-flex justify-content-between align-items-center">
                  <span class="text-success fs-8 fw-bold text-uppercase">Tanggal Lunas:</span>
                  <span class="text-gray-800 fs-7 fw-bolder">{{ formatDate(shipment.tgl_lunas) }}</span>
                </div>
              </div>

              <div v-if="shipment.status === 'pending'" class="bg-light-primary rounded-2 p-3 border border-dashed border-primary mb-3">
                <div class="d-flex justify-content-between align-items-center">
                  <span class="text-primary fs-8 fw-bold text-uppercase">Tanggal Kirim:</span>
                  <span class="text-gray-800 fs-7 fw-bolder">{{ formatDate(shipment.shipment_date) }}</span>
                </div>
              </div>

              <div class="bg-light-warning rounded-2 p-3 border border-dashed border-warning">
                <div class="d-flex justify-content-between align-items-center">
                  <span class="text-warning fs-8 fw-bold text-uppercase">Wajib Setor:</span>
                  <span class="text-gray-800 fs-5 fw-bolder">Rp {{ formatNumber(calculateFinalAmount(shipment)) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="filteredList.length === 0" class="col-12 text-center py-20 bg-light rounded border border-dashed border-gray-400">
          <div class="text-gray-600 fw-bold fs-6">Tidak ada data di kategori ini.</div>
        </div>
      </div>
    </div>
  </div>

  <div class="modal fade" id="modal_pay_action" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered mw-450px">
      <div class="modal-content border-0 rounded-4 shadow-lg">
        <div class="modal-body p-10">
          <div class="text-center mb-6">
            <h1 class="mb-1 text-gray-900 fs-3 fw-bolder">{{ selectedShipment?.partners?.name }}</h1>
            <div class="badge badge-light-dark mb-4">Nota #{{ selectedShipment?.id.substring(0, 5).toUpperCase() }}</div>
            
            <div class="bg-light rounded-3 p-4 border border-dashed border-gray-300">
              <div class="d-flex justify-content-between mb-2">
                <span class="text-muted fs-8 fw-bold text-uppercase">Tanggal Kirim:</span>
                <span class="text-gray-800 fs-7 fw-bolder">{{ formatDate(selectedShipment?.shipment_date) }}</span>
              </div>
              <div v-if="selectedShipment?.status === 'paid'" class="d-flex justify-content-between mb-2">
                <span class="text-success fs-8 fw-bold text-uppercase">Tanggal Lunas:</span>
                <span class="text-gray-800 fs-7 fw-bolder">{{ formatDate(selectedShipment?.tgl_lunas) }}</span>
              </div>
              <div class="separator separator-dashed my-3"></div>
              <div class="d-flex justify-content-between mb-2">
                <span class="text-muted fs-8 fw-bold text-uppercase">Total Kirim:</span>
                <span class="text-gray-800 fs-7 fw-bolder">Rp {{ formatNumber(selectedShipment?.total_amount) }}</span>
              </div>
              <div v-if="calculateReturnSummary(selectedShipment).totalDeduction > 0" class="d-flex justify-content-between mb-2">
                <span class="text-danger fs-8 fw-bold text-uppercase">Potongan Sisa:</span>
                <span class="text-danger fs-7 fw-bolder">- Rp {{ formatNumber(calculateReturnSummary(selectedShipment).totalDeduction) }}</span>
              </div>
              <div class="separator separator-dashed my-3"></div>
              <div class="d-flex justify-content-between">
                <span class="text-gray-900 fw-bold fs-8 text-uppercase">Wajib Setor:</span>
                <span class="text-success fw-bolder fs-5">Rp {{ formatNumber(calculateFinalAmount(selectedShipment)) }}</span>
              </div>
            </div>
          </div>

          <div class="mb-8">
            <div class="fs-8 fw-bold text-gray-500 text-uppercase mb-3">Detail Barang Sisa:</div>
            <div v-if="selectedShipment?.returns?.length > 0" class="bg-light-danger rounded p-4 border border-danger border-dashed">
              <div v-for="rd in selectedShipment.returns[0].return_details" :key="rd.id" class="mb-4">
                <div class="d-flex flex-stack">
                  <span class="text-gray-800 fw-bold fs-6">{{ rd.products?.name }}</span>
                  <span class="badge badge-danger">{{ rd.quantity_returned }} Sisa</span>
                </div>
                <div class="d-flex flex-stack fs-7 text-muted mt-1">
                  <span>{{ formatNumber(getItemPrice(rd.product_id)) }} x {{ rd.quantity_returned }}</span>
                  <span class="fw-bold">Rp {{ formatNumber(getItemPrice(rd.product_id) * rd.quantity_returned) }}</span>
                </div>
              </div>
              <div class="separator border-danger opacity-25 my-3"></div>
              <div class="d-flex flex-stack">
                <div class="d-flex flex-column">
                  <span class="text-gray-900 fw-bolder fs-7 text-uppercase">Total Sisa</span>
                  <span class="text-muted fs-8">{{ calculateReturnSummary(selectedShipment).totalItems }} Item</span>
                </div>
                <span class="text-danger fw-bolder fs-5">Rp {{ formatNumber(calculateReturnSummary(selectedShipment).totalDeduction) }}</span>
              </div>
            </div>
            <div v-else class="alert alert-light-warning border border-warning border-dashed d-flex align-items-center p-4 mb-0">
              <i class="ki-outline ki-information-5 fs-4 text-warning me-3"></i>
              <span class="fs-7 fw-bold text-warning">Terjual Semua (Tanpa Retur).</span>
            </div>
          </div>

          <div class="d-flex flex-column gap-3">
            <button v-if="selectedShipment?.status === 'pending'" @click="confirmPayment" 
              class="btn btn-lg btn-success fw-bold w-100 py-4 shadow-sm" :disabled="submitting">
              <span v-if="!submitting">Terima Rp {{ formatNumber(calculateFinalAmount(selectedShipment)) }}</span>
              <span v-else class="spinner-border spinner-border-sm"></span>
            </button>
            <button v-else @click="cancelPayment" class="btn btn-lg btn-light-danger fw-bold w-100 py-4 shadow-sm" :disabled="submitting">
              <i class="ki-outline ki-trash fs-3 me-2 text-danger"></i> Batalkan Pelunasan
            </button>
            <button class="btn btn-lg btn-secondary fw-bold w-100 py-4 mt-2 shadow-sm" data-bs-dismiss="modal" style="background-color: #e4e6ef; color: #3f4254; border: none;">
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { paymentService } from '@/services/PaymentService'

const shipments = ref<any[]>([])
const loading = ref(true)
const submitting = ref(false)
const activeTab = ref('unpaid')
const selectedShipment = ref<any>(null)
let payModal: any = null

async function loadData() {
  loading.value = true
  try {
    shipments.value = await paymentService.getAllShipments()
  } finally {
    loading.value = false
  }
}

function getItemPrice(productId: string) {
  if (!selectedShipment.value) return 0
  const originalItem = selectedShipment.value.shipment_details.find((sd: any) => sd.product_id === productId)
  return originalItem ? parseFloat(originalItem.unit_price_at_time) : 0
}

function calculateReturnSummary(shipment: any) {
  if (!shipment || !shipment.returns?.length) return { totalDeduction: 0, totalItems: 0 }
  const returnDetails = shipment.returns[0].return_details
  const shipmentDetails = shipment.shipment_details
  return returnDetails.reduce((acc: any, ret: any) => {
    const originalItem = shipmentDetails.find((sd: any) => sd.product_id === ret.product_id)
    const price = originalItem ? parseFloat(originalItem.unit_price_at_time) : 0
    acc.totalDeduction += (ret.quantity_returned * price)
    acc.totalItems += ret.quantity_returned
    return acc
  }, { totalDeduction: 0, totalItems: 0 })
}

function calculateFinalAmount(shipment: any) {
  if (!shipment) return 0
  const deduction = calculateReturnSummary(shipment).totalDeduction
  return Math.max(0, shipment.total_amount - deduction)
}

const unpaidShipments = computed(() => shipments.value.filter(s => s.status === 'pending'))
const paidShipments = computed(() => shipments.value.filter(s => s.status === 'paid'))
const filteredList = computed(() => activeTab.value === 'unpaid' ? unpaidShipments.value : paidShipments.value)

const openPayModal = (s: any) => {
  selectedShipment.value = s
  payModal.show()
}

async function confirmPayment() {
  const finalAmount = calculateFinalAmount(selectedShipment.value)
  submitting.value = true
  try {
    await paymentService.markAsPaid(selectedShipment.value, finalAmount)
    payModal.hide()
    await loadData()
    // @ts-ignore
    Swal.fire({ text: 'Setoran Berhasil!', icon: 'success', timer: 1500, showConfirmButton: false })
  } finally { submitting.value = false }
}

async function cancelPayment() {
  // @ts-ignore
  const res = await Swal.fire({ text: "Batalkan status lunas?", icon: "warning", showCancelButton: true })
  if (res.isConfirmed) {
    await paymentService.unmarkAsPaid(selectedShipment.value.id)
    payModal.hide()
    await loadData()
  }
}

const getStatusBadge = (status: string) => status === 'paid' ? 'badge badge-light-success fw-bold' : 'badge badge-light-warning fw-bold'
const formatNumber = (n: any) => new Intl.NumberFormat('id-ID').format(n || 0)
const formatDate = (d: any) => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'

onMounted(() => {
  loadData()
  // @ts-ignore
  payModal = new bootstrap.Modal(document.getElementById('modal_pay_action'))
})
</script>

<style scoped>
.transition-all { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.card-hover { transition: transform 0.15s ease-in-out; }
.card-hover:active { transform: scale(0.97); background-color: #f9f9f9; }
.btn:focus { box-shadow: none !important; }
</style>