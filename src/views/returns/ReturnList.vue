<template>
  <div id="kt_app_toolbar" class="app-toolbar py-3 py-lg-0">
    <div id="kt_app_toolbar_container" class="app-container container-xxl d-flex flex-stack flex-wrap gap-2">
      <div class="page-title d-flex flex-column justify-content-center">
        <h1 class="page-heading d-flex text-gray-900 fw-bold fs-3 flex-column justify-content-center my-0">Manajemen Retur</h1>
      </div>
    </div>
  </div>

  <div id="kt_app_content" class="app-content flex-column-fluid pb-20">
    <div id="kt_app_content_container" class="app-container container-xxl">
      
      <div class="d-flex flex-stack mb-5 border-bottom border-gray-200 overflow-auto">
        <ul class="nav nav-stretch nav-line-tabs nav-line-tabs-2x border-transparent fs-5 fw-bold flex-nowrap text-nowrap">
          <li class="nav-item">
            <a class="nav-link text-active-primary py-5 me-5 me-lg-10 cursor-pointer" :class="{active: activeTab === 'queue'}" @click="activeTab = 'queue'">
              Antrean <span class="badge badge-light-danger ms-2">{{ queueShipments.length }}</span>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link text-active-primary py-5 me-5 me-lg-10 cursor-pointer" :class="{active: activeTab === 'active'}" @click="activeTab = 'active'">
              Sudah Diisi <span class="badge badge-light-warning ms-2">{{ activeShipments.length }}</span>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link text-active-primary py-5 cursor-pointer" :class="{active: activeTab === 'closed'}" @click="activeTab = 'closed'">
              Selesai
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
                  <th class="min-w-100px">Tgl Nota</th>
                  <th class="min-w-175px">Partner / Toko</th>
                  <th class="text-end min-w-100px">Nota Asal</th>
                  <th class="text-end min-w-100px" v-if="activeTab !== 'queue'">ID Retur</th>
                  <th class="text-end min-w-100px">Aksi</th>
                </tr>
              </thead>
              <tbody class="fw-semibold text-gray-600">
                <tr v-if="loading"><td colspan="6" class="text-center py-10"><span class="spinner-border"></span></td></tr>
                <tr v-else v-for="s in filteredList" :key="s.id" class="cursor-pointer bg-hover-light" @click="handleRowClick(s)">
                  <td>{{ formatDate(s.shipment_date) }}</td>
                  <td>
                    <div class="d-flex align-items-center">
                      <div class="symbol symbol-30px me-3">
                        <div class="symbol-label bg-light-primary text-primary">{{ s.partners?.name?.charAt(0) }}</div>
                      </div>
                      <span class="text-gray-900 fw-bold">{{ s.partners?.name }}</span>
                    </div>
                  </td>
                  <td class="text-end"><span class="badge badge-light-dark">#{{ s.id.substring(0,5).toUpperCase() }}</span></td>
                  <td class="text-end" v-if="activeTab !== 'queue'">
                    <span v-if="s.returns?.length" class="badge badge-light-danger">#{{ s.returns[0].id.substring(0,5).toUpperCase() }}</span>
                  </td>
                  <td class="text-end">
                    <div class="d-flex justify-content-end gap-2">
                      <button v-if="activeTab === 'queue'" class="btn btn-sm btn-primary fw-bold">Input Sisa</button>
                      <button v-else-if="activeTab === 'active'" @click.stop="handleDelete(s.returns[0].id)" class="btn btn-sm btn-icon btn-light-danger">
                        <i class="ki-outline ki-trash fs-5"></i>
                      </button>
                      <span v-else class="badge badge-light-success fw-bold">LUNAS</span>
                    </div>
                  </td>
                </tr>
                <tr v-if="!loading && filteredList.length === 0">
                  <td colspan="6" class="text-center text-muted py-10">Data tidak ditemukan.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="modal fade" id="modal_retur_action" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered mw-450px">
      <div class="modal-content border-0">
        <div class="modal-header border-0 justify-content-end pb-0">
          <div class="btn btn-icon btn-sm btn-active-light-primary ms-2" data-bs-dismiss="modal">
            <i class="ki-outline ki-cross fs-1"></i>
          </div>
        </div>
        <div class="modal-body scroll-y px-10 pt-0 pb-15">
          <div class="text-center mb-8">
            <h1 class="mb-3 text-gray-900">{{ activeTab === 'queue' ? 'Input Barang Sisa' : 'Detail Barang Sisa' }}</h1>
            <div class="text-gray-800 fw-bolder fs-3">{{ selectedShipment?.partners?.name }}</div>
          </div>

          <div class="bg-light-danger rounded p-4 mb-8 border border-dashed border-danger">
            <div class="d-flex flex-stack mb-2">
              <span class="text-gray-700 fw-bold fs-7">Nota Asal:</span>
              <span class="text-gray-900 fw-bolder">#{{ selectedShipment?.id.substring(0,5).toUpperCase() }}</span>
            </div>
            <div class="d-flex flex-stack">
              <span class="text-gray-700 fw-bold fs-7">Tgl Kirim:</span>
              <span class="text-gray-900 fw-bolder">{{ formatDate(selectedShipment?.shipment_date) }}</span>
            </div>
          </div>

          <div class="mh-400px scroll-y">
            <template v-if="activeTab === 'queue'">
              <div v-for="item in shipmentDetails" :key="item.product_id" class="card border border-dashed border-gray-400 rounded p-4 mb-4 bg-body">
                <div class="d-flex flex-stack">
                  <div class="d-flex flex-column">
                    <span class="fw-bolder text-gray-900 fs-6">{{ item.name }}</span>
                    <span class="text-muted fs-7">Kirim: <b>{{ item.quantity_shipped }} {{ item.unit }}</b></span>
                  </div>
                  
                  <div class="d-flex align-items-center">
                    <button type="button" class="btn btn-sm btn-icon btn-light-danger btn-active-danger" 
                      @click="item.quantity_returned > 0 ? item.quantity_returned-- : null">
                      <i class="ki-outline ki-minus fs-4"></i>
                    </button>
                    
                    <input type="number" 
                      v-model.number="item.quantity_returned" 
                      class="form-control form-control-sm border-0 bg-light text-center fw-bolder fs-5 w-60px no-spinner mx-1" 
                      @input="validateInput(item)"
                      min="0" 
                      :max="item.quantity_shipped" />
                    
                    <button type="button" class="btn btn-sm btn-icon btn-light-success btn-active-success" 
                      @click="item.quantity_returned < item.quantity_shipped ? item.quantity_returned++ : null">
                      <i class="ki-outline ki-plus fs-4"></i>
                    </button>
                  </div>
                </div>
              </div>
            </template>

            <template v-else>
              <div v-for="rd in selectedShipment?.returns[0]?.return_details" :key="rd.id" 
                class="card border border-dashed border-gray-400 rounded p-4 mb-4 bg-body">
                <div class="d-flex flex-stack">
                  <div class="d-flex flex-column">
                    <span class="fw-bolder text-gray-900 fs-6">{{ rd.products?.name }}</span>
                    <span class="text-muted fs-7">Satuan: {{ rd.products?.unit }}</span>
                  </div>
                  <div class="text-end">
                    <span class="text-danger fw-bolder fs-3">{{ rd.quantity_returned }}</span>
                    <span class="text-muted fs-8 ms-1">Sisa</span>
                  </div>
                </div>
              </div>
            </template>
          </div>

          <div class="d-flex flex-column gap-3 mt-8">
            <button v-if="activeTab === 'queue'" @click="submitRetur" 
              class="btn btn-lg btn-danger w-100 py-4 shadow-sm fw-bold" :disabled="submitting">
              <span v-if="!submitting"><i class="ki-outline ki-check fs-3 me-2"></i> Simpan Data Sisa</span>
              <span v-else class="spinner-border spinner-border-sm me-2"></span>
            </button>
            
            <button v-if="activeTab === 'active'" @click="handleDelete(selectedShipment.returns[0].id)" 
              class="btn btn-lg btn-light-danger w-100 py-4 fw-bold">
              <i class="ki-outline ki-trash fs-3 me-2"></i> Hapus Data Retur
            </button>

            <div v-if="activeTab === 'closed'" class="alert alert-light-success border-dashed border-success d-flex align-items-center p-5">
                <i class="ki-outline ki-check-circle fs-2x text-success me-3"></i>
                <div class="fw-bold">Nota ini sudah lunas. Data dikunci.</div>
            </div>

            <button class="btn btn-lg btn-light fw-bold w-100 py-4" data-bs-dismiss="modal">Tutup</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { returnService } from '@/services/ReturnService'
import { shipmentService } from '@/services/ShipmentService'

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
  } finally {
    loading.value = false
  }
}

function validateInput(item: any) {
  if (item.quantity_returned > item.quantity_shipped) {
    item.quantity_returned = item.quantity_shipped
  }
  if (item.quantity_returned < 0 || !item.quantity_returned) {
    item.quantity_returned = 0
  }
}

const queueShipments = computed(() => allData.value.filter(s => s.status === 'pending' && (!s.returns || s.returns.length === 0)))
const activeShipments = computed(() => allData.value.filter(s => s.status === 'pending' && s.returns?.length > 0))
const closedShipments = computed(() => allData.value.filter(s => s.status === 'paid'))

const filteredList = computed(() => {
  let list = []
  if (activeTab.value === 'queue') list = queueShipments.value
  else if (activeTab.value === 'active') list = activeShipments.value
  else list = closedShipments.value
  return list.filter(s => s.partners?.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
})

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
  actionModal.show()
}

async function submitRetur() {
  submitting.value = true
  try {
    const returnData = { 
      shipment_id: selectedShipment.value.id, 
      return_date: new Date().toISOString().split('T')[0] 
    }
    const items = shipmentDetails.value.map(i => ({ 
      product_id: i.product_id, 
      quantity_returned: i.quantity_returned 
    }))
    await returnService.create(returnData, items)
    actionModal.hide()
    await loadData()
    // @ts-ignore
    Swal.fire({ text: "Data sisa berhasil disimpan!", icon: "success", timer: 1500, showConfirmButton: false })
  } finally { submitting.value = false }
}

async function handleDelete(id: string) {
  // @ts-ignore
  const res = await Swal.fire({ 
    title: "Hapus retur ini?", 
    text: "Status nota akan kembali ke antrean.", 
    icon: "warning", 
    showCancelButton: true 
  })
  if (res.isConfirmed) {
    await returnService.delete(id)
    await loadData()
    actionModal.hide()
  }
}

const formatDate = (d: any) => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'

onMounted(() => {
  loadData()
  // @ts-ignore
  actionModal = new bootstrap.Modal(document.getElementById('modal_retur_action'))
})
</script>

<style scoped>
.bg-hover-light:hover { background-color: var(--bs-light) !important; transition: background-color 0.2s ease; }
.no-spinner::-webkit-inner-spin-button, .no-spinner::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
.no-spinner { -moz-appearance: textfield; }

/* Menghilangkan scrollbar tapi tetep bisa di-scroll */
.overflow-auto::-webkit-scrollbar {
    display: none;
}
.overflow-auto {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>