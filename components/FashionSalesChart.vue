<template>
  <div class="fashion-sales-chart">
    <canvas ref="chartCanvas" class="w-full h-full"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import Chart from 'chart.js/auto'
import type { SalesOverview } from '~/types/dashboard/dashboard'

const props = defineProps<{
  period: string
  salesOverview: SalesOverview[]
  kpis: Record<string, any>
}>()


const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

// Fashion-themed color palette
const fashionColors = {
  dresses: '#ec4899', // pink
  tops: '#8b5cf6', // purple
  shoes: '#06b6d4', // cyan
  gradients: {
    dresses: 'rgba(236, 72, 153, 0.1)',
    tops: 'rgba(139, 92, 246, 0.1)',
    shoes: 'rgba(6, 182, 212, 0.1)'
  }
}

// Transform API data to Chart.js format
const generateChartData = () => {
  if (!props.salesOverview.length) return {
    labels: [],
    datasets: []
  }

  const labels = props.salesOverview.map(item => item.week || item.period)
  const dressesData = props.salesOverview.map(item => item.dresses || 0)
  const topsData = props.salesOverview.map(item => item.tops__blouses || 0)
  const shoesData = props.salesOverview.map(item => item.shoes || 0)

  return {
    labels,
    datasets: [
      {
        label: 'Dresses',
        data: dressesData,
        borderColor: fashionColors.dresses,
        backgroundColor: fashionColors.gradients.dresses,
        fill: true,
        tension: 0.4
      },
      {
        label: 'Tops & Blouses',
        data: topsData,
        borderColor: fashionColors.tops,
        backgroundColor: fashionColors.gradients.tops,
        fill: true,
        tension: 0.4
      },
      {
        label: 'Shoes',
        data: shoesData,
        borderColor: fashionColors.shoes,
        backgroundColor: fashionColors.gradients.shoes,
        fill: true,
        tension: 0.4
      }
    ]
  }
}

// Create chart
const initChart = () => {
  if (chartInstance) chartInstance.destroy()

  const chartData = generateChartData()

  chartInstance = new Chart(chartCanvas.value!, {
    type: 'line',
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: $${context.parsed.y.toLocaleString()}`
            }
          }
        }
      },
      scales: {
        y: {
          ticks: {
            callback: (value) => '$' + value
          }
        }
      }
    }
  })
}

watch(() => [props.salesOverview, props.period], () => {
  initChart()
})

onMounted(() => initChart())
onUnmounted(() => { if (chartInstance) chartInstance.destroy() })
</script>

<style scoped>
.fashion-sales-chart {
  position: relative;
  height: 100%;
  width: 100%;
}

.fashion-sales-chart canvas {
  border-radius: 8px;
}

/* Add subtle animation on load */
.fashion-sales-chart {
  animation: fadeInChart 0.8s ease-out;
}

@keyframes fadeInChart {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>