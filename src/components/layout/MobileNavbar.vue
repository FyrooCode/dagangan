<template>
  <nav class="mobile-navbar" v-if="show">
    <router-link
      v-for="menu in menus"
      :key="menu.path"
      :to="menu.path"
      class="mobile-navbar__item"
      :title="menu.title"
    >
      <i :class="menu.icon" class="mobile-navbar__icon"></i>
      <span class="mobile-navbar__label">{{ menu.title }}</span>
    </router-link>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const menus = [
  { path: '/dashboard', title: 'Dashboard', icon: 'ki-outline ki-element-11' },
  { path: '/shipments', title: 'Pengiriman', icon: 'ki-outline ki-delivery-3' },
  { path: '/returns', title: 'Sisa', icon: 'ki-outline ki-arrows-loop' },
  { path: '/payments', title: 'Pembayaran', icon: 'ki-outline ki-wallet' },
  { path: '/lainnya', title: 'Lainnya', icon: 'ki-outline ki-menu' },
]

const route = useRoute()
const show = computed(() => {
  // Hide on desktop, show on mobile only
  return true
})
</script>

<style scoped>
.mobile-navbar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: #fff;
  border-top: 1px solid #eee;
  box-shadow: 0 -2px 8px rgba(0,0,0,0.03);
  padding: 0.5rem 0;
}
.mobile-navbar__item {
  flex: 1;
  text-align: center;
  color: #888;
  text-decoration: none;
  font-size: 0.95rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.35rem 0;
}
.mobile-navbar__item.router-link-active {
  color: var(--kt-primary, #009ef7);
}
.mobile-navbar__icon {
  font-size: 1.9rem;
  margin-bottom: 0.12rem;
}
.mobile-navbar__label {
  font-size: 0.85rem;
}
@media (min-width: 992px) {
  .mobile-navbar {
    display: none !important;
  }
}
</style>
