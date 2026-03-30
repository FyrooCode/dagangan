<template>
  <div id="kt_app_toolbar" class="app-toolbar py-3 py-lg-0">
    <div id="kt_app_toolbar_container" class="app-container container-xxl d-flex flex-stack flex-wrap gap-2">
      <div class="page-title d-flex flex-column justify-content-center me-3">
        <h1 class="page-heading d-flex text-gray-900 fw-bold fs-3 flex-column justify-content-center my-0">Manajemen Pembayaran</h1>
      </div>
    </div>
  </div>

  <div id="kt_app_content" class="app-content flex-column-fluid pb-20">
    <div id="kt_app_content_container" class="app-container container-xxl">
      <div class="d-flex flex-stack mb-5 border-bottom border-gray-200">
        <ul class="nav nav-stretch nav-line-tabs nav-line-tabs-2x border-transparent fs-5 fw-bold">
          <li class="nav-item">
            <a class="nav-link text-active-primary py-5 me-10 cursor-pointer" :class="{active: activeTab === 'unpaid'}" @click="activeTab = 'unpaid'">
              Belum Lunas <span class="badge badge-light-danger ms-2">{{ unpaidShipments.length }}</span>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link text-active-primary py-5 cursor-pointer" :class="{active: activeTab === 'paid'}" @click="activeTab = 'paid'">
              Sudah Lunas
            </a>
          </li>
        </ul>
      </div>

      <div class="card card-flush">
        <div class="card-header align-items-center py-5 gap-2">
          <div class="card-title">
            <div class="d-flex align-items-center position-relative my-1">
              <i class="ki-outline ki-magnifier fs-3 position-absolute ms-4"></i>
              <input type="text" v-model="searchQuery" class="form-control form-control-solid w-250px ps-12" placeholder="Cari Toko..." />
            </div>
          </div>
        </div>
        <div class="card-body pt-0">
          <div class="table-responsive">
            <table class="table align-middle table-row-dashed fs-6 gy-5">
              <thead>
                <tr class="text-start text-gray-500 fw-bold fs-7 text-uppercase gs-0">
                  <th class="min-w-100px">ID Nota</th>
                  <th class="min-w-175px">Partner</th>
                  <th class="text-end min-w-70px">Status</th>
                  <th class="text-end min-w-120px">Wajib Setor</th>
                  <th class="text-end min-w-100px">Aksi</th>
                </tr>
              </thead>
              <tbody class="fw-semibold text-gray-600">
                <tr v-if="loading"><td colspan="5" class="text-center py-10"><span class="spinner-border"></span></td></tr>
                <tr v-else v-for="s in filteredList" :key="s.id" class="cursor-pointer bg-hover-light" @click="openPayModal(s)">
                  <td>#{{ s.id.substring(0, 5).toUpperCase() }}</td>
                  <td>
                    <div class="d-flex align-items-center">
                      <div class="symbol symbol-30px me-3">
                        <div class="symbol-label bg-light-success text-success fw-bold">{{ s.partners?.name?.charAt(0) }}</div>
                      </div>
                      <span class="text-gray-900 fw-bold">{{ s.partners?.name }}</span>
                    </div>
                  </td>
                  <td class="text-end">
                    <span :class="getStatusBadge(s.status)">
                      {{ s.status === 'paid' ? 'LUNAS' : 'PENDING' }}
                    </span>
                  </td>
                  <td class="text-end text-gray-900 fw-bolder">Rp {{ formatNumber(calculateFinalAmount(s)) }}</td>
                  <td class="text-end">
                    <div class="d-flex justify-content-end gap-2">
                      <button class="btn btn-sm btn-icon btn-light-primary"><i class="ki-outline ki-pencil fs-5"></i></button>
                    </div>
                  </td>
                </tr>
                <tr v-if="!loading && filteredList.length === 0">
                  <td colspan="5" class="text-center text-muted py-10">Data tidak ditemukan.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="modal fade" id="modal_pay_action" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered mw-450px">
      <div class="modal-content border-0">
        <div class="modal-header border-0 justify-content-end pb-0">
          <div class="btn btn-icon btn-sm btn-active-light-primary" data-bs-dismiss="modal"><i class="ki-outline ki-cross fs-1"></i></div>
        </div>

        <div class="modal-body scroll-y px-10 pt-0 pb-15">
          <div class="text-center mb-8">
            <h1 class="mb-3 text-gray-900">{{ selectedShipment?.status === 'paid' ? 'Detail Pembayaran' : 'Konfirmasi Pembayaran' }}</h1>
            <div class="text-gray-800 fw-bolder fs-3">{{ selectedShipment?.partners?.name }}</div>
          </div>

          <div class="bg-light rounded p-5 mb-8 border border-dashed border-gray-400">
            <div class="d-flex flex-stack mb-2">
              <span class="text-muted fw-bold fs-7">Total Kirim:</span>
              <span class="text-gray-800 fw-bold">Rp {{ formatNumber(selectedShipment?.total_amount) }}</span>
            </div>
            <div v-if="calculateReturnSummary(selectedShipment).totalDeduction > 0" class="d-flex flex-stack mb-2">
              <span class="text-danger fw-bold fs-7">Potongan Sisa:</span>
              <span class="text-danger fw-bolder">- Rp {{ formatNumber(calculateReturnSummary(selectedShipment).totalDeduction) }}</span>
            </div>
            <div class="separator border-gray-300 my-3"></div>
            <div class="d-flex flex-stack">
              <span class="text-gray-900 fw-bolder fs-5">Wajib Setor:</span>
              <span class="text-success fw-bolder fs-2">Rp {{ formatNumber(calculateFinalAmount(selectedShipment)) }}</span>
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
              Terima Rp {{ formatNumber(calculateFinalAmount(selectedShipment)) }}
            </button>
            <button v-else @click="cancelPayment" class="btn btn-lg btn-light-danger fw-bold w-100 py-4 shadow-sm" :disabled="submitting">
              Batalkan Pelunasan
            </button>
            <button class="btn btn-lg btn-light fw-bold w-100 py-4" data-bs-dismiss="modal">Tutup</button>
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
const searchQuery = ref('')
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
const filteredList = computed(() => {
  const list = activeTab.value === 'unpaid' ? unpaidShipments.value : paidShipments.value
  return list.filter(s => s.partners?.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
})

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

onMounted(() => {
  loadData()
  // @ts-ignore
  payModal = new bootstrap.Modal(document.getElementById('modal_pay_action'))
})
</script>

<style scoped>
.bg-hover-light:hover { background-color: var(--bs-light) !important; transition: background-color 0.2s ease; }
</style>