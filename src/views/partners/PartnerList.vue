<template>
  <div id="kt_app_toolbar" class="app-toolbar py-3 py-lg-0">
    <div id="kt_app_toolbar_container" class="app-container container-xxl d-flex flex-stack flex-wrap gap-2">
      <div class="page-title d-flex flex-column justify-content-center me-3">
        <h1 class="page-heading d-flex text-gray-900 fw-bold fs-3 flex-column justify-content-center my-0">Master Partner</h1>
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
          <i class="ki-outline ki-plus fs-4 me-1"></i> Tambah Partner
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
              <input type="text" v-model="searchQuery" class="form-control form-control-solid w-100 w-md-250px ps-12" placeholder="Cari Partner..." />
            </div>
          </div>
        </div>

        <div class="card-body pt-0">
          <div class="table-responsive">
            <table class="table align-middle table-row-dashed fs-6 gy-5">
              <thead>
                <tr class="text-start text-gray-500 fw-bold fs-7 text-uppercase gs-0">
                  <th class="min-w-200px">Nama Partner</th>
                  <th class="min-w-200px">Alamat</th>
                  <th class="text-end min-w-150px">Markup (Untung)</th>
                  <th class="text-end min-w-100px">Aksi</th>
                </tr>
              </thead>
              <tbody class="fw-semibold text-gray-600">
                <tr v-if="loading">
                  <td colspan="4" class="text-center py-10">
                    <span class="spinner-border spinner-border-sm align-middle ms-2"></span> Memuat data...
                  </td>
                </tr>
                <tr v-else v-for="item in filteredPartners" :key="item.id">
                  <td>
                    <div class="d-flex align-items-center">
                      <div class="symbol symbol-40px symbol-md-50px me-3 me-md-5">
                        <span class="symbol-label bg-light-success text-success fw-bold">{{ item.name.charAt(0) }}</span>
                      </div>
                      <span class="text-gray-800 fs-6 fs-md-5 fw-bold">{{ item.name }}</span>
                    </div>
                  </td>
                  <td>{{ item.address || '-' }}</td>
                  <td class="text-end pe-0">Rp {{ formatNumber(item.markup_fixed) }}</td>
                  <td class="text-end">
                    <div class="d-flex justify-content-end gap-2">
                      <button class="btn btn-sm btn-icon btn-light-primary" @click="openEditModal(item)">
                        <i class="ki-outline ki-pencil fs-5"></i>
                      </button>
                      <button class="btn btn-sm btn-icon btn-light-danger" @click="handleDelete(item.id)">
                        <i class="ki-outline ki-trash fs-5"></i>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="!loading && filteredPartners.length === 0">
                  <td colspan="4" class="text-center text-muted py-10">Belum ada partner terdaftar.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="modal fade" tabindex="-1" id="modal_partner">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">{{ isEdit ? 'Edit Partner' : 'Tambah Partner Baru' }}</h3>
          <div class="btn btn-icon btn-sm btn-active-light-primary ms-2" data-bs-dismiss="modal">
            <i class="ki-outline ki-cross fs-1"></i>
          </div>
        </div>

        <form @submit.prevent="savePartner">
          <div class="modal-body">
            <div class="mb-5">
              <label class="form-label required">Nama Toko / Partner</label>
              <div class="input-group input-group-solid mb-5">
                <span class="input-group-text"><i class="ki-outline ki-shop fs-2"></i></span>
                <input type="text" v-model="formData.name" class="form-control" placeholder="Contoh: Toko Berkah" required />
              </div>
            </div>

            <div class="mb-5">
              <label class="form-label">Alamat</label>
              <div class="input-group input-group-solid mb-5">
                <span class="input-group-text"><i class="ki-outline ki-geolocation fs-2"></i></span>
                <textarea v-model="formData.address" class="form-control" rows="2" placeholder="Alamat lengkap..."></textarea>
              </div>
            </div>

            <div class="mb-5">
              <label class="form-label">Markup Fixed (Untung per Item)</label>
              <div class="input-group input-group-solid mb-5">
                <span class="input-group-text">Rp</span>
                <input type="number" v-model="formData.markup_fixed" class="form-control" placeholder="1000" />
              </div>
              <div class="text-muted fs-7">Nominal untung tetap yang biasa diambil untuk partner ini.</div>
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