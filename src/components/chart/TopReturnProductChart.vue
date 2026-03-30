<template>
  <div class="card card-flush shadow-sm h-100 border-0">
    <div class="card-header pt-7 border-0">
      <h3 class="card-title align-items-start flex-column">
        <span class="card-label fw-bold text-gray-800 fs-4">Produk Paling Banyak Diretur</span>
        <span class="text-muted mt-1 fw-semibold fs-7">Jumlah barang yang dikembalikan (Pcs)</span>
      </h3>
    </div>
    <div class="card-body p-5">
      <div id="return_product_chart" style="height: 300px;"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch, nextTick } from 'vue'
declare var ApexCharts: any;
const props = defineProps<{ data: Array<{name: string, qty: number}> }>()
let chart: any = null;

const render = () => {
  const el = document.getElementById('return_product_chart')
  if (!el || !props.data.length) return
  const options = {
    series: [{ name: 'Qty Retur', data: props.data.map(d => d.qty) }],
    chart: { type: 'bar', height: 300, toolbar: { show: false } },
    plotOptions: { bar: { horizontal: true, borderRadius: 4 } },
    colors: ['#F1416C'], // Merah Metronic
    xaxis: { categories: props.data.map(d => d.name) },
    grid: { borderColor: '#EFF2F5' }
  };
  if (chart) chart.destroy()
  chart = new ApexCharts(el, options); chart.render()
}
onMounted(() => { setTimeout(render, 200) })
watch(() => props.data, render, { deep: true })
</script>