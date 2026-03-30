<template>
  <div class="card card-flush shadow-sm h-100 border-0">
    <div class="card-header pt-7 border-0">
      <h3 class="card-title align-items-start flex-column">
        <span class="card-label fw-bold text-gray-800 fs-4">Top 5 Produk Terlaris</span>
        <span class="text-muted mt-1 fw-semibold fs-7">Berdasarkan total omzet lunas</span>
      </h3>
    </div>
    <div class="card-body d-flex flex-column p-5">
      <div id="top_product_bar_chart" style="height: 350px;"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch, nextTick } from 'vue'
declare var ApexCharts: any;

const props = defineProps<{ data: Array<{name: string, total: number}> }>()
let chartInstance: any = null;

const renderChart = () => {
  const element = document.getElementById('top_product_bar_chart')
  if (!element || !props.data || props.data.length === 0) return

  const options = {
    series: [{
      name: 'Total Penjualan',
      data: props.data.map(d => d.total)
    }],
    chart: {
      fontFamily: 'inherit',
      type: 'bar',
      height: 350,
      toolbar: { show: false }
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 4,
        columnWidth: '30%',
      }
    },
    colors: ['#009EF7'], // Metronic Info (Blue)
    dataLabels: { enabled: false },
    xaxis: {
      categories: props.data.map(d => d.name),
      labels: {
        formatter: (val: number) => 'Rp ' + (val/1000).toFixed(0) + 'k',
        style: { fontSize: '11px', colors: '#A1A5B7' }
      }
    },
    yaxis: {
      labels: { style: { fontSize: '11px', colors: '#A1A5B7' } }
    },
    grid: { borderColor: '#EFF2F5', strokeDashArray: 4 },
    tooltip: {
      y: { formatter: (val: number) => 'Rp ' + new Intl.NumberFormat('id-ID').format(val) }
    }
  };

  if (chartInstance) chartInstance.destroy()
  chartInstance = new ApexCharts(element, options)
  chartInstance.render()
}

onMounted(() => { setTimeout(() => nextTick(renderChart), 150) })
watch(() => props.data, () => { renderChart() }, { deep: true })
</script>