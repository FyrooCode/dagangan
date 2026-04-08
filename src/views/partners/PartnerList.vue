<template>
  <div id="kt_app_toolbar" class="app-toolbar py-4">
    <div id="kt_app_toolbar_container" class="app-container container-xxl d-flex flex-stack">
      <div class="d-flex align-items-center">
        <router-link to="/" class="btn btn-sm btn-icon btn-success me-3 shadow-sm">
          <i class="ki-outline ki-arrow-left fs-2 text-white"></i>
        </router-link>
        <h1 class="text-gray-900 fw-bolder fs-2 mb-0">Master Partner</h1>
      </div>
      <button class="btn btn-success fw-bold shadow-sm px-5" @click="openAddModal">
        <i class="ki-outline ki-plus fs-2"></i> Tambah
      </button>
    </div>
  </div>

  <div id="kt_app_content" class="app-content flex-column-fluid pt-0">
    <div id="kt_app_content_container" class="app-container container-xxl">
      
      <div class="d-flex mb-8">
        <div class="d-flex align-items-center position-relative">
          <i class="ki-outline ki-magnifier fs-3 position-absolute ms-4"></i>
          <input type="text" v-model="searchQuery" class="form-control form-control-solid w-250px ps-12" placeholder="Cari Partner..." />
        </div>
      </div>

      <div v-if="loading" class="text-center py-20">
        <span class="spinner-border text-success"></span>
        <div class="text-gray-500 mt-3 fw-bold">Memuat data partner...</div>
      </div>

      <div v-else class="row g-5">
        <div v-for="item in filteredPartners" :key="item.id" class="col-12 col-md-6 col-xl-4">
          <div class="card card-flush h-100 border border-gray-200 shadow-sm cursor-pointer card-hover">
            <div class="card-body p-5">
              <div class="d-flex align-items-center mb-5">
                <div class="symbol symbol-40px symbol-circle me-3">
                  <div class="symbol-label fs-4 bg-light-success text-success fw-bolder">{{ item.name.charAt(0) }}</div>
                </div>
                <div class="d-flex flex-column flex-grow-1">
                  <span class="fs-6 fw-bolder text-gray-900 mb-0">{{ item.name }}</span>
                  <span class="text-muted fs-7 text-truncate">{{ item.address || '-' }}</span>
                </div>
              </div>
              
              <div class="separator separator-dashed my-4"></div>
              
              <div class="d-flex flex-column gap-2 mt-2">
                <div class="d-flex justify-content-between align-items-center">
                  <span class="text-gray-400 fs-9 fw-bold text-uppercase">Markup Fixed</span>
                  <span class="fs-6 fw-bolder text-gray-800">Rp {{ formatNumber(item.markup_fixed) }}</span>
                </div>
              </div>

              <div class="separator separator-dashed my-4"></div>

              <div class="d-flex gap-2">
                <button class="btn btn-sm btn-flex-md btn-light-success flex-grow-1" @click="openEditModal(item)">
                  <i class="ki-outline ki-pencil fs-4 me-2"></i> Edit
                </button>
                <button class="btn btn-sm btn-flex-md btn-light-danger flex-grow-1" @click="handleDelete(item.id)">
                  <i class="ki-outline ki-trash fs-4 me-2"></i> Hapus
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="filteredPartners.length === 0" class="col-12 text-center py-20 bg-light rounded border border-dashed border-gray-400">
          <div class="text-gray-600 fw-bold fs-6">Belum ada partner terdaftar.</div>
        </div>
      </div>
    </div>
  </div>

  <div class="modal fade" tabindex="-1" id="modal_partner">
    <div class="modal-dialog modal-dialog-centered mw-450px">
      <div class="modal-content border-0 rounded-4 shadow-lg">
        <div class="modal-header border-0 justify-content-end pb-0">
          <div class="btn btn-icon btn-sm btn-active-light-primary" data-bs-dismiss="modal">
            <i class="ki-outline ki-cross fs-1"></i>
          </div>
        </div>

        <div class="modal-body px-10 pt-0 pb-15">
          <div class="text-center mb-8">
            <h1 class="mb-3 text-gray-900 fs-2 fw-bolder">{{ isEdit ? 'Edit Partner' : 'Tambah Partner Baru' }}</h1>
          </div>

          <form @submit.prevent="savePartner">
            <div class="mb-6">
              <label class="form-label required fw-bold text-gray-900">Nama Toko / Partner</label>
              <input type="text" v-model="formData.name" class="form-control form-control-solid" placeholder="Contoh: Toko Berkah" required />
            </div>

            <div class="mb-6">
              <label class="form-label fw-bold text-gray-900">Alamat</label>
              <textarea v-model="formData.address" class="form-control form-control-solid" rows="2" placeholder="Alamat lengkap..."></textarea>
            </div>

            <div class="mb-8">
              <label class="form-label fw-bold text-gray-900">Markup Fixed (Untung per Item)</label>
              <input type="number" v-model="formData.markup_fixed" class="form-control form-control-solid" placeholder="1000" />
              <div class="text-muted fs-8 mt-2">Nominal untung tetap yang biasa diambil untuk partner ini.</div>
            </div>

            <div class="d-flex flex-column gap-3">
              <button type="submit" class="btn btn-lg btn-success fw-bold w-100 py-4 shadow-sm" :disabled="submitting">
                <span v-if="!submitting">Simpan Partner</span>
                <span v-else class="spinner-border spinner-border-sm"></span>
              </button>
              <button type="button" class="btn btn-lg btn-secondary fw-bold w-100 py-4 mt-2 shadow-sm" data-bs-dismiss="modal" style="background-color: #e4e6ef; color: #3f4254; border: none;">
                Batal
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { partnerService } from '@/services/PartnerService'

const partners = ref<any[]>([])
const loading = ref(true)
const submitting = ref(false)
const searchQuery = ref('')
const isEdit = ref(false)
const currentId = ref('')

const formData = ref({
  name: '',
  address: '',
  markup_fixed: 1000
})

let partnerModal: any = null

async function fetchPartners() {
  loading.value = true
  try {
    const data = await partnerService.getAll()
    partners.value = data || []
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const openAddModal = () => {
  isEdit.value = false
  formData.value = { name: '', address: '', markup_fixed: 1000 }
  partnerModal.show()
}

const openEditModal = (item: any) => {
  isEdit.value = true
  currentId.value = item.id
  formData.value = { name: item.name, address: item.address, markup_fixed: item.markup_fixed }
  partnerModal.show()
}

async function savePartner() {
  submitting.value = true
  try {
    if (isEdit.value) {
      await partnerService.update(currentId.value, formData.value)
    } else {
      await partnerService.create(formData.value)
    }
    partnerModal.hide()
    // @ts-ignore
    Swal.fire({ text: "Berhasil menyimpan data partner!", icon: "success", timer: 1500, showConfirmButton: false })
    fetchPartners()
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
    title: 'Hapus Partner?',
    text: "Data tidak bisa dikembalikan!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ya, Hapus',
    customClass: { confirmButton: "btn btn-danger", cancelButton: "btn btn-light" }
  })

  if (res.isConfirmed) {
    try {
      await partnerService.delete(id)
      fetchPartners()
    } catch (err: any) {
      alert(err.message)
    }
  }
}

const filteredPartners = computed(() => partners.value.filter(p => p.name.toLowerCase().includes(searchQuery.value.toLowerCase())))
const formatNumber = (num: any) => new Intl.NumberFormat('id-ID').format(num || 0)

onMounted(() => {
  fetchPartners()
  // @ts-ignore
  partnerModal = new bootstrap.Modal(document.getElementById('modal_partner'))
})
</script>

<style scoped>
.transition-all { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.card-hover { transition: transform 0.15s ease-in-out; }
.card-hover:active { transform: scale(0.97); background-color: #f9f9f9; }
.btn:focus { box-shadow: none !important; }
</style>