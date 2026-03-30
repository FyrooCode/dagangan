import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '@/lib/supabase'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: DefaultLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('@/views/Dashboard.vue'),
        },
        {
          path: 'products',
          name: 'products',
          component: () => import('@/views/products/ProductList.vue'),
        },
        {
          path: 'partners',
          name: 'partners',
          component: () => import('@/views/partners/PartnerList.vue'),
        },
        // --- Shipments Management (Penjualan) ---
        {
          path: 'shipments',
          name: 'shipments',
          component: () => import('@/views/shipments/ShipmentList.vue'),
        },
        {
          path: 'shipments/create',
          name: 'shipments-create',
          component: () => import('@/views/shipments/ShipmentForm.vue'),
        },
        {
          path: 'shipments/edit/:id',
          name: 'shipments-edit',
          component: () => import('@/views/shipments/ShipmentForm.vue'),
        },
        // --- Returns Management (Barang Sisa) ---
        {
          path: 'returns',
          name: 'returns',
          component: () => import('@/views/returns/ReturnList.vue'),
        },
        {
          path: 'returns/create',
          name: 'returns-create',
          component: () => import('@/views/returns/ReturnForm.vue'),
        },
        {
  path: 'payments',
  name: 'payments',
  component: () => import('@/views/payments/PaymentList.vue'),
},
      ],
    },
    {
      path: '/auth',
      component: AuthLayout,
      children: [
        {
          path: 'login',
          name: 'login',
          component: () => import('@/views/Login.vue'),
        },
      ],
    },
  ],
})

/**
 * Navigation Guard (Modern Style - No next() callback)
 */
router.beforeEach(async (to) => {
  // 1. Ambil sesi user
  const { data: { session } } = await supabase.auth.getSession()
  
  // 2. Tentukan apakah route butuh login
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  // 3. Logika Proteksi dengan Return Value
  if (requiresAuth && !session) {
    // Jika butuh login tapi ga ada sesi, lempar ke login
    return { name: 'login' }
  }

  if (to.name === 'login' && session) {
    // Jika sudah login tapi mau ke halaman login, balikkan ke dashboard
    return { name: 'dashboard' }
  }

  // Jika tidak ada masalah, biarkan lanjut (default return true)
})

export default router