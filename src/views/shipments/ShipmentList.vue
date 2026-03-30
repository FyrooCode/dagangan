<template>
  <div id="kt_app_toolbar" class="app-toolbar py-3 py-lg-0">
    <div id="kt_app_toolbar_container" class="app-container container-xxl d-flex flex-stack flex-wrap gap-2">
      <div class="page-title d-flex flex-column justify-content-center me-3">
        <h1 class="page-heading d-flex text-gray-900 fw-bold fs-3 flex-column justify-content-center my-0">Daftar Pengiriman</h1>
        <ul class="breadcrumb breadcrumb-separatorless fw-semibold fs-7 my-0 pt-1">
          <li class="breadcrumb-item text-muted"><router-link to="/" class="text-muted text-hover-primary">Home</router-link></li>
          <li class="breadcrumb-item"><span class="bullet bg-gray-500 w-5px h-2px"></span></li>
          <li class="breadcrumb-item text-muted">Penjualan</li>
        </ul>
      </div>
      <div class="d-flex align-items-center gap-2 gap-lg-3">
        <router-link to="/shipments/create" class="btn btn-sm fw-bold btn-primary">
          <i class="ki-outline ki-plus fs-4 me-1"></i> Buat Pengiriman
        </router-link>
      </div>
    </div>
  </div>

  <div id="kt_app_content" class="app-content flex-column-fluid">
    <div id="kt_app_content_container" class="app-container container-xxl">
      
      <div class="d-flex flex-stack mb-5 border-bottom border-gray-200">
        <ul class="nav nav-stretch nav-line-tabs nav-line-tabs-2x border-transparent fs-5 fw-bold">
          <li class="nav-item">
            <a class="nav-link text-active-primary py-5 me-10 cursor-pointer" :class="{active: activeTab === 'active'}" @click="activeTab = 'active'">
              Nota Aktif <span class="badge badge-light-danger ms-2">{{ activeShipments.length }}</span>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link text-active-primary py-5 cursor-pointer" :class="{active: activeTab === 'completed'}" @click="activeTab = 'completed'">
              Selesai (Lunas)
            </a>
          </li>
        </ul>
      </div>

      <div class="card card-flush">
        <div class="card-header align-items-center py-5 gap-2 gap-md-5">
          <div class="card-title">
            <div class="d-flex align-items-center position-relative my-1">
              <i class="ki-outline ki-magnifier fs-3 position-absolute ms-4"></i>
              <input type="text" v-model="searchQuery" class="form-control form-control-solid w-250px ps-12" placeholder="Cari Nota/Partner..." />
            </div>
          </div>
        </div>

        <div class="card-body pt-0">
          <div class="table-responsive">
            <table class="table align-middle table-row-dashed fs-6 gy-5">
              <thead>
                <tr class="text-start text-gray-500 fw-bold fs-7 text-uppercase gs-0">
                  <th class="min-w-100px">ID Nota</th>
                  <th class="min-w-175px">Partner / Toko</th>
                  <th class="text-end min-w-125px">Total Tagihan</th>
                  <th class="text-end min-w-150px">Tanggal Kirim</th>
                  <th class="text-end min-w-100px">Aksi</th>
                </tr>
              </thead>
              <tbody class="fw-semibold text-gray-600">
                <tr v-if="loading">
                  <td colspan="5" class="text-center py-10">
                    <span class="spinner-border spinner-border-sm align-middle ms-2"></span> Memuat data...
                  </td>
                </tr>
                <tr v-else v-for="shipment in filteredShipments" :key="shipment.id" 
                  class="cursor-pointer bg-hover-light" @click="openQuickModal(shipment)">
                  <td>
                    <span class="text-gray-800 fw-bold">#{{ shipment.id.substring(0, 5).toUpperCase() }}</span>
                  </td>
                  <td>
                    <div class="d-flex align-items-center">
                      <div class="symbol symbol-circle symbol-35px overflow-hidden me-3">
                        <div class="symbol-label fs-8 bg-light-info text-info fw-bold">
                          {{ shipment.partners?.name.charAt(0) }}
                        </div>
                      </div>
                      <div class="d-flex flex-column">
                        <span class="text-gray-800 fw-bold text-hover-primary">{{ shipment.partners?.name }}</span>
                        <span class="text-muted fs-7 text-truncate" style="max-width: 150px;">{{ shipment.partners?.address || 'Tanpa Alamat' }}</span>
                      </div>
                    </div>
                  </td>
                  <td class="text-end pe-0 text-gray-900 fw-bolder">
                    Rp {{ formatNumber(shipment.total_amount) }}
                  </td>
                  <td class="text-end pe-0">
                    <div class="text-gray-800">{{ formatDate(shipment.shipment_date) }}</div>
                    <div class="text-muted fs-8">Tempo: {{ formatDate(shipment.expected_payment_date) }}</div>
                  </td>
                  <td class="text-end">
                    <div class="d-flex justify-content-end gap-2">
                      <router-link v-if="shipment.status !== 'paid'" :to="`/shipments/edit/${shipment.id}`" @click.stop 
                        class="btn btn-sm btn-icon btn-light-primary">
                        <i class="ki-outline ki-pencil fs-5"></i>
                      </router-link>
                      <button v-if="shipment.status !== 'paid'" @click.stop="handleDelete(shipment.id)" class="btn btn-sm btn-icon btn-light-danger">
                        <i class="ki-outline ki-trash fs-5"></i>
                      </button>
                      <span v-else class="badge badge-light-success fw-bold">LUNAS</span>
                    </div>
                  </td>
                </tr>
                <tr v-if="!loading && filteredShipments.length === 0">
                  <td colspan="5" class="text-center text-muted py-10">Data pengiriman tidak ditemukan.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="modal fade" id="modal_shipment_action" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered mw-400px">
      <div class="modal-content border-0">
        <div class="modal-header border-0 justify-content-end pb-0">
          <div class="btn btn-icon btn-sm btn-active-light-primary ms-2" data-bs-dismiss="modal">
            <i class="ki-outline ki-cross fs-1"></i>
          </div>
        </div>

        <div class="modal-body scroll-y px-10 pt-0 pb-15">
          <div class="text-center mb-8">
            <h1 class="mb-3 text-gray-900">Opsi Pengiriman</h1>
            <div class="text-muted fw-semibold fs-5 mb-1">Nota #{{ selectedShipment?.id.substring(0, 5).toUpperCase() }}</div>
            <div class="text-gray-800 fw-bolder fs-3">{{ selectedShipment?.partners?.name }}</div>
          </div>

          <div class="bg-light rounded p-4 mb-8 border border-dashed border-gray-400">
            <div class="d-flex align-items-center mb-3">
              <i class="ki-outline ki-calendar fs-2 text-primary me-3"></i>
              <div class="d-flex flex-column">
                <span class="text-muted fs-8 fw-bold text-uppercase">Tanggal Kirim</span>
                <span class="text-gray-800 fw-bold">{{ formatDate(selectedShipment?.shipment_date) }}</span>
              </div>
            </div>
            <div class="d-flex align-items-center">
              <i class="ki-outline ki-wallet fs-2 text-success me-3"></i>
              <div class="d-flex flex-column">
                <span class="text-muted fs-8 fw-bold text-uppercase">Total Tagihan</span>
                <span class="text-gray-900 fw-bolder fs-6">Rp {{ formatNumber(selectedShipment?.total_amount) }}</span>
              </div>
            </div>
          </div>

          <div class="d-flex flex-column gap-3">
            <template v-if="selectedShipment?.status !== 'paid'">
              <router-link :to="`/shipments/edit/${selectedShipment?.id}`" 
                class="btn btn-lg btn-light-primary fw-bold w-100 py-4 shadow-sm" @click="quickModal.hide()">
                <i class="ki-outline ki-pencil fs-3 me-2"></i> Edit Rincian Barang
              </router-link>

              <button @click="handleDelete(selectedShipment?.id)" class="btn btn-lg btn-light-danger fw-bold w-100 py-4 shadow-sm">
                <i class="ki-outline ki-trash fs-3 me-2"></i> Hapus Pengiriman
              </button>
            </template>
            <div v-else class="alert alert-light-success border-dashed border-success d-flex align-items-center p-5">
                <i class="ki-outline ki-check-circle fs-2x text-success me-3"></i>
                <div class="fw-bold">Nota ini sudah lunas. Data terkunci.</div>
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
import { shipmentService } from '@/services/ShipmentService'

const shipments = ref<any[]>([])
const loading = ref(true)
const activeTab = ref('active')
const searchQuery = ref('')
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

const filteredShipments = computed(() => {
  const list = activeTab.value === 'active' ? activeShipments.value : completedShipments.value
  return list.filter(s => {
    return s.partners?.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
           s.id.toLowerCase().includes(searchQuery.value.toLowerCase())
  })
})

const formatNumber = (num: any) => new Intl.NumberFormat('id-ID').format(num || 0)
const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

async function handleDelete(id: string) {
  if (quickModal) quickModal.hide()
  // @ts-ignore
  const res = await Swal.fire({
    title: 'Hapus data?',
    text: "Tindakan ini tidak bisa dibatalkan.",
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
.bg-hover-light:hover {
  background-color: var(--bs-light) !important;
  transition: background-color 0.2s ease;
}
</style>