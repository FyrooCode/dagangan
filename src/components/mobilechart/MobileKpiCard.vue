<template>
  <div :class="['mobile-kpi-card', variantClass]">
    <div class="card-body p-6 mobile-kpi-card__body">
      <div class="mobile-kpi-card__meta">
        <div>
          <div class="mobile-kpi-card__label">{{ label }}</div>
          <div class="mobile-kpi-card__value">Rp {{ formattedValue }}</div>
        </div>
        <div class="mobile-kpi-card__icon-wrapper">
          <i :class="iconClass"></i>
        </div>
      </div>
      <p v-if="subtitle" class="mobile-kpi-card__subtitle">{{ subtitle }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  label: string
  value: number
  iconClass?: string
  subtitle?: string
  variant?: 'primary' | 'success' | 'warning' | 'danger'
}

const props = defineProps<Props>()

const formattedValue = computed(() => {
  return new Intl.NumberFormat('id-ID').format(props.value || 0)
})

const iconClass = computed(() => props.iconClass || 'ki-outline ki-chart-simple')
const variantClass = computed(() => `mobile-kpi-card--${props.variant || 'primary'}`)
</script>

<style scoped>
.mobile-kpi-card {
  border-radius: 18px;
  overflow: hidden;
  min-height: 150px;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}
.mobile-kpi-card:hover {
  transform: translateY(-2px);
}
.mobile-kpi-card__body {
  min-height: 150px;
}
.mobile-kpi-card__meta {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}
.mobile-kpi-card__label {
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--kt-gray-600, #6c757d);
}
.mobile-kpi-card__value {
  margin-top: 0.75rem;
  font-size: 2rem;
  font-weight: 800;
  line-height: 1.05;
  color: var(--kt-gray-900, #212529);
}
.mobile-kpi-card__subtitle {
  margin-top: 1rem;
  font-size: 0.85rem;
  color: var(--kt-gray-600, #6c757d);
}
.mobile-kpi-card__icon-wrapper {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  background: rgba(13, 110, 253, 0.08);
}
.mobile-kpi-card__icon-wrapper i {
  font-size: 1.35rem;
}
.mobile-kpi-card--primary {
  background: #ffffff;
  border: 1px solid rgba(13, 110, 253, 0.12);
}
.mobile-kpi-card--success {
  background: #f3faf7;
  border: 1px solid rgba(25, 135, 84, 0.16);
}
.mobile-kpi-card--warning {
  background: #fff4e5;
  border: 1px solid rgba(255, 193, 7, 0.16);
}
.mobile-kpi-card--danger {
  background: #fff2f2;
  border: 1px solid rgba(220, 53, 69, 0.16);
}
</style>
