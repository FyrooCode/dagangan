<template>
  <div id="kt_app_toolbar" class="app-toolbar py-4">
    <div id="kt_app_toolbar_container" class="app-container container-xxl d-flex flex-stack">
      <div class="d-flex align-items-center">
        <router-link to="/" class="btn btn-sm btn-icon btn-danger me-3 shadow-sm">
          <i class="ki-outline ki-arrow-left fs-2 text-white"></i>
        </router-link>
        <h1 class="text-gray-900 fw-bolder fs-2 mb-0">Manajemen Retur</h1>
      </div>
    </div>
  </div>

  <div id="kt_app_content" class="app-content flex-column-fluid pt-0">
    <div id="kt_app_content_container" class="app-container container-xxl">
      
      <div class="p-1 bg-gray-100 rounded-pill d-flex mb-8 shadow-sm border border-gray-200" style="height: 52px;">
        <button 
          @click="activeTab = 'queue'"
          class="btn flex-grow-1 d-flex align-items-center justify-content-center fw-bolder fs-7 transition-all rounded-pill border-0"
          :class="activeTab === 'queue' ? 'bg-danger text-white shadow' : 'text-gray-600'"
        >
          Antrean
          <span class="badge ms-2" :class="activeTab === 'queue' ? 'badge-light text-danger' : 'badge-light-dark'">
            {{ queueShipments.length }}
          </span>
        </button>
        <button 
          @click="activeTab = 'active'"
          class="btn flex-grow-1 d-flex align-items-center justify-content-center fw-bolder fs-7 transition-all rounded-pill border-0"
          :class="activeTab === 'active' ? 'bg-warning text-white shadow' : 'text-gray-600'"
        >
          Diisi
          <span class="badge ms-2" :class="activeTab === 'active' ? 'badge-light text-warning' : 'badge-light-dark'">
            {{ activeShipments.length }}
          </span>
        </button>
        <button 
          @click="activeTab = 'closed'"
          class="btn flex-grow-1 d-flex align-items-center justify-content-center fw-bolder fs-7 transition-all rounded-pill border-0"
          :class="activeTab === 'closed' ? 'bg-success text-white shadow' : 'text-gray-600'"
        >
          Selesai
        </button>
      </div>

      <div v-if="loading" class="text-center py-20">
        <span class="spinner-border text-danger"></span>
        <div class="text-gray-500 mt-3 fw-bold">Memeriksa stok sisa...</div>
      </div>

      <div v-else class="row g-5">
        <div v-for="s in filteredList" :key="s.id" class="col-12 col-md-6 col-xl-4">
          <div class="card card-flush h-100 border border-gray-200 shadow-sm cursor-pointer card-hover" @click="handleRowClick(s)">
            <div class="card-body p-5">
              <div class="d-flex justify-content-between align-items-start mb-4">
                <div>
                  <span class="badge badge-light-dark fw-bold">#{{ s.id.substring(0, 5).toUpperCase() }}</span>
                </div>
                
                <span v-if="activeTab === 'queue'" class="badge badge-light-danger fw-bolder px-3 py-1 text-uppercase">Belum Input Sisa</span>
                <span v-else-if="activeTab === 'active'" class="badge badge-light-warning fw-bolder px-3 py-1 text-uppercase">Proses</span>
                <span v-else class="badge badge-light-success fw-bolder px-3 py-1 text-uppercase">Selesai</span>
              </div>

              <div class="d-flex align-items-center mb-5">
                <div class="symbol symbol-40px symbol-circle me-3">
                  <div class="symbol-label fs-4 bg-light-danger text-danger fw-bolder">
                    {{ s.partners?.name.charAt(0) }}
                  </div>
                </div>
                <div class="d-flex flex-column">
                  <span class="fs-6 fw-bolder text-gray-900 mb-0">{{ s.partners?.name }}</span>
                  <span class="text-muted fs-7 text-truncate w-150px">{{ s.partners?.address || '-' }}</span>
                </div>
              </div>
              
              <div class="separator separator-dashed my-4"></div>
              
              <div class="d-flex flex-column gap-2 mt-2">
                <div class="d-flex justify-content-between align-items-center">
                  <span class="text-gray-400 fs-9 fw-bold text-uppercase">Total Tagihan</span>
                  <span class="fs-6 fw-bolder text-gray-800">Rp {{ formatNumber(s.total_amount) }}</span>
                </div>
                <div v-if="s.status === 'paid'" class="d-flex justify-content-between align-items-center">
                  <span class="text-gray-400 fs-9 fw-bold text-uppercase">Diterima</span>
                  <span class="fs-6 fw-bolder text-success">Rp {{ formatNumber(s.total_received) }}</span>
                </div>
              </div>

              <div class="separator separator-dashed my-4"></div>

              <div class="bg-light-primary rounded-2 p-3 border border-dashed border-primary mb-3">
                <div class="d-flex justify-content-between align-items-center">
                  <span class="text-primary fs-8 fw-bold text-uppercase">Tanggal Kirim:</span>
                  <span class="text-gray-800 fs-7 fw-bolder">{{ formatDate(s.shipment_date) }}</span>
                </div>
              </div>

              <div v-if="s.status === 'paid'" class="bg-light-success rounded-2 p-3 border border-dashed border-success">
                <div class="d-flex justify-content-between align-items-center">
                  <span class="text-success fs-8 fw-bold text-uppercase">Tanggal Lunas:</span>
                  <span class="text-gray-800 fs-7 fw-bolder">{{ getTglLunas(s) }}</span>
                </div>
              </div>

              <div v-if="activeTab === 'queue'" class="bg-light-danger rounded-2 p-3 mt-4 text-center border border-dashed border-danger">
                <span class="text-danger fs-8 fw-bolder">Klik untuk input barang sisa</span>
              </div>

              <div v-else-if="activeTab === 'active' && s.returns?.length" class="bg-light-warning rounded-2 p-3 mt-4 border border-dashed border-warning">
                <div class="d-flex justify-content-between align-items-center">
                  <span class="text-warning fs-8 fw-bold text-uppercase">Tgl Input Sisa:</span>
                  <span class="text-gray-800 fs-7 fw-bolder">{{ formatDate(s.returns[0].return_date) }}</span>
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

  <div class="modal fade" id="modal_retur_action" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered mw-375px">
      <div class="modal-content rounded-4 border-0 shadow-lg">
        <div class="modal-body p-10">
          <div class="text-center mb-6">
            <h1 class="mb-1 text-gray-900 fs-3 fw-bolder">{{ selectedShipment?.partners?.name }}</h1>
            <div class="badge badge-light-dark mb-4">Nota #{{ selectedShipment?.id.substring(0, 5).toUpperCase() }}</div>
            
            <div class="bg-light rounded-3 p-4 border border-dashed border-gray-300">
              <div class="d-flex justify-content-between mb-2">
                <span class="text-muted fs-8 fw-bold text-uppercase">Tgl Kirim:</span>
                <span class="text-gray-800 fs-7 fw-bolder">{{ formatDate(selectedShipment?.shipment_date) }}</span>
              </div>
              <div class="d-flex justify-content-between mb-1">
                <span class="text-muted fs-8 fw-bold text-uppercase">Total Tagihan:</span>
                <span class="text-gray-800 fs-7 fw-bolder">Rp {{ formatNumber(selectedShipment?.total_amount) }}</span>
              </div>

              <template v-if="activeTab === 'queue'">
                <div class="separator separator-dashed my-3"></div>
                <div class="bg-light-danger rounded-3 p-4 border border-dashed border-danger mt-3">
                  <div class="d-flex align-items-center">
                    <i class="ki-outline ki-information-5 fs-1 text-danger me-3"></i>
                    <div class="text-start">
                      <div class="text-danger fw-bolder fs-7 text-uppercase">Silakan Input Sisa Barang</div>
                    </div>
                  </div>
                </div>
              </template>

              <template v-else-if="selectedShipment?.total_retur_nominal > 0">
                <div class="separator separator-dashed my-3"></div>
                <div class="d-flex justify-content-between text-danger mb-3">
                  <span class="fs-8 fw-bold text-uppercase">Total Sisa Barang:</span>
                  <span class="fs-7 fw-bolder">- Rp {{ formatNumber(selectedShipment?.total_retur_nominal) }}</span>
                </div>

                <div class="text-start bg-white rounded-2 p-4 mb-4 border border-gray-200">
                  <div v-for="item in selectedShipment.list_sisa" :key="item.name" class="fs-6 text-gray-800 d-flex justify-content-between mb-2">
                    <span class="fw-semibold">{{ item.name }} ({{ item.qty }} {{ item.unit }})</span>
                    <span class="fw-bolder">Rp {{ formatNumber(item.nominal) }}</span>
                  </div>
                </div>

                <div class="d-flex justify-content-between bg-light-success p-4 rounded border border-success border-dashed">
                  <span class="text-success fs-7 fw-bold text-uppercase">Estimasi Terima Bersih:</span>
                  <span class="text-success fs-5 fw-bolder">Rp {{ formatNumber(selectedShipment?.estimasi_bersih) }}</span>
                </div>
              </template>

              <template v-else-if="activeTab !== 'queue' && activeTab !== 'closed'">
                <div class="separator separator-dashed my-3"></div>
                <div class="bg-light-danger rounded-3 p-4 border border-dashed border-danger">
                  <div class="d-flex align-items-center">
                    <i class="ki-outline ki-information-5 fs-1 text-danger me-3"></i>
                    <div class="text-start">
                      <div class="text-danger fw-bolder fs-7 text-uppercase">Belum Ada Data Sisa</div>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>

          <div class="d-flex flex-column gap-3">
            <template v-if="activeTab === 'queue'">
              <div class="mh-300px scroll-y px-2">
                <div v-for="item in shipmentDetails" :key="item.product_id" class="card border border-dashed border-gray-300 rounded p-4 mb-4 bg-body text-gray-800">
                  <div class="d-flex flex-stack">
                    <div class="d-flex flex-column me-2">
                      <span class="fw-bolder fs-6">{{ item.name }}</span>
                      <span class="text-muted fs-8">Kirim: {{ item.quantity_shipped }} {{ item.unit }}</span>
                    </div>
                    <div class="d-flex align-items-center">
                      <button type="button" class="btn btn-sm btn-icon btn-danger" @click="item.quantity_returned > 0 ? item.quantity_returned-- : null">
                        <i class="ki-outline ki-minus fs-4 text-white"></i>
                      </button>
                      <input type="number" v-model.number="item.quantity_returned" class="form-control form-control-sm border-0 bg-light text-center fw-bolder fs-5 w-60px mx-1" @input="validateInput(item)" />
                      <button type="button" class="btn btn-sm btn-icon btn-success" @click="item.quantity_returned < item.quantity_shipped ? item.quantity_returned++ : null">
                        <i class="ki-outline ki-plus fs-4 text-white"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </template>

            <template v-if="activeTab === 'queue'">
              <button @click="submitRetur" class="btn btn-lg btn-danger w-100 py-4 shadow-sm fw-bold" :disabled="submitting">
                <span v-if="!submitting">Simpan Sisa</span>
                <span v-else class="spinner-border spinner-border-sm"></span>
              </button>
            </template>

            <template v-if="activeTab === 'active'">
              <button @click="handleDelete(selectedShipment.returns[0].id)" class="btn btn-lg btn-danger fw-bold w-100 py-4 shadow-sm">
                <i class="ki-outline ki-trash fs-3 me-2 text-white"></i> Hapus Retur
              </button>
            </template>

            <div v-if="activeTab === 'closed'" class="alert alert-light-success d-flex flex-column align-items-center p-5 text-center">
              <i class="ki-outline ki-check-circle fs-2hx text-success mb-2"></i>
              <div class="fw-bold text-success mb-1 text-uppercase">Sudah Lunas</div>
              <div class="fs-6 text-gray-800 fw-bold">Total Diterima: Rp {{ formatNumber(selectedShipment?.total_received) }}</div>
            </div>

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
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { returnService } from '@/services/ReturnService'
import { shipmentService } from '@/services/ShipmentService'

const route = useRoute()
const allData = ref<any[]>([])
const loading = ref(true)
const submitting = ref(false)
const activeTab = ref('queue')
const searchQuery = ref('')
const selectedShipment = ref<any>(null)
const shipmentDetails = ref<any[]>([])
let actionModal: any = null

async function loadData() {
  loading.value = true
  try {
    allData.value = await returnService.getAllCombined()
    checkAutoOpen()
  } finally {
    loading.value = false
  }
}

function checkAutoOpen() {
  const openID = route.query.openID
  if (openID) {
    const target = queueShipments.value.find(s => s.id === openID)
    if (target) handleRowClick(target)
  }
}

function validateInput(item: any) {
  if (item.quantity_returned > item.quantity_shipped) item.quantity_returned = item.quantity_shipped
  if (item.quantity_returned < 0 || !item.quantity_returned) item.quantity_returned = 0
}

const queueShipments = computed(() => allData.value.filter(s => s.status === 'pending' && (!s.returns || s.returns.length === 0)))
const activeShipments = computed(() => allData.value.filter(s => s.status === 'pending' && s.returns?.length > 0))
const closedShipments = computed(() => allData.value.filter(s => s.status === 'paid'))

const filteredList = computed(() => {
  let list = activeTab.value === 'queue' ? queueShipments.value : (activeTab.value === 'active' ? activeShipments.value : closedShipments.value)
  return list.filter(s => s.partners?.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
})

// Helper untuk dapet tanggal lunas dari array payments
const getTglLunas = (s: any) => {
  if (s.payments && s.payments.length > 0) {
    const dates = s.payments.map((p: any) => new Date(p.payment_date).getTime())
    return formatDate(new Date(Math.max(...dates)).toISOString())
  }
  return '-'
}

async function handleRowClick(s: any) {
  selectedShipment.value = s
  if (activeTab.value === 'queue') {
    const fullShipment = await shipmentService.getById(s.id)
    shipmentDetails.value = fullShipment.shipment_details.map((d: any) => ({
      product_id: d.product_id,
      name: d.products.name,
      unit: d.products.unit,
      quantity_shipped: d.quantity,
      quantity_returned: 0
    }))
  }
  if (actionModal) actionModal.show()
}

async function submitRetur() {
  submitting.value = true
  try {
    const returnData = { shipment_id: selectedShipment.value.id, return_date: new Date().toISOString().split('T')[0] }
    const items = shipmentDetails.value.map(i => ({ product_id: i.product_id, quantity_returned: i.quantity_returned }))
    await returnService.create(returnData, items)
    actionModal.hide()
    await loadData()
    // @ts-ignore
    Swal.fire({ text: "Berhasil disimpan!", icon: "success", timer: 1000, showConfirmButton: false })
  } finally { submitting.value = false }
}

async function handleDelete(id: string) {
  // @ts-ignore
  const res = await Swal.fire({ title: "Hapus?", text: "Data sisa akan dihapus dan balik ke antrean.", icon: "warning", showCancelButton: true, confirmButtonText: 'Ya, Hapus', customClass: { confirmButton: 'btn btn-danger', cancelButton: 'btn btn-light' } })
  if (res.isConfirmed) {
    await returnService.delete(id)
    await loadData()
    actionModal.hide()
  }
}

const formatDate = (d: any) => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'

const formatNumber = (num: any) => new Intl.NumberFormat('id-ID').format(num || 0)

watch(() => route.query.openID, (newVal) => { if (newVal) checkAutoOpen() })

onMounted(async () => {
  // @ts-ignore
  actionModal = new bootstrap.Modal(document.getElementById('modal_retur_action'))
  await loadData()
})
</script>

<style scoped>
.transition-all { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.card-hover { transition: transform 0.15s ease-in-out; }
.card-hover:active { transform: scale(0.97); background-color: #f9f9f9; }
.rounded-pill { border-radius: 50rem !important; }
.btn:focus { box-shadow: none !important; }
</style>