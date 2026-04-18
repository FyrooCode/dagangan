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
        // --- Shipments Management ---
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
        // --- Returns Management (FIXED) ---
        {
          path: 'returns',
          name: 'returns',
          component: () => import('@/views/returns/ReturnList.vue'),
        },
        // Pakai :shipmentId? (tanda tanya) agar parameter bersifat opsional
        {
          path: 'returns/create/:shipmentId?',
          name: 'returns-create',
          component: () => import('@/views/returns/ReturnForm.vue'),
        },
        {
          path: 'payments',
          name: 'payments',
          component: () => import('@/views/payments/PaymentList.vue'),
        },
        {
          path: 'lainnya',
          name: 'lainnya',
          component: () => import('@/views/LainnyaView.vue'),
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

router.beforeEach(async (to) => {
  const { data: { session } } = await supabase.auth.getSession()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  if (requiresAuth && !session) {
    return { name: 'login' }
  }

  if (to.name === 'login' && session) {
    return { name: 'dashboard' }
  }
})

export default router