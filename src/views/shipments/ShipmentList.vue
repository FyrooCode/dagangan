<template>
  <div id="kt_app_toolbar" class="app-toolbar py-4">
    <div id="kt_app_toolbar_container" class="app-container container-xxl d-flex flex-stack">
      <div class="d-flex align-items-center">
        <!-- <router-link to="/" class="btn btn-sm btn-icon btn-primary me-3 shadow-sm">
          <i class="ki-outline ki-arrow-left fs-2 text-white"></i>
        </router-link> -->
        <h1 class="text-gray-900 fw-bolder fs-2 mb-0">Pengiriman</h1>
      </div>
      <router-link to="/shipments/create" class="btn btn-primary fw-bold shadow-sm px-5">
        <i class="ki-outline ki-plus fs-2"></i> Baru
      </router-link>
    </div>
  </div>

  <div id="kt_app_content" class="app-content flex-column-fluid pt-0">
    <div id="kt_app_content_container" class="app-container container-xxl">
      
      <div class="p-1 bg-gray-100 rounded-pill d-flex mb-8 shadow-sm border border-gray-200" style="height: 52px;">
        <button @click="activeTab = 'active'" class="btn flex-grow-1 d-flex align-items-center justify-content-center fw-bolder fs-6 transition-all rounded-pill border-0" :class="activeTab === 'active' ? 'bg-primary text-white shadow' : 'text-gray-600'">
          Nota Aktif
          <span class="badge ms-2" :class="activeTab === 'active' ? 'badge-light text-primary' : 'badge-light-dark'">
            {{ activeShipments.length }}
          </span>
        </button>
        <button @click="activeTab = 'completed'" class="btn flex-grow-1 d-flex align-items-center justify-content-center fw-bolder fs-6 transition-all rounded-pill border-0" :class="activeTab === 'completed' ? 'bg-success text-white shadow' : 'text-gray-600'">
          Selesai
        </button>
      </div>

      <div v-if="loading" class="text-center py-20"><span class="spinner-border text-primary"></span></div>

      <div v-else class="row g-5">
        <div v-for="shipment in filteredShipments" :key="shipment.id" class="col-12 col-md-6 col-xl-4">
          <div class="card card-flush h-100 border border-gray-200 shadow-sm cursor-pointer card-hover" @click="openQuickModal(shipment)">
            <div class="card-body p-5">
              <div class="d-flex justify-content-between align-items-start mb-4">
                <span class="badge badge-light-dark fw-bold">#{{ shipment.id.substring(0, 5).toUpperCase() }}</span>
                <div class="d-flex gap-2">
                  <span v-if="shipment.returns?.length > 0 && shipment.status !== 'paid'" :class="getTotalSisaItemCount(shipment) > 0 ? 'badge badge-warning fw-bold text-white px-3 py-1' : 'badge badge-info fw-bold text-white px-3 py-1'">
                    {{ getTotalSisaItemCount(shipment) > 0 ? 'SISA ' + getTotalSisaItemCount(shipment) : 'SISA 0' }}
                  </span>
                  <span v-if="shipment.status === 'paid'" class="badge badge-success fw-bolder px-3 py-1">LUNAS</span>
                  <span v-else class="badge badge-danger fw-bolder px-3 py-1 text-white text-uppercase">Belum Bayar</span>
                </div>
              </div>

              <div class="d-flex align-items-center mb-5">
                <div class="symbol symbol-40px symbol-circle me-3">
                  <div class="symbol-label fs-4 bg-light-primary text-primary fw-bolder">{{ shipment.partners?.name.charAt(0) }}</div>
                </div>
                <div class="d-flex flex-column">
                  <span class="fs-6 fw-bolder text-gray-900 mb-0">{{ shipment.partners?.name }}</span>
                  <span class="text-muted fs-7 text-truncate w-150px">{{ shipment.partners?.address || '-' }}</span>
                </div>
              </div>
              
              <div class="separator separator-dashed my-4"></div>
              
              <div class="d-flex flex-column gap-2 mt-2">
                <div class="d-flex justify-content-between align-items-center">
                  <span class="text-gray-400 fs-9 fw-bold text-uppercase">Total Tagihan</span>
                  <span class="fs-6 fw-bolder text-gray-800">Rp {{ formatNumber(shipment.total_amount) }}</span>
                </div>
                <div v-if="shipment.status === 'paid'" class="d-flex justify-content-between align-items-center">
                  <span class="text-gray-400 fs-9 fw-bold text-uppercase">Diterima</span>
                  <span class="fs-6 fw-bolder text-success">Rp {{ formatNumber(shipment.total_received) }}</span>
                </div>
              </div>

              <div class="separator separator-dashed my-4"></div>

              <div class="bg-light-primary rounded-2 p-3 border border-dashed border-primary mb-3">
                <div class="d-flex justify-content-between align-items-center">
                  <span class="text-primary fs-8 fw-bold text-uppercase">Tanggal Kirim:</span>
                  <span class="text-gray-800 fs-7 fw-bolder">{{ formatDate(shipment.shipment_date) }}</span>
                </div>
              </div>

              <div v-if="shipment.status === 'paid'" class="bg-light-success rounded-2 p-3 border border-dashed border-success">
                <div class="d-flex justify-content-between align-items-center">
                  <span class="text-success fs-8 fw-bold text-uppercase">Tanggal Lunas:</span>
                  <span class="text-gray-800 fs-7 fw-bolder">{{ formatDate(shipment.tgl_lunas) }}</span>
                </div>
              </div>
              <div v-else class="bg-light-warning rounded-2 p-3 border border-dashed border-warning">
                <div class="d-flex justify-content-between align-items-center">
                  <span class="text-warning fs-8 fw-bold text-uppercase">Perkiraan Masuk:</span>
                  <span class="text-gray-800 fs-7 fw-bolder">{{ formatDate(shipment.expected_payment_date) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="modal fade" id="modal_shipment_action" tabindex="-1" aria-hidden="true">
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

              <template v-if="selectedShipment?.returns?.length > 0">
                <div class="separator separator-dashed my-3"></div>
                <div class="d-flex justify-content-between text-danger mb-3">
                  <span class="fs-8 fw-bold text-uppercase">Total Sisa Barang:</span>
                  <span class="fs-7 fw-bolder">- Rp {{ formatNumber(selectedShipment?.total_retur_nominal) }}</span>
                </div>

                <div class="text-start bg-white rounded-2 p-4 mb-4 border border-gray-200">
                  <div v-if="selectedShipment.list_sisa?.length > 0">
                    <div v-for="item in selectedShipment.list_sisa" :key="item.name" class="fs-6 text-gray-800 d-flex justify-content-between mb-2">
                      <span class="fw-semibold">{{ item.name }} ({{ item.qty }} {{ item.unit }})</span>
                      <span class="fw-bolder">Rp {{ formatNumber(item.nominal) }}</span>
                    </div>
                  </div>
                  <div v-else class="text-center text-muted fs-8 fw-bold">
                    Tidak ada barang sisa
                  </div>
                </div>

                <div class="d-flex justify-content-between bg-light-success p-4 rounded border border-success border-dashed">
                  <span class="text-success fs-7 fw-bold text-uppercase">Estimasi Terima Bersih:</span>
                  <span class="text-success fs-5 fw-bolder">Rp {{ formatNumber(selectedShipment?.estimasi_bersih) }}</span>
                </div>
              </template>

              <template v-else-if="selectedShipment?.status !== 'paid'">
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
            <template v-if="selectedShipment?.status !== 'paid'">
              <router-link :to="{ path: '/returns', query: { openID: selectedShipment?.id } }" 
                class="btn btn-lg btn-success fw-bold w-100 py-4 shadow-sm" @click="quickModal.hide()">
                <i class="ki-outline ki-arrows-loop fs-3 me-2"></i> 
                {{ selectedShipment?.total_retur_nominal > 0 ? 'Edit Sisa Barang' : 'Input Sisa Barang' }}
              </router-link>

              <router-link :to="`/shipments/edit/${selectedShipment?.id}`" class="btn btn-lg btn-primary fw-bold w-100 py-4 shadow-sm" @click="quickModal.hide()">
                <i class="ki-outline ki-pencil fs-3 me-2"></i> Edit Nota
              </router-link>

              <button @click="handleDelete(selectedShipment?.id)" class="btn btn-lg btn-danger fw-bold w-100 py-4 shadow-sm">
                <i class="ki-outline ki-trash fs-3 me-2 text-white"></i> Hapus Pengiriman
              </button>
            </template>

            <div v-else class="alert alert-light-success d-flex flex-column align-items-center p-5 text-center">
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
import { ref, computed, onMounted } from 'vue'
import { shipmentService } from '@/services/ShipmentService'

const shipments = ref<any[]>([])
const loading = ref(true)
const activeTab = ref('active')
const selectedShipment = ref<any>(null)
let quickModal: any = null

async function fetchShipments() {
  loading.value = true
  try {
    const data = await shipmentService.getAll()
    shipments.value = data || []
  } catch (error: any) {
    console.error('Error:', error.message)
  } finally {
    loading.value = false
  }
}

const openQuickModal = (shipment: any) => {
  selectedShipment.value = shipment
  quickModal.show()
}

const activeShipments = computed(() => shipments.value.filter(s => s.status !== 'paid'))
const completedShipments = computed(() => shipments.value.filter(s => s.status === 'paid'))
const filteredShipments = computed(() => activeTab.value === 'active' ? activeShipments.value : completedShipments.value)

const getTotalSisaItemCount = (s: any) => {
  return s.list_sisa?.reduce((sum: number, item: any) => sum + (item.qty || 0), 0) || 0
}

const formatNumber = (num: any) => new Intl.NumberFormat('id-ID').format(num || 0)
const formatDate = (date: string) => !date ? '-' : new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })

async function handleDelete(id: string) {
  if (quickModal) quickModal.hide()
  // @ts-ignore
  const res = await Swal.fire({ 
    title: 'Hapus Pengiriman?', 
    text: "Semua data terkait (termasuk data sisa) akan ikut terhapus!",
    icon: 'warning', 
    showCancelButton: true, 
    confirmButtonText: 'Ya, Hapus', 
    customClass: { confirmButton: 'btn btn-danger', cancelButton: 'btn btn-light' } 
  })
  if (res.isConfirmed) {
    try { 
      await shipmentService.delete(id)
      fetchShipments() 
    } catch (error: any) { 
      alert(error.message) 
    }
  }
}

onMounted(() => {
  fetchShipments()
  // @ts-ignore
  quickModal = new bootstrap.Modal(document.getElementById('modal_shipment_action'))
})
</script>

<style scoped>
.transition-all { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.card-hover { transition: transform 0.15s ease-in-out; }
.card-hover:active { transform: scale(0.97); background-color: #f9f9f9; }
.btn:focus { box-shadow: none !important; }
#kt_app_content {
  padding-bottom: 7rem;
}
</style>