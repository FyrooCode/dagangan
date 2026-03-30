<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '@/services/AuthService'

const router = useRouter()
const email = ref('')
const password = ref('')
const loading = ref(false)
const showPassword = ref(false)

async function handleLogin() {
  // Validasi input
  if (!email.value || !password.value) {
    // @ts-ignore
    Swal.fire({
      text: "Email dan password wajib diisi!",
      icon: "warning",
      buttonsStyling: false,
      confirmButtonText: "Mengerti",
      customClass: {
        confirmButton: "btn btn-primary"
      }
    });
    return
  }

  loading.value = true
  
  try {
    await authService.login(email.value, password.value)
    // Jika sukses, langsung ke dashboard
    router.push('/')
  } catch (error: any) {
    // Logging untuk kebutuhan debugging sistem
    console.error("Login Error:", error)

    // SweetAlert Bahasa Indonesia
    // @ts-ignore
    Swal.fire({
      title: "Login Gagal",
      text: error.message || "Email atau password yang Anda masukkan salah.",
      icon: "error",
      buttonsStyling: false,
      confirmButtonText: "Coba Lagi",
      customClass: {
        confirmButton: "btn btn-danger"
      }
    });
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form class="form w-100" novalidate id="kt_sign_in_form" @submit.prevent="handleLogin">
    <div class="text-center mb-11">
      <h1 class="text-gray-900 fw-bolder mb-3">Masuk</h1>
      <div class="text-gray-500 fw-semibold fs-6">Sistem Tracking Penjualan</div>
    </div>

    <div class="fv-row mb-8">
      <input v-model="email" type="email" placeholder="Email" class="form-control bg-transparent" autocomplete="username" />
    </div>

    <div class="fv-row mb-8">
      <div class="position-relative">
        <input v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="Password" class="form-control bg-transparent" autocomplete="current-password" />
        <span @click="showPassword = !showPassword" class="btn btn-sm btn-icon position-absolute translate-middle top-50 end-0 me-n2" style="cursor: pointer;">
          <i :class="showPassword ? 'd-none' : ''" class="ki-duotone ki-eye-slash fs-1"><span class="path1"></span><span class="path2"></span><span class="path3"></span><span class="path4"></span></i>
          <i :class="showPassword ? '' : 'd-none'" class="ki-duotone ki-eye fs-1"><span class="path1"></span><span class="path2"></span><span class="path3"></span></i>
        </span>
      </div>
    </div>

    <div class="d-grid">
      <button type="submit" class="btn btn-primary" :disabled="loading">
        <span v-if="!loading">Masuk</span>
        <span v-else>
          Mohon tunggu... <span class="spinner-border spinner-border-sm align-middle ms-2"></span>
        </span>
      </button>
    </div>
  </form>
</template>