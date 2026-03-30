<template>
  <div id="kt_app_toolbar" class="app-toolbar py-3 py-lg-0">
    <div id="kt_app_toolbar_container" class="app-container container-xxl d-flex flex-stack flex-wrap gap-2">
      <div class="page-title d-flex flex-column justify-content-center me-3">
        <h1 class="page-heading d-flex text-gray-900 fw-bold fs-3 flex-column justify-content-center my-0">
          {{ isEditMode ? 'Edit Pengiriman' : 'Buat Pengiriman' }}
        </h1>
        <ul class="breadcrumb breadcrumb-separatorless fw-semibold fs-7 my-0 pt-1">
          <li class="breadcrumb-item text-muted"><router-link to="/" class="text-muted text-hover-primary">Home</router-link></li>
          <li class="breadcrumb-item"><span class="bullet bg-gray-500 w-5px h-2px"></span></li>
          <li class="breadcrumb-item text-muted">Penjualan</li>
          <li class="breadcrumb-item"><span class="bullet bg-gray-500 w-5px h-2px"></span></li>
          <li class="breadcrumb-item text-muted">{{ isEditMode ? 'Edit' : 'Baru' }}</li>
        </ul>
      </div>
    </div>
  </div>

  <div id="kt_app_content" class="app-content flex-column-fluid pb-20">
    <div id="kt_app_content_container" class="app-container container-xxl">
      <div v-if="loadingData" class="text-center py-20">
        <span class="spinner-border text-primary"></span>
        <div class="text-muted mt-3">Menarik data nota...</div>
      </div>

      <form v-else class="form d-flex flex-column flex-lg-row" @submit.prevent="handleSubmit">
        
        <div class="w-100 flex-lg-row-auto w-lg-300px mb-7 me-lg-10">
          <div class="card card-flush py-4">
            <div class="card-header"><div class="card-title"><h2>Detail Nota</h2></div></div>
            <div class="card-body pt-0">
              <div class="d-flex flex-column gap-10">
                <div class="fv-row">
                  <label class="required form-label">Partner / Toko</label>
                  <select v-model="form.partner_id" class="form-select form-select-solid mb-2" required @change="updateMarkupValue">
                    <option value="">Pilih Partner</option>
                    <option v-for="p in partners" :key="p.id" :value="p.id">{{ p.name }}</option>
                  </select>
                  <div v-if="!form.partner_id" class="alert alert-light-warning border border-warning border-dashed d-flex align-items-center p-3 mb-0">
                    <i class="ki-outline ki-information-5 fs-4 text-warning me-2"></i>
                    <span class="fs-8 fw-bold text-warning">Pilih partner untuk kalkulasi jual.</span>
                  </div>
                  <div v-else class="badge badge-light-primary d-flex align-items-center p-2">
                    <i class="ki-outline ki-percentage fs-6 me-2 text-primary"></i>
                    <span class="fw-bold">Markup Partner: Rp {{ formatNumber(currentMarkup) }}</span>
                  </div>
                </div>
                <div class="fv-row">
                  <label class="required form-label">Tanggal Kirim</label>
                  <input type="date" v-model="form.shipment_date" class="form-control form-control-solid mb-2" required />
                </div>
                <div class="fv-row">
                  <label class="required form-label">Estimasi Bayar</label>
                  <input type="date" v-model="form.expected_payment_date" class="form-control form-control-solid mb-2" required />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="d-flex flex-column flex-lg-row-fluid gap-7 gap-lg-10">
          <div class="card card-flush py-4 order-1">
            <div class="card-header"><div class="card-title"><h2>Pilih Produk</h2></div></div>
            <div class="card-body pt-0">
                <div class="d-flex align-items-center position-relative mb-5">
                  <i class="ki-outline ki-magnifier fs-3 position-absolute ms-4"></i>
                  <input type="text" v-model="searchQuery" class="form-control form-control-solid ps-12" placeholder="Cari Produk..." />
                </div>
                <div class="table-responsive" style="max-height: 350px; overflow-y: auto;">
                  <table class="table align-middle table-row-dashed fs-6 gy-5">
                    <thead>
                      <tr class="text-start text-gray-500 fw-bold fs-7 text-uppercase">
                        <th class="w-25px"></th>
                        <th>Produk</th>
                        <th class="text-end">Harga Dasar</th>
                      </tr>
                    </thead>
                    <tbody class="text-gray-600 fw-semibold">
                      <tr v-for="prod in filteredProducts" :key="prod.id">
                        <td>
                          <div class="form-check form-check-sm form-check-custom form-check-solid">
                            <input class="form-check-input" type="checkbox" :checked="isProductSelected(prod.id)" @change="toggleProduct(prod)" />
                          </div>
                        </td>
                        <td class="fw-bold text-gray-900">{{ prod.name }}</td>
                        <td class="text-end text-nowrap">Rp {{ formatNumber(prod.base_price) }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
            </div>
          </div>

          <div class="card card-flush py-4 order-2">
            <div class="card-header"><div class="card-title"><h2>Nota Pengiriman</h2></div></div>
            <div class="card-body pt-0">
                <div class="nota-container border border-dashed rounded p-5 mb-5 bg-light min-h-100px">
                  <div v-if="selectedItems.length === 0" class="text-muted text-center py-5">Belum ada produk dipilih.</div>
                  <div v-else v-for="(item, index) in selectedItems" :key="item.product_id" class="card card-bordered bg-body mb-4 position-relative">
                    <button type="button" @click="removeItem(index)" class="btn btn-icon btn-sm btn-light-danger position-absolute top-0 end-0 mt-n3 me-n3 rounded-circle shadow-sm" style="z-index: 5;">
                        <i class="ki-outline ki-cross fs-4"></i>
                    </button>
                    <div class="card-body p-4">
                      <div class="d-flex justify-content-between align-items-center">
                          <span class="fw-bolder text-gray-900 fs-5">{{ item.name }}</span>
                          <div class="w-100px">
                              <label class="fs-8 text-uppercase fw-bold text-muted mb-1 d-block text-center">Jumlah</label>
                              <input type="number" v-model.number="item.quantity" class="form-control form-control-solid form-control-sm text-center no-spinner" min="0" />
                          </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="card bg-light-dark border border-secondary border-dashed">
                  <div class="card-body p-5">
                    <div class="row">
                        <div class="col-md-6 border-end-md border-gray-300">
                            <div class="fs-8 text-primary fw-bold text-uppercase mb-3">Rincian Setoran (Modal):</div>
                            <div v-for="item in selectedItems" :key="'base-' + item.product_id" class="d-flex flex-stack fs-7 mb-1">
                                <span class="text-gray-700">{{ item.name }} ({{ item.quantity }}x)</span>
                                <span class="text-gray-900 fw-bold">Rp {{ formatNumber(item.unit_price * item.quantity) }}</span>
                            </div>
                            <div class="separator separator-dashed my-2"></div>
                            <div class="d-flex flex-stack mb-4">
                                <span class="text-gray-700 fw-bold">Subtotal Modal:</span>
                                <span class="text-primary fw-bolder fs-5">Rp {{ formatNumber(totalBase) }}</span>
                            </div>
                        </div>
                        <div class="col-md-6 ps-md-10 mt-5 mt-md-0">
                            <div class="fs-8 text-muted fw-bold text-uppercase mb-3">Harga Jual Toko (+Markup):</div>
                            <div v-if="!form.partner_id" class="text-muted fs-7 italic">Pilih partner...</div>
                            <template v-else>
                                <div v-for="item in selectedItems" :key="'sale-' + item.product_id" class="d-flex flex-stack fs-7 mb-1">
                                    <span class="text-gray-700">{{ item.name }} ({{ item.quantity }}x)</span>
                                    <span class="text-gray-900">Rp {{ formatNumber((item.unit_price + currentMarkup) * item.quantity) }}</span>
                                </div>
                                <div class="separator separator-dashed my-2"></div>
                                <div class="d-flex flex-stack mb-4">
                                    <span class="text-gray-700 fw-bold">Total Jual Toko</span>
                                    <span class="text-gray-900 fw-bold">Rp {{ formatNumber(totalOmzetToko) }}</span>
                                </div>
                            </template>
                        </div>
                    </div>
                    <div class="separator border-gray-400 my-4"></div>
                    <div class="d-flex flex-stack">
                      <div class="d-flex flex-column">
                        <span class="text-gray-900 fw-bolder fs-3">Total Pengiriman</span>
                        <span class="text-muted fs-8">Jumlah modal murni yang harus disetor balik</span>
                      </div>
                      <span class="text-primary fw-bolder fs-1">Rp {{ formatNumber(totalBase) }}</span>
                    </div>
                  </div>
                </div>
            </div>
          </div>

          <div class="d-flex justify-content-end gap-3 order-3 pb-10">
            <router-link to="/shipments" class="btn btn-light fw-bold">Batal</router-link>
            <button type="submit" class="btn btn-primary fw-bold" :disabled="submitting || selectedItems.length === 0 || totalBase === 0">
              <span v-if="!submitting">{{ isEditMode ? 'Perbarui Pengiriman' : 'Simpan Pengiriman' }}</span>
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
import { useRouter, useRoute } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { shipmentService } from '@/services/ShipmentService'

const router = useRouter()
const route = useRoute()
const partners = ref<any[]>([])
const products = ref<any[]>([])
const searchQuery = ref('')
const submitting = ref(false)
const loadingData = ref(false)
const currentMarkup = ref(0)

const isEditMode = computed(() => !!route.params.id)

const form = ref({
  partner_id: '',
  shipment_date: new Date().toISOString().split('T')[0],
  expected_payment_date: '',
  notes: ''
})

const selectedItems = ref<any[]>([])

async function loadInitialData() {
  const { data: pData } = await supabase.from('partners').select('*').order('name')
  const { data: prodData } = await supabase.from('products').select('*').order('name')
  partners.value = pData || []
  products.value = prodData || []

  // Jika Mode Edit, tarik data detail nota
  if (isEditMode.value) {
    await fetchShipmentData(route.params.id as string)
  }
}

async function fetchShipmentData(id: string) {
  loadingData.value = true
  try {
    const data = await shipmentService.getById(id)
    if (data) {
      form.value = {
        partner_id: data.partner_id,
        shipment_date: data.shipment_date,
        expected_payment_date: data.expected_payment_date,
        notes: data.notes || ''
      }
      
      // Map detail barang ke selectedItems
      selectedItems.value = data.shipment_details.map((d: any) => ({
        product_id: d.product_id,
        name: d.products.name,
        quantity: d.quantity,
        unit_price: parseFloat(d.unit_price_at_time)
      }))
      
      updateMarkupValue()
    }
  } catch (error: any) {
    // @ts-ignore
    Swal.fire({ text: "Gagal memuat data nota", icon: "error" })
    router.push('/shipments')
  } finally {
    loadingData.value = false
  }
}

function updateMarkupValue() {
  const partner = partners.value.find(p => p.id === form.value.partner_id)
  currentMarkup.value = partner ? parseFloat(partner.markup_fixed) : 0
}

function toggleProduct(prod: any) {
  const index = selectedItems.value.findIndex(i => i.product_id === prod.id)
  if (index > -1) {
    selectedItems.value.splice(index, 1)
  } else {
    selectedItems.value.push({
      product_id: prod.id,
      name: prod.name,
      quantity: 0, 
      unit_price: parseFloat(prod.base_price)
    })
  }
}

const isProductSelected = (id: string) => selectedItems.value.some(i => i.product_id === id)
const removeItem = (index: number) => selectedItems.value.splice(index, 1)

const totalBase = computed(() => selectedItems.value.reduce((acc, curr) => acc + (curr.quantity * curr.unit_price), 0))
const totalMarkup = computed(() => {
  const totalQty = selectedItems.value.reduce((acc, curr) => acc + curr.quantity, 0)
  return totalQty * currentMarkup.value
})
const totalOmzetToko = computed(() => totalBase.value + totalMarkup.value)

const filteredProducts = computed(() => products.value.filter(p => p.name.toLowerCase().includes(searchQuery.value.toLowerCase())))
const formatNumber = (num: any) => new Intl.NumberFormat('id-ID').format(num || 0)

async function handleSubmit() {
  if (!form.value.partner_id || selectedItems.value.some(i => i.quantity <= 0)) {
     // @ts-ignore
     Swal.fire({ text: "Harap pilih partner dan isi jumlah barang!", icon: "warning" })
     return
  }
  submitting.value = true
  try {
    const shipmentData = { 
      ...form.value, 
      total_amount: totalBase.value, 
      status: isEditMode.value ? undefined : 'pending' // Jangan reset status kalau edit
    }
    const itemsData = selectedItems.value.map(item => ({
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price 
    }))

    if (isEditMode.value) {
      // Logika Update (Hapus rincian lama & insert baru via service)
      await shipmentService.update(route.params.id as string, shipmentData, itemsData)
    } else {
      await shipmentService.create(shipmentData, itemsData)
    }
    
    // @ts-ignore
    Swal.fire({ text: "Berhasil disimpan!", icon: "success", timer: 1500, showConfirmButton: false })
    router.push('/shipments')
  } catch (error: any) {
    // @ts-ignore
    Swal.fire({ title: "Gagal!", text: error.message, icon: "error" })
  } finally { submitting.value = false }
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