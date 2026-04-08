<template>
  <div id="kt_app_toolbar" class="app-toolbar py-4">
    <div id="kt_app_toolbar_container" class="app-container container-xxl d-flex flex-stack">
      <div class="d-flex align-items-center">
        <router-link to="/shipments" class="btn btn-sm btn-icon btn-primary me-3 shadow-sm">
          <i class="ki-outline ki-arrow-left fs-2 text-white"></i>
        </router-link>
        <h1 class="text-gray-900 fw-bolder fs-2 mb-0">
          {{ isEditMode ? 'Edit Pengiriman' : 'Buat Pengiriman Baru' }}
        </h1>
      </div>
    </div>
  </div>

  <div id="kt_app_content" class="app-content flex-column-fluid pb-20">
    <div id="kt_app_content_container" class="app-container container-xxl">
      
      <div v-if="loadingData" class="text-center py-20">
        <span class="spinner-border text-primary"></span>
        <div class="text-muted fw-bold mt-3">Menarik data nota...</div>
      </div>

      <form v-else class="form d-flex flex-column flex-lg-row gap-7 gap-lg-10" @submit.prevent="handleSubmit">
        
        <div class="w-100 flex-lg-row-auto w-lg-350px">
          <div class="card card-flush shadow-sm h-100">
            <div class="card-header bg-light-primary border-bottom border-primary border-opacity-25 pt-4 pb-3">
              <div class="card-title"><h2 class="text-primary mb-0">1. Detail Nota</h2></div>
            </div>
            <div class="card-body p-6">
              <div class="d-flex flex-column gap-6">
                
                <div class="fv-row">
                  <label class="required form-label fw-bold text-gray-800">Partner / Toko</label>
                  <div 
                    class="form-control form-control-solid d-flex align-items-center justify-content-between cursor-pointer" 
                    @click="openPartnerModal"
                  >
                    <span :class="selectedPartnerObj ? 'text-gray-900 fw-bolder' : 'text-muted fw-semibold'">
                      {{ selectedPartnerObj ? selectedPartnerObj.name : '-- Pilih Partner --' }}
                    </span>
                    <i class="ki-outline ki-down fs-4 text-gray-600"></i>
                  </div>
                  
                  <div v-if="!form.partner_id" class="alert alert-light-warning border-dashed p-3 mt-3 mb-0 d-flex align-items-center">
                    <i class="ki-outline ki-information-5 fs-4 text-warning me-2"></i>
                    <span class="fs-8 fw-semibold text-warning">Pilih partner untuk kalkulasi harga jual.</span>
                  </div>
                  <div v-if="false" class="bg-light-success rounded p-3 mt-3 border border-success border-dashed d-flex align-items-center justify-content-between">
                    <span class="fs-8 fw-bold text-success text-uppercase">Markup Toko:</span>
                    <span class="fw-bolder text-success fs-7">+ Rp {{ formatNumber(currentMarkup) }}</span>
                  </div>
                </div>

                <div class="fv-row">
                  <label class="required form-label fw-bold text-gray-800">Tanggal Kirim</label>
                  <div class="position-relative">
                    <input type="date" v-model="form.shipment_date" class="form-control form-control-solid ps-12" required />
                    <i class="ki-outline ki-calendar-8 fs-3 text-gray-500 position-absolute top-50 translate-middle-y ms-4"></i>
                  </div>
                </div>

                <div class="fv-row">
                  <label class="required form-label fw-bold text-gray-800">Perkiraan Masuk (Tempo)</label>
                  <div class="position-relative">
                    <input type="date" v-model="form.expected_payment_date" class="form-control form-control-solid ps-12" required />
                    <i class="ki-outline ki-wallet fs-3 text-gray-500 position-absolute top-50 translate-middle-y ms-4"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="d-flex flex-column flex-lg-row-fluid gap-7 gap-lg-10">
          
          <div class="card card-flush shadow-sm">
            <div class="card-header bg-light-primary border-bottom border-primary border-opacity-25 pt-4 pb-3">
              <div class="card-title"><h2 class="text-primary mb-0">2. Katalog Produk</h2></div>
            </div>
            <div class="card-body pt-0 p-6 mt-4">
              <div class="position-relative mb-4">
                <i class="ki-outline ki-magnifier fs-2 position-absolute top-50 translate-middle-y ms-4 text-gray-500"></i>
                <input type="text" v-model="searchProductQuery" class="form-control form-control-solid ps-12 bg-gray-100" placeholder="Cari nama produk..." />
              </div>
              
              <div class="product-list-container pe-2">
                <div v-if="filteredProducts.length === 0" class="text-center text-muted py-5 fs-7">Produk tidak ditemukan.</div>
                
                <div v-for="prod in filteredProducts" :key="prod.id" 
                  @click="toggleProduct(prod)"
                  class="d-flex flex-stack p-4 rounded-3 border mb-3 cursor-pointer transition-all"
                  :class="isProductSelected(prod.id) ? 'bg-light-primary border-primary border-2 shadow-sm' : 'bg-body border-gray-300 card-hover'">
                  
                  <div class="d-flex flex-column">
                    <span class="fw-bolder fs-6 mb-1" :class="isProductSelected(prod.id) ? 'text-primary' : 'text-gray-800'">{{ prod.name }}</span>
                    <span class="text-muted fs-8 fw-semibold">Harga Modal: Rp {{ formatNumber(prod.base_price) }}</span>
                  </div>
                  
                  <div>
                    <i v-if="isProductSelected(prod.id)" class="ki-solid ki-check-circle fs-2x text-primary"></i>
                    <i v-else class="ki-outline ki-plus-circle fs-2x text-gray-400"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="card card-flush shadow-sm">
            <div class="card-header bg-light-primary border-bottom border-primary border-opacity-25 pt-4 pb-3">
              <div class="card-title"><h2 class="text-primary mb-0">3. Rincian Nota</h2></div>
            </div>
            <div class="card-body p-6">
              
              <div v-if="selectedItems.length === 0" class="text-center py-10 bg-light rounded-3 border border-dashed border-gray-400 mb-6">
                <i class="ki-outline ki-basket fs-3x text-gray-400 mb-3"></i>
                <div class="text-gray-600 fw-bold fs-5">Nota masih kosong</div>
                <div class="text-muted fs-8">Pilih produk dari katalog di atas.</div>
              </div>
              
              <div v-else class="mb-8">
                <div v-for="(item, index) in selectedItems" :key="item.product_id" class="d-flex flex-stack p-4 rounded-3 border border-dashed border-gray-400 mb-3 bg-white position-relative">
                  
                  <div class="d-flex flex-column me-2">
                    <span class="fw-bolder text-gray-900 fs-5 mb-1">{{ item.name }}</span>
                    <span class="text-primary fs-8 fw-bolder">Rp {{ formatNumber(item.unit_price) }} / pcs</span>
                  </div>
                  
                  <div class="d-flex align-items-center gap-2">
                    <button type="button" class="btn btn-icon btn-sm btn-light-danger" @click="item.quantity > 1 ? item.quantity-- : removeItem(index)">
                      <i class="ki-outline" :class="item.quantity > 1 ? 'ki-minus' : 'ki-trash text-danger'"></i>
                    </button>
                    
                    <input type="number" v-model.number="item.quantity" class="form-control form-control-sm w-50px text-center fw-bolder fs-5 border-0 bg-light-dark no-spinner" min="1" />
                    
                    <button type="button" class="btn btn-icon btn-sm btn-light-success" @click="item.quantity++">
                      <i class="ki-outline ki-plus fs-4"></i>
                    </button>
                  </div>
                </div>
              </div>

              <div class="row g-5">
                <div class="col-12 col-md-6">
                  <div class="bg-light-primary rounded-3 p-5 border border-primary border-dashed h-100">
                    <h3 class="text-primary fs-6 fw-bolder text-uppercase mb-4 border-bottom border-primary pb-2">Setoran Modal (Murni)</h3>
                    <div v-for="item in selectedItems" :key="'base-' + item.product_id" class="d-flex justify-content-between fs-8 mb-2">
                      <span class="text-gray-700">{{ item.name }} <span class="text-muted fw-bold">x{{ item.quantity }}</span></span>
                      <span class="text-gray-900 fw-bold">Rp {{ formatNumber(item.unit_price * item.quantity) }}</span>
                    </div>
                    <div class="mt-auto pt-4 d-flex justify-content-between align-items-center">
                      <span class="text-gray-800 fw-bolder fs-6">Subtotal Modal:</span>
                      <span class="text-primary fw-bolder fs-3">Rp {{ formatNumber(totalBase) }}</span>
                    </div>
                  </div>
                </div>

                <div v-if="false" class="col-12 col-md-6">
                  <div class="bg-light-success rounded-3 p-5 border border-success border-dashed h-100">
                    <h3 class="text-success fs-6 fw-bolder text-uppercase mb-4 border-bottom border-success pb-2">Tagihan Toko (+Markup)</h3>
                    <div v-if="!form.partner_id" class="text-muted fs-8 fst-italic">Pilih partner terlebih dahulu...</div>
                    <template v-else>
                      <div v-for="item in selectedItems" :key="'sale-' + item.product_id" class="d-flex justify-content-between fs-8 mb-2">
                        <span class="text-gray-700">{{ item.name }} <span class="text-muted fw-bold">x{{ item.quantity }}</span></span>
                        <span class="text-gray-900 fw-bold">Rp {{ formatNumber((item.unit_price + currentMarkup) * item.quantity) }}</span>
                      </div>
                      <div class="mt-auto pt-4 d-flex justify-content-between align-items-center">
                        <span class="text-gray-800 fw-bolder fs-6">Total Tagihan:</span>
                        <span class="text-success fw-bolder fs-3">Rp {{ formatNumber(totalOmzetToko) }}</span>
                      </div>
                    </template>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div class="d-flex flex-column flex-md-row justify-content-end gap-3 mt-4 mb-10">
            <router-link to="/shipments" class="btn btn-lg btn-light fw-bold w-100 w-md-auto">Batal</router-link>
            <button type="submit" class="btn btn-lg btn-primary fw-bold shadow-sm w-100 w-md-auto" :disabled="submitting || selectedItems.length === 0 || totalBase === 0">
              <span v-if="!submitting">
                <i class="ki-outline ki-check-circle fs-3 me-2"></i> {{ isEditMode ? 'Perbarui Data' : 'Simpan Pengiriman' }}
              </span>
              <span v-else><span class="spinner-border spinner-border-sm align-middle me-2"></span> Menyimpan...</span>
            </button>
          </div>

        </div>
      </form>
    </div>
  </div>

  <div class="modal fade" id="modal_select_partner" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered mw-400px">
      <div class="modal-content rounded-4 border-0 shadow-lg">
        <div class="modal-header border-0 pb-0 justify-content-end">
          <div class="btn btn-icon btn-sm btn-active-light-primary ms-2" data-bs-dismiss="modal">
            <i class="ki-outline ki-cross fs-1"></i>
          </div>
        </div>
        <div class="modal-body px-8 pt-0 pb-10">
          <div class="text-center mb-6">
            <h2 class="fw-bolder text-gray-900 fs-3">Pilih Partner / Toko</h2>
          </div>

          <div class="position-relative mb-5">
            <i class="ki-outline ki-magnifier fs-2 position-absolute top-50 translate-middle-y ms-4 text-gray-500"></i>
            <input type="text" v-model="searchPartnerQuery" class="form-control form-control-solid ps-12 bg-light" placeholder="Cari nama toko..." />
          </div>

          <div class="partner-list-container pe-2">
            <div v-if="filteredPartners.length === 0" class="text-center text-muted py-5 fs-7">Partner tidak ditemukan.</div>
            
            <div v-for="p in filteredPartners" :key="p.id" 
              @click="selectPartner(p)"
              class="d-flex align-items-center p-4 rounded-3 border mb-3 cursor-pointer transition-all card-hover"
              :class="form.partner_id === p.id ? 'bg-light-primary border-primary' : 'bg-body border-gray-300'">
              
              <div class="symbol symbol-40px symbol-circle me-4">
                <div class="symbol-label fs-4 fw-bolder" :class="form.partner_id === p.id ? 'bg-primary text-white' : 'bg-light-primary text-primary'">
                  {{ p.name.charAt(0) }}
                </div>
              </div>
              <div class="d-flex flex-column">
                <span class="fw-bolder fs-6" :class="form.partner_id === p.id ? 'text-primary' : 'text-gray-900'">{{ p.name }}</span>
                <span class="text-muted fs-8 text-truncate w-200px">{{ p.address || 'Tanpa alamat' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
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

// Data Master
const partners = ref<any[]>([])
const products = ref<any[]>([])

// Query Search
const searchProductQuery = ref('')
const searchPartnerQuery = ref('')

const submitting = ref(false)
const loadingData = ref(false)
const currentMarkup = ref(0)
let partnerModal: any = null

const isEditMode = computed(() => !!route.params.id)

const form = ref({
  partner_id: '',
  shipment_date: new Date().toISOString().split('T')[0],
  expected_payment_date: '',
  notes: ''
})

const selectedItems = ref<any[]>([])

// Computed Helpers
const selectedPartnerObj = computed(() => partners.value.find(p => p.id === form.value.partner_id))
const filteredProducts = computed(() => products.value.filter(p => p.name.toLowerCase().includes(searchProductQuery.value.toLowerCase())))
const filteredPartners = computed(() => partners.value.filter(p => p.name.toLowerCase().includes(searchPartnerQuery.value.toLowerCase())))

const totalBase = computed(() => selectedItems.value.reduce((acc, curr) => acc + (curr.quantity * curr.unit_price), 0))
const totalMarkup = computed(() => {
  const totalQty = selectedItems.value.reduce((acc, curr) => acc + curr.quantity, 0)
  return totalQty * currentMarkup.value
})
const totalOmzetToko = computed(() => totalBase.value + totalMarkup.value)

const formatNumber = (num: any) => new Intl.NumberFormat('id-ID').format(num || 0)

// Functions
async function loadInitialData() {
  const { data: pData } = await supabase.from('partners').select('*').order('name')
  const { data: prodData } = await supabase.from('products').select('*').order('name')
  partners.value = pData || []
  products.value = prodData || []

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

function openPartnerModal() {
  searchPartnerQuery.value = ''
  partnerModal.show()
}

function selectPartner(p: any) {
  form.value.partner_id = p.id
  updateMarkupValue()
  partnerModal.hide()
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
      quantity: 1, 
      unit_price: parseFloat(prod.base_price)
    })
  }
}

const isProductSelected = (id: string) => selectedItems.value.some(i => i.product_id === id)
const removeItem = (index: number) => selectedItems.value.splice(index, 1)

async function handleSubmit() {
  if (!form.value.partner_id || selectedItems.value.some(i => i.quantity <= 0)) {
     // @ts-ignore
     Swal.fire({ text: "Harap pilih partner dan pastikan jumlah barang valid!", icon: "warning" })
     return
  }
  submitting.value = true
  try {
    const shipmentData = { 
      ...form.value, 
      total_amount: totalBase.value, 
      status: isEditMode.value ? undefined : 'pending' 
    }
    const itemsData = selectedItems.value.map(item => ({
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price 
    }))

    if (isEditMode.value) {
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

onMounted(() => {
  loadInitialData()
  // @ts-ignore
  partnerModal = new bootstrap.Modal(document.getElementById('modal_select_partner'))
})
</script>

<style scoped>
.no-spinner::-webkit-inner-spin-button, .no-spinner::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
.no-spinner { -moz-appearance: textfield; }

/* Custom scroll buat katalog & partner list */
.product-list-container, .partner-list-container {
    max-height: 400px;
    overflow-y: auto;
    scrollbar-width: thin;
}
.product-list-container::-webkit-scrollbar, .partner-list-container::-webkit-scrollbar {
    width: 6px;
}
.product-list-container::-webkit-scrollbar-thumb, .partner-list-container::-webkit-scrollbar-thumb {
    background-color: #dbdfe9;
    border-radius: 4px;
}

.card-hover { transition: all 0.2s ease; }
.card-hover:active { transform: scale(0.98); background-color: var(--bs-light) !important; }
.transition-all { transition: all 0.2s ease-in-out; }
</style>