<template>
  <div class="card card-flush shadow-sm h-100 border-0">
    <div class="card-header pt-7 border-0">
      <h3 class="card-title align-items-start flex-column">
        <span class="card-label fw-bold text-gray-800 fs-4">Tren Pendapatan</span>
        <span class="text-muted mt-1 fw-semibold fs-7">Statistik pendapatan harian</span>
      </h3>
    </div>
    <div class="card-body p-0 pb-5">
      <div id="revenue_area_chart" style="width: 100%; height: 350px;"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch, nextTick } from 'vue'
declare var ApexCharts: any;

const props = defineProps<{ data: Array<{x: number, y: number}> }>()
let chartInstance: any = null;

const renderChart = () => {
  const element = document.getElementById('revenue_area_chart')
  
  if (!element || !props.data || props.data.length === 0) return

  const safeData = props.data.map(d => ({
    x: d.x,
    y: Number(d.y) || 0
  }))

  const options = {
    series: [{ 
      name: 'Pendapatan', 
      data: safeData 
    }],
    chart: {
      type: 'area',
      height: 350,
      width: '100%',
      toolbar: { show: false },
      parentHeightOffset: 0
    },
    colors: ['#50CD89'],
    stroke: { curve: 'smooth', width: 3 },
    fill: {
      type: 'gradient',
      gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0, stops: [0, 90, 100] }
    },
    xaxis: {
      type: 'datetime',
      labels: { style: { fontSize: '11px', colors: '#A1A5B7' } }
    },
    yaxis: {
      labels: {
        formatter: (val: number) => {
           if (val === undefined || isNaN(val)) return 'Rp 0'
           return 'Rp ' + (val/1000).toFixed(0) + 'k'
        },
        style: { fontSize: '11px', colors: '#A1A5B7' }
      }
    },
    grid: { borderColor: '#EFF2F5', strokeDashArray: 4 }
  };

  if (chartInstance) {
    chartInstance.destroy()
  }
  
  chartInstance = new ApexCharts(element, options)
  chartInstance.render()
}

onMounted(() => { 
  setTimeout(() => {
    nextTick(renderChart)
  }, 100)
})

watch(() => props.data, () => {
  setTimeout(() => {
    renderChart()
  }, 100)
}, { deep: true })
</script>