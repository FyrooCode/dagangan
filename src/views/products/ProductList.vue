<template>
  <div id="kt_app_toolbar" class="app-toolbar py-3 py-lg-0">
    <div id="kt_app_toolbar_container" class="app-container container-xxl d-flex flex-stack flex-wrap gap-2">
      <div class="page-title d-flex flex-column justify-content-center me-3">
        <h1 class="page-heading d-flex text-gray-900 fw-bold fs-3 flex-column justify-content-center my-0">Master Produk</h1>
        <ul class="breadcrumb breadcrumb-separatorless fw-semibold fs-7 my-0 pt-1">
          <li class="breadcrumb-item text-muted">
            <router-link to="/" class="text-muted text-hover-primary">Home</router-link>
          </li>
          <li class="breadcrumb-item"><span class="bullet bg-gray-500 w-5px h-2px"></span></li>
          <li class="breadcrumb-item text-muted">Master Data</li>
        </ul>
      </div>
      <div class="d-flex align-items-center gap-2 gap-lg-3">
        <button class="btn btn-sm fw-bold btn-primary" @click="openAddModal">
          <i class="ki-outline ki-plus fs-4 me-1"></i> Tambah Produk
        </button>
      </div>
    </div>
  </div>

  <div id="kt_app_content" class="app-content flex-column-fluid">
    <div id="kt_app_content_container" class="app-container container-xxl">
      <div class="card card-flush">
        <div class="card-header align-items-center py-5 gap-2 gap-md-5">
          <div class="card-title w-100 w-md-auto">
            <div class="d-flex align-items-center position-relative my-1 w-100">
              <i class="ki-outline ki-magnifier fs-3 position-absolute ms-4"></i>
              <input type="text" v-model="searchQuery" class="form-control form-control-solid w-100 w-md-250px ps-12" placeholder="Cari Produk..." />
            </div>
          </div>
        </div>

        <div class="card-body pt-0">
          <div class="table-responsive">
            <table class="table align-middle table-row-dashed fs-6 gy-5" id="kt_ecommerce_products_table">
              <thead>
                <tr class="text-start text-gray-500 fw-bold fs-7 text-uppercase gs-0">
                  <th class="min-w-200px">Produk</th>
                  <th class="text-end min-w-150px">Harga Dasar</th>
                  <th class="text-end min-w-80px">Satuan</th>
                  <th class="text-end min-w-150px">Dibuat Pada</th>
                  <th class="text-end min-w-100px">Aksi</th>
                </tr>
              </thead>
              <tbody class="fw-semibold text-gray-600">
                <tr v-if="loading">
                  <td colspan="5" class="text-center py-10">
                    <span class="spinner-border spinner-border-sm align-middle ms-2"></span> Memuat data...
                  </td>
                </tr>
                <tr v-else v-for="product in filteredProducts" :key="product.id">
                  <td>
                    <div class="d-flex align-items-center">
                      <div class="symbol symbol-40px symbol-md-50px me-3 me-md-5">
                        <span class="symbol-label bg-light-primary text-primary fw-bold">{{ product.name.charAt(0) }}</span>
                      </div>
                      <span class="text-gray-800 fs-6 fs-md-5 fw-bold">{{ product.name }}</span>
                    </div>
                  </td>
                  <td class="text-end pe-0">Rp {{ formatNumber(product.base_price) }}</td>
                  <td class="text-end pe-0"><span class="badge badge-light-info">{{ product.unit }}</span></td>
                  <td class="text-end pe-0">{{ formatDate(product.created_at) }}</td>
                  <td class="text-end">
                    <div class="d-flex justify-content-end gap-2">
                      <button class="btn btn-sm btn-icon btn-light-primary" @click="openEditModal(product)">
                        <i class="ki-outline ki-pencil fs-5"></i>
                      </button>
                      <button class="btn btn-sm btn-icon btn-light-danger" @click="handleDelete(product.id)">
                        <i class="ki-outline ki-trash fs-5"></i>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="!loading && filteredProducts.length === 0">
                  <td colspan="5" class="text-center text-muted py-10">Data produk kosong.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="modal fade" tabindex="-1" id="modal_product">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">{{ isEdit ? 'Edit Produk' : 'Tambah Produk Baru' }}</h3>
          <div class="btn btn-icon btn-sm btn-active-light-primary ms-2" data-bs-dismiss="modal" aria-label="Close">
            <i class="ki-outline ki-cross fs-1"></i>
          </div>
        </div>

        <form @submit.prevent="saveProduct">
          <div class="modal-body">
            <div class="mb-5">
              <label class="form-label required">Nama Produk</label>
              <div class="input-group input-group-solid mb-5">
                <span class="input-group-text"><i class="ki-outline ki-basket fs-2"></i></span>
                <input type="text" v-model="formData.name" class="form-control" placeholder="Contoh: Lumpia" required />
              </div>
            </div>

            <div class="mb-5">
              <label class="form-label required">Harga Dasar</label>
              <div class="input-group input-group-solid mb-5">
                <span class="input-group-text">Rp</span>
                <input type="number" v-model="formData.base_price" class="form-control" placeholder="0" required />
              </div>
            </div>

            <div class="mb-5">
              <label class="form-label">Satuan</label>
              <div class="input-group input-group-solid mb-5">
                <input type="text" v-model="formData.unit" class="form-control" placeholder="pcs, box, renteng..." />
                <span class="input-group-text"><i class="ki-outline ki-tag fs-2"></i></span>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-light" data-bs-dismiss="modal">Batal</button>
            <button type="submit" class="btn btn-primary" :disabled="submitting">
              <span v-if="!submitting">Simpan</span>
              <span v-else><span class="spinner-border spinner-border-sm align-middle ms-2"></span></span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'

// State
const products = ref<any[]>([])
const loading = ref(true)
const submitting = ref(false)
const searchQuery = ref('')
const isEdit = ref(false)
const currentId = ref('')

const formData = ref({
  name: '',
  base_price: 0,
  unit: 'pcs'
})

// Modal Instance (Bootstrap)
let productModal: any = null

async function fetchProducts() {
  loading.value = true
  const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false })
  if (error) console.error(error)
  else products.value = data || []
  loading.value = false
}

// Open Modal logic
const openAddModal = () => {
  isEdit.value = false
  formData.value = { name: '', base_price: 0, unit: 'pcs' }
  productModal.show()
}

const openEditModal = (product: any) => {
  isEdit.value = true
  currentId.value = product.id
  formData.value = { 
    name: product.name, 
    base_price: product.base_price, 
    unit: product.unit 
  }
  productModal.show()
}

// Save logic (Insert or Update)
async function saveProduct() {
  submitting.value = true
  try {
    if (isEdit.value) {
      const { error } = await supabase.from('products').update(formData.value).eq('id', currentId.value)
      if (error) throw error
    } else {
      const { error } = await supabase.from('products').insert([formData.value])
      if (error) throw error
    }
    
    productModal.hide()
    // @ts-ignore
    Swal.fire({ text: "Berhasil menyimpan produk!", icon: "success", timer: 1500, showConfirmButton: false })
    fetchProducts()
  } catch (err: any) {
    // @ts-ignore
    Swal.fire({ text: err.message, icon: "error", buttonsStyling: false, confirmButtonText: "Ok", customClass: { confirmButton: "btn btn-primary" }})
  } finally {
    submitting.value = false
  }
}

// Delete logic
async function handleDelete(id: string) {
  // @ts-ignore
  const res = await Swal.fire({
    title: 'Hapus Produk?',
    text: "Data tidak bisa dikembalikan!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ya, Hapus',
    customClass: { confirmButton: "btn btn-danger", cancelButton: "btn btn-light" }
  })

  if (res.isConfirmed) {
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) alert(error.message)
    else fetchProducts()
  }
}

// Helpers
const filteredProducts = computed(() => products.value.filter(p => p.name.toLowerCase().includes(searchQuery.value.toLowerCase())))
const formatNumber = (num: any) => new Intl.NumberFormat('id-ID').format(num || 0)
const formatDate = (date: string) => new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })

onMounted(() => {
  fetchProducts()
  // @ts-ignore
  productModal = new bootstrap.Modal(document.getElementById('modal_product'))
})
</script>

<style scoped>
th { white-space: nowrap; }
</style>