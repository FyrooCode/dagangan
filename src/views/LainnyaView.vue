
<template>
  <div class="lainnya-page container">
    <h2 class="lainnya-title">Master Data</h2>
    <div class="row g-5 g-xl-10">
      <div class="col-6 col-md-4">
        <router-link to="/products" class="card card-flush h-100 bgi-no-repeat bgi-size-contain bgi-position-x-end shadow-sm card-hover lainnya-card">
          <div class="card-body d-flex flex-column justify-content-center text-center p-8">
            <div class="mb-4">
              <i class="ki-outline ki-basket fs-3hx text-primary"></i>
            </div>
            <span class="text-gray-800 fw-bold fs-5">Produk</span>
            <span class="text-gray-400 fw-semibold fs-7 mt-1">Input Barang</span>
          </div>
        </router-link>
      </div>
      <div class="col-6 col-md-4">
        <router-link to="/partners" class="card card-flush h-100 bgi-no-repeat bgi-size-contain bgi-position-x-end shadow-sm card-hover lainnya-card">
          <div class="card-body d-flex flex-column justify-content-center text-center p-8">
            <div class="mb-4">
              <i class="ki-outline ki-profile-user fs-3hx text-primary"></i>
            </div>
            <span class="text-gray-800 fw-bold fs-5">Partner</span>
            <span class="text-gray-400 fw-semibold fs-7 mt-1">Daftar Partner</span>
          </div>
        </router-link>
      </div>
      <!-- Add more master data cards here as you scale -->
    </div>
  </div>
</template>

<script setup lang="ts">
// No logic needed for static menu
</script>

<style scoped>
.lainnya-page {
  padding: 2rem 1rem;
}
.lainnya-title {
  font-size: 1.3rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  color: #333;
}
.lainnya-card {
  min-height: 180px;
}
</style>
