<template>
  <div id="kt_app_toolbar" class="app-toolbar py-4">
    <div id="kt_app_toolbar_container" class="app-container container-xxl d-flex flex-stack">
      <div class="d-flex align-items-center">
        <router-link to="/lainnya" class="btn btn-sm btn-icon btn-primary me-3 shadow-sm">
          <i class="ki-outline ki-arrow-left fs-2 text-white"></i>
        </router-link>
        <h1 class="text-gray-900 fw-bolder fs-2 mb-0">Pengadaan</h1>
      </div>
      <button class="btn btn-primary fw-bold shadow-sm px-5" @click="openAddModal">
        <i class="ki-outline ki-plus fs-2"></i> Tambah
      </button>
    </div>
  </div>

  <div id="kt_app_content" class="app-content flex-column-fluid pt-0">
    <div id="kt_app_content_container" class="app-container container-xxl">
      
      <div v-if="loading" class="text-center py-20">
        <span class="spinner-border text-primary"></span>
        <div class="text-gray-500 mt-3 fw-bold">Memuat data pengadaan...</div>
      </div>

      <div v-else class="row g-5">
        <div v-for="p in purchases" :key="p.id" class="col-12 col-md-6 col-xl-4">
          <div class="card card-flush h-100 border border-gray-200 shadow-sm cursor-pointer card-hover" @click="viewDetails(p)">
            <div class="card-body p-5">
              <div class="d-flex justify-content-between align-items-start mb-4">
                <span class="badge badge-light-dark fw-bold">#{{ p.id.substring(0, 5).toUpperCase() }}</span>
                <span class="badge badge-primary fw-bolder px-3 py-1">{{ formatDate(p.purchase_date) }}</span>
              </div>

              <div class="d-flex flex-column mb-5">
                <span class="fs-4 fw-bolder text-gray-900">Rp {{ formatNumber(p.total_cost) }}</span>
                <span class="text-muted fs-7">{{ p.purchase_details?.length || 0 }} Item Bahan Baku</span>
              </div>

              <div class="separator separator-dashed my-4"></div>
              
              <div class="text-gray-600 fs-7 text-truncate">
                {{ p.notes || 'Tidak ada catatan' }}
              </div>

              <div class="bg-light-primary rounded-2 p-3 mt-4 text-center border border-dashed border-primary">
                <span class="text-primary fs-8 fw-bolder">Klik untuk lihat detail</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="purchases.length === 0" class="col-12 text-center py-20 bg-light rounded border border-dashed border-gray-400">
           <div class="text-gray-600 fw-bold fs-6">Belum ada riwayat pengadaan.</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal Add/Edit Purchasing -->
  <div class="modal fade" id="modal_purchasing" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered mw-500px">
      <div class="modal-content rounded-4 border-0 shadow-lg">
        <div class="modal-header border-0 justify-content-end pb-0">
          <div class="btn btn-icon btn-sm btn-active-light-primary" data-bs-dismiss="modal">
            <i class="ki-outline ki-cross fs-1"></i>
          </div>
        </div>

        <div class="modal-body p-10 pt-0">
          <div class="text-center mb-8">
            <h1 class="mb-3 text-gray-900 fs-2 fw-bolder">Input Pengadaan</h1>
            <div class="text-muted fw-bold fs-7">Catat pembelian bahan baku baru</div>
          </div>

          <form @submit.prevent="savePurchase">
            <div class="row g-5 mb-6">
              <div class="col-6">
                <label class="form-label required fw-bold">Tanggal</label>
                <input type="date" v-model="formData.purchase_date" class="form-control" required />
              </div>
              <div class="col-6">
                <label class="form-label fw-bold">Total Biaya</label>
                <div class="form-control bg-light fw-bolder text-primary">
                  Rp {{ formatNumber(computedTotal) }}
                </div>
              </div>
            </div>

            <div class="mb-6">
              <label class="form-label fw-bold">Catatan</label>
              <textarea v-model="formData.notes" class="form-control" rows="2" placeholder="Contoh: Beli di pasar pagi..."></textarea>
            </div>

            <div class="separator separator-dashed my-6"></div>

            <div class="d-flex flex-stack mb-4">
              <h4 class="fs-6 fw-bolder mb-0">Item Bahan Baku</h4>
              <button type="button" class="btn btn-sm btn-primary fw-bold" @click="addItem">
                <i class="ki-outline ki-plus fs-5"></i> Tambah
              </button>
            </div>
            
            <div class="mh-350px scroll-y px-2 mb-6">
              <div v-for="(item, index) in formData.details" :key="index" class="card border border-dashed border-gray-300 rounded p-4 mb-4 bg-body text-gray-800">
                <div class="d-flex flex-stack mb-4">
                  <div class="form-select form-select-sm cursor-pointer w-175px text-gray-800 fw-bold" @click="openSelectIngredient(index)">
                    {{ item.ingredient_id ? getIngredientName(item.ingredient_id) + ' (' + getIngredientUnit(item.ingredient_id) + ')' : 'Pilih Bahan Baku...' }}
                  </div>
                  <button type="button" class="btn btn-sm btn-icon btn-light-danger" @click="removeItem(index)">
                    <i class="ki-outline ki-trash fs-4"></i>
                  </button>
                </div>

                <div class="row g-2 align-items-center">
                  <div class="col">
                    <label class="fs-9 fw-bold text-muted text-uppercase d-block mb-1">Jumlah</label>
                    <input type="text" inputmode="decimal" 
                      :value="formatNumber(item.quantity)" 
                      @input="e => item.quantity = parseNumber(e.target.value)"
                      class="form-control form-control-sm fw-bolder fs-6 w-100" placeholder="0" required />
                  </div>
                  <div class="col-auto pt-6">
                    <span class="fw-bold text-gray-400">x</span>
                  </div>
                  <div class="col">
                    <label class="fs-9 fw-bold text-muted text-uppercase d-block mb-1">Harga Satuan</label>
                    <input type="text" inputmode="numeric" 
                      :value="formatNumber(item.cost_per_unit)" 
                      @input="e => item.cost_per_unit = parseNumber(e.target.value)"
                      class="form-control form-control-sm fw-bolder fs-6 w-100" placeholder="0" required />
                  </div>
                </div>
              </div>
              
              <div v-if="formData.details.length === 0" class="text-center py-10 bg-light rounded border border-dashed">
                <span class="text-muted fs-7">Belum ada item. Klik Tambah.</span>
              </div>
            </div>

            <div class="d-flex flex-column gap-3">
              <button type="submit" class="btn btn-lg btn-primary fw-bold w-100 py-4 shadow-sm" :disabled="submitting || formData.details.length === 0">
                <span v-if="!submitting">Simpan Pengadaan</span>
                <span v-else class="spinner-border spinner-border-sm"></span>
              </button>
              <button type="button" class="btn btn-lg btn-secondary fw-bold w-100 py-4" data-bs-dismiss="modal" style="background-color: #e4e6ef; color: #3f4254; border: none;">
                Batal
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal Select Ingredient -->
  <div class="modal fade" id="modal_select_ingredient" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered mw-400px">
      <div class="modal-content rounded-4 border-0 shadow-lg">
        <div class="modal-body p-8">
          <div class="text-center mb-6">
            <h1 class="mb-1 text-gray-900 fs-4 fw-bolder">Pilih Bahan Baku</h1>
          </div>

          <div class="position-relative mb-6">
            <i class="ki-outline ki-magnifier fs-3 position-absolute ms-4 mt-4"></i>
            <input type="text" v-model="ingredientSearch" class="form-control ps-12" placeholder="Cari Bahan..." />
          </div>

          <div class="mh-300px scroll-y px-2">
            <div v-for="ing in filteredIngredients" :key="ing.id" 
              class="d-flex align-items-center p-3 mb-2 rounded-3 cursor-pointer bg-hover-light border border-transparent border-hover-gray-300"
              @click="selectIngredient(ing)"
            >
              <div class="symbol symbol-35px me-3">
                <div class="symbol-label bg-light-primary text-primary fw-bold fs-7">{{ ing.name.charAt(0) }}</div>
              </div>
              <div class="d-flex flex-column">
                <span class="text-gray-800 fw-bold fs-6">{{ ing.name }}</span>
                <span class="text-muted fs-8">{{ ing.unit }}</span>
              </div>
            </div>
            <div v-if="filteredIngredients.length === 0" class="text-center py-5 text-muted fs-7">
              Bahan tidak ditemukan.
            </div>
          </div>

          <button type="button" class="btn btn-light-danger fw-bold w-100 mt-4" @click="cancelSelectIngredient">
            Batal
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal View Details -->
  <div class="modal fade" id="modal_purchase_view" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered mw-450px">
      <div class="modal-content rounded-4 border-0 shadow-lg">
        <div class="modal-body p-10">
          <div class="text-center mb-6">
            <h1 class="mb-1 text-gray-900 fs-3 fw-bolder">Detail Pengadaan</h1>
            <div class="badge badge-light-dark">Nota #{{ selectedPurchase?.id.substring(0, 5).toUpperCase() }}</div>
          </div>

          <div class="bg-light rounded-3 p-5 mb-6 border border-dashed border-gray-300">
            <div class="d-flex justify-content-between mb-2">
              <span class="text-muted fs-8 fw-bold text-uppercase">Tanggal:</span>
              <span class="text-gray-800 fs-7 fw-bolder">{{ formatDate(selectedPurchase?.purchase_date) }}</span>
            </div>
            <div class="d-flex justify-content-between mb-4">
              <span class="text-muted fs-8 fw-bold text-uppercase">Total Biaya:</span>
              <span class="text-primary fs-6 fw-bolder">Rp {{ formatNumber(selectedPurchase?.total_cost) }}</span>
            </div>
            <div class="separator separator-dashed my-3"></div>
            <div class="text-gray-700 fs-7">
              <span class="fw-bold d-block mb-1 text-uppercase fs-9 text-muted">Catatan:</span>
              {{ selectedPurchase?.notes || '-' }}
            </div>
          </div>

          <h4 class="fs-7 fw-bolder mb-3 text-uppercase text-gray-600">Daftar Bahan</h4>
          <div class="mh-200px scroll-y mb-8 px-2">
            <div v-for="item in selectedPurchase?.purchase_details" :key="item.id" class="d-flex align-items-center mb-3">
              <div class="symbol symbol-30px me-3">
                <div class="symbol-label bg-light-primary text-primary fw-bold fs-8">{{ item.ingredients?.name.charAt(0) }}</div>
              </div>
              <div class="d-flex flex-column flex-grow-1 me-2">
                <span class="text-gray-800 fw-bold fs-7">{{ item.ingredients?.name }}</span>
                <span class="text-muted fs-8">{{ item.quantity }} {{ item.ingredients?.unit }} x Rp {{ formatNumber(item.cost_per_unit) }}</span>
              </div>
              <span class="text-gray-800 fw-bolder fs-7">Rp {{ formatNumber(item.quantity * item.cost_per_unit) }}</span>
            </div>
          </div>

          <div class="d-flex flex-column gap-3">
            <button @click="handleDelete(selectedPurchase.id)" class="btn btn-lg btn-danger fw-bold w-100 py-4 shadow-sm">
              <i class="ki-outline ki-trash fs-3 me-2"></i> Hapus Riwayat
            </button>
            <button class="btn btn-lg btn-secondary fw-bold w-100 py-4" data-bs-dismiss="modal" style="background-color: #e4e6ef; color: #3f4254; border: none;">
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
import { purchasingService } from '@/services/PurchasingService'
import { ingredientService } from '@/services/IngredientService'

const purchases = ref<any[]>([])
const availableIngredients = ref<any[]>([])
const loading = ref(true)
const submitting = ref(false)
const selectedPurchase = ref<any>(null)
const ingredientSearch = ref('')
const currentDetailIndex = ref<number | null>(null)

const formData = ref({
  purchase_date: new Date().toISOString().split('T')[0],
  notes: '',
  details: [] as any[]
})

let purchasingModal: any = null
let viewModal: any = null
let ingredientModal: any = null

async function loadData() {
  loading.value = true
  try {
    purchases.value = await purchasingService.getAll()
    availableIngredients.value = await ingredientService.getAll()
  } catch (err: any) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

const computedTotal = computed(() => {
  return formData.value.details.reduce((sum, item) => sum + (item.quantity * item.cost_per_unit || 0), 0)
})

const filteredIngredients = computed(() => {
  return availableIngredients.value.filter(ing => 
    ing.name.toLowerCase().includes(ingredientSearch.value.toLowerCase())
  )
})

function getIngredientName(id: string) {
  return availableIngredients.value.find(ing => ing.id === id)?.name
}

function getIngredientUnit(id: string) {
  return availableIngredients.value.find(ing => ing.id === id)?.unit
}

function openAddModal() {
  formData.value = {
    purchase_date: new Date().toISOString().split('T')[0],
    notes: '',
    details: [{ ingredient_id: '', quantity: 1, cost_per_unit: 0 }]
  }
  purchasingModal.show()
}

function openSelectIngredient(index: number) {
  currentDetailIndex.value = index
  ingredientSearch.value = ''
  purchasingModal.hide() // Hide first modal
  ingredientModal.show() // Show second modal
}

function selectIngredient(ing: any) {
  if (currentDetailIndex.value !== null) {
    formData.value.details[currentDetailIndex.value].ingredient_id = ing.id
  }
  ingredientModal.hide() // Hide second modal
  purchasingModal.show() // Back to first modal
}

function cancelSelectIngredient() {
  ingredientModal.hide()
  purchasingModal.show() // Return to first modal even if cancelled
}

function addItem() {
  formData.value.details.push({ ingredient_id: '', quantity: 1, cost_per_unit: 0 })
}

function removeItem(index: number) {
  formData.value.details.splice(index, 1)
}

function viewDetails(p: any) {
  selectedPurchase.value = p
  viewModal.show()
}

async function savePurchase() {
  if (formData.value.details.some(d => !d.ingredient_id)) {
     // @ts-ignore
     Swal.fire({ text: "Harap pilih bahan baku untuk semua baris!", icon: "warning" })
     return
  }

  submitting.value = true
  try {
    const header = {
      purchase_date: formData.value.purchase_date,
      notes: formData.value.notes,
      total_cost: computedTotal.value
    }
    
    await purchasingService.create(header, formData.value.details)

    purchasingModal.hide()
    // @ts-ignore
    Swal.fire({ text: "Berhasil menyimpan!", icon: "success", timer: 1500, showConfirmButton: false })
    loadData()
  } catch (err: any) {
    // @ts-ignore
    Swal.fire({ text: err.message, icon: "error", buttonsStyling: false, confirmButtonText: "Ok", customClass: { confirmButton: "btn btn-primary" }})
  } finally {
    submitting.value = false
  }
}

async function handleDelete(id: string) {
  // @ts-ignore
  const res = await Swal.fire({
    title: 'Hapus Riwayat?',
    text: "Data akan dihapus permanen!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ya, Hapus',
    customClass: { confirmButton: "btn btn-danger", cancelButton: "btn btn-light" }
  })

  if (res.isConfirmed) {
    try {
      await purchasingService.delete(id)
      viewModal.hide()
      loadData()
    } catch (error: any) {
      alert(error.message)
    }
  }
}

const formatDate = (d: any) => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'
const formatNumber = (num: any) => new Intl.NumberFormat('id-ID').format(num || 0)
const parseNumber = (str: string) => {
  const clean = str.replace(/\./g, '').replace(',', '.')
  return parseFloat(clean) || 0
}

onMounted(() => {
  // @ts-ignore
  purchasingModal = new bootstrap.Modal(document.getElementById('modal_purchasing'))
  // @ts-ignore
  viewModal = new bootstrap.Modal(document.getElementById('modal_purchase_view'))
  // @ts-ignore
  ingredientModal = new bootstrap.Modal(document.getElementById('modal_select_ingredient'))
  loadData()
})
</script>

<style scoped>
.card-hover { transition: transform 0.15s ease-in-out; }
.card-hover:active { transform: scale(0.97); background-color: #f9f9f9; }
#kt_app_content {
  padding-bottom: 7rem;
}
.scroll-y { max-height: 350px; overflow-y: auto; }
.bg-hover-light:hover { background-color: #f1f1f1 !important; }
</style>
