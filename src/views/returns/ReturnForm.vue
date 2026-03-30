<template>
  <div id="kt_app_toolbar" class="app-toolbar py-3 py-lg-0">
    <div id="kt_app_toolbar_container" class="app-container container-xxl d-flex flex-stack flex-wrap gap-2">
      <div class="page-title d-flex flex-column justify-content-center me-3">
        <h1 class="page-heading d-flex text-gray-900 fw-bold fs-3 flex-column justify-content-center my-0">Input Barang Sisa (Retur)</h1>
        <ul class="breadcrumb breadcrumb-separatorless fw-semibold fs-7 my-0 pt-1">
          <li class="breadcrumb-item text-muted"><router-link to="/" class="text-muted text-hover-primary">Home</router-link></li>
          <li class="breadcrumb-item"><span class="bullet bg-gray-500 w-5px h-2px"></span></li>
          <li class="breadcrumb-item text-muted">Retur</li>
          <li class="breadcrumb-item"><span class="bullet bg-gray-500 w-5px h-2px"></span></li>
          <li class="breadcrumb-item text-muted">Baru</li>
        </ul>
      </div>
    </div>
  </div>

  <div id="kt_app_content" class="app-content flex-column-fluid pb-20">
    <div id="kt_app_content_container" class="app-container container-xxl">
      <form class="form d-flex flex-column flex-lg-row" @submit.prevent="handleSubmit">
        
        <div class="w-100 flex-lg-row-auto w-lg-300px mb-7 me-lg-10">
          <div class="card card-flush py-4">
            <div class="card-header"><div class="card-title"><h2>Pilih Nota</h2></div></div>
            <div class="card-body pt-0">
              <div class="d-flex flex-column gap-10">
                <div class="fv-row">
                  <label class="required form-label">Nota Pengiriman</label>
                  <select v-model="form.shipment_id" class="form-select form-select-solid mb-2" required @change="handleShipmentChange">
                    <option value="">Pilih Nota</option>
                    <option v-for="s in availableShipments" :key="s.id" :value="s.id">
                      #{{ s.id.substring(0,5).toUpperCase() }} - {{ s.partners?.name }} ({{ formatDate(s.shipment_date) }})
                    </option>
                  </select>
                  <div v-if="availableShipments.length === 0" class="alert alert-light-info p-3 fs-8 mb-0 mt-2">
                    Jika nota tidak ada, maka sudah ada retur atau belum ada pengiriman yang dilakukan.
                  </div>
                </div>
                <div class="fv-row">
                  <label class="required form-label">Tanggal Retur</label>
                  <input type="date" v-model="form.return_date" class="form-control form-control-solid mb-2" required />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="d-flex flex-column flex-lg-row-fluid gap-7 gap-lg-10">
          <div class="card card-flush py-4">
            <div class="card-header"><div class="card-title"><h2>Rincian Barang Sisa</h2></div></div>
            <div class="card-body pt-0">
                <div class="nota-container border border-dashed rounded p-5 mb-5 bg-light min-h-100px">
                  <div v-if="!form.shipment_id" class="text-muted text-center py-10">
                    <i class="ki-outline ki-information-5 fs-2x mb-3 text-warning"></i>
                    <p>Silahkan pilih nota pengiriman terlebih dahulu.</p>
                  </div>
                  
                  <div v-else v-for="item in selectedItems" :key="item.product_id" class="card card-bordered bg-body mb-4">
                    <div class="card-body p-4">
                      <div class="d-flex justify-content-between align-items-center">
                          <div class="d-flex flex-column">
                            <span class="fw-bolder text-gray-900 fs-5">{{ item.name }}</span>
                            <span class="text-muted fs-7">Jumlah Kirim: <b>{{ item.quantity_shipped }}</b></span>
                          </div>
                          
                          <div class="w-125px">
                              <label class="fs-8 text-uppercase fw-bold text-danger mb-1 d-block text-center">Jumlah Sisa</label>
                              <input type="number" 
                                     v-model.number="item.quantity_returned" 
                                     class="form-control form-control-solid form-control-sm text-center no-spinner border-danger" 
                                     min="0" 
                                     :max="item.quantity_shipped" />
                          </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-if="form.shipment_id" class="card bg-light-danger border border-danger border-dashed">
                  <div class="card-body p-5">
                    <div class="fs-8 text-danger fw-bold text-uppercase mb-4">Ringkasan Penjualan:</div>
                    <div v-for="item in selectedItems" :key="'sum-' + item.product_id" class="d-flex flex-stack fs-7 mb-2">
                        <span class="text-gray-700">{{ item.name }}</span>
                        <div class="text-end">
                            <span class="text-gray-600">{{ item.quantity_shipped }} Kirim - {{ item.quantity_returned }} Sisa = </span>
                            <span class="text-gray-900 fw-bolder">{{ item.quantity_shipped - item.quantity_returned }} Laku</span>
                        </div>
                    </div>
                    <div class="separator border-gray-400 my-4"></div>
                    <div class="d-flex flex-stack">
                      <div class="d-flex flex-column">
                        <span class="text-gray-900 fw-bolder fs-3">Total Barang Sisa</span>
                        <span class="text-muted fs-8">Fisik yang ditarik kembali</span>
                      </div>
                      <span class="text-danger fw-bolder fs-1">{{ totalReturned }} Item</span>
                    </div>
                  </div>
                </div>
            </div>
          </div>

          <div class="d-flex justify-content-end gap-3 pb-10">
            <router-link to="/returns" class="btn btn-light fw-bold">Batal</router-link>
            <button type="submit" class="btn btn-danger fw-bold" :disabled="submitting || !form.shipment_id">
              <span v-if="!submitting">Simpan Data Sisa</span>
              <span v-else><span class="spinner-border spinner-border-sm align-middle ms-2"></span></span>
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { returnService } from '@/services/ReturnService'
import { shipmentService } from '@/services/ShipmentService'

const router = useRouter()
const availableShipments = ref<any[]>([])
const submitting = ref(false)

const form = ref({
  shipment_id: '',
  return_date: new Date().toISOString().split('T')[0],
  notes: ''
})

const selectedItems = ref<any[]>([])

async function loadInitialData() {
  try {
    const data = await shipmentService.getAll()
    availableShipments.value = data || []
  } catch (error) {
    console.error("Gagal load nota")
  }
}

async function handleShipmentChange() {
  if (!form.value.shipment_id) {
    selectedItems.value = []
    return
  }

  try {
    const shipment = await shipmentService.getById(form.value.shipment_id)
    if (shipment) {
      selectedItems.value = shipment.shipment_details.map((d: any) => ({
        product_id: d.product_id,
        name: d.products.name,
        quantity_shipped: d.quantity,
        quantity_returned: 0
      }))
    }
  } catch (error) {
    console.error("Gagal load detail nota")
  }
}

const totalReturned = computed(() => {
  return selectedItems.value.reduce((acc, curr) => acc + (curr.quantity_returned || 0), 0)
})

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })
}

async function handleSubmit() {
  const invalid = selectedItems.value.some(i => i.quantity_returned > i.quantity_shipped)
  if (invalid) {
    // @ts-ignore
    Swal.fire({ text: "Jumlah sisa tidak boleh melebihi jumlah kirim!", icon: "error" })
    return
  }

  submitting.value = true
  try {
    const returnData = {
      shipment_id: form.value.shipment_id,
      return_date: form.value.return_date,
      notes: form.value.notes
    }

    const items = selectedItems.value.map(i => ({
      product_id: i.product_id,
      quantity_returned: i.quantity_returned
    }))

    await returnService.create(returnData, items)
    // @ts-ignore
    Swal.fire({ text: "Data sisa berhasil disimpan!", icon: "success", timer: 1500, showConfirmButton: false })
    router.push('/returns')
  } catch (error: any) {
    // @ts-ignore
    Swal.fire({ title: "Gagal!", text: error.message, icon: "error" })
  } finally {
    submitting.value = false
  }
}

onMounted(() => loadInitialData())
</script>

<style scoped>
.no-spinner::-webkit-inner-spin-button, .no-spinner::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
.no-spinner { -moz-appearance: textfield; }
.nota-container { scrollbar-width: thin; }
@media (max-width: 991px) { .nota-container { max-height: none !important; overflow: visible !important; } }
@media (min-width: 992px) { .nota-container { max-height: 400px; overflow-y: auto; } }
</style>