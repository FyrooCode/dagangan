<template>
  <div class="card card-flush shadow-sm h-100 border-0 mobile-chart-card">
    <div class="card-header pt-6 border-0">
      <h3 class="card-title align-items-start flex-column">
        <span class="card-label fw-bold text-gray-800 fs-5">Top 5 Produk Terlaris</span>
        <span class="text-muted mt-1 fw-semibold fs-8">Berdasarkan total omzet lunas</span>
      </h3>
    </div>
    <div class="card-body p-0 pb-4">
      <div id="mobile_top_product_bar_chart" style="height: 280px;"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch, nextTick } from 'vue'
declare var ApexCharts: any

const props = defineProps<{ data: Array<{name: string, total: number}> }>()
let chartInstance: any = null

const renderChart = () => {
  const element = document.getElementById('mobile_top_product_bar_chart')
  if (!element || !props.data || props.data.length === 0) return

  const options = {
    series: [{ name: 'Total Penjualan', data: props.data.map(d => d.total) }],
    chart: { type: 'bar', height: 280, toolbar: { show: false } },
    plotOptions: { bar: { horizontal: true, borderRadius: 4, columnWidth: '40%', dataLabels: { position: 'center' } } },
    colors: ['#009EF7'],
    dataLabels: {
      enabled: true,
      style: { colors: ['#fff'], fontSize: '11px', fontWeight: '600' },
      formatter: (val: number) => 'Rp ' + new Intl.NumberFormat('id-ID').format(val)
    },
    xaxis: {
      categories: props.data.map(d => d.name),
      labels: { style: { fontSize: '10px', colors: '#A1A5B7' } }
    },
    yaxis: { labels: { style: { fontSize: '10px', colors: '#A1A5B7' } } },
    tooltip: {
      y: { formatter: (val: number) => 'Rp ' + new Intl.NumberFormat('id-ID').format(val) }
    },
    grid: { borderColor: '#EFF2F5', strokeDashArray: 4 }
  }

  if (chartInstance) chartInstance.destroy()
  chartInstance = new ApexCharts(element, options)
  chartInstance.render()
}

onMounted(() => { setTimeout(() => nextTick(renderChart), 150) })
watch(() => props.data, renderChart, { deep: true })
</script>

<style scoped>
.mobile-chart-card {
  border-radius: 18px;
}
.card-title .card-label {
  font-size: 0.95rem;
}
</style>
