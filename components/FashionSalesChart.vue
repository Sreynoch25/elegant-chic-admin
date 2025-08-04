<template>
  <div class="fashion-sales-chart">
    <canvas ref="chartCanvas" class="w-full h-full"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import Chart from 'chart.js/auto'

const props = defineProps({
  period: {
    type: String,
    default: '30d'
  }
})

const chartCanvas = ref(null)
let chartInstance = null

// Fashion-themed color palette
const fashionColors = {
  primary: '#ec4899', // Pink
  secondary: '#8b5cf6', // Purple
  accent: '#06b6d4', // Cyan
  warning: '#f59e0b', // Amber
  success: '#10b981', // Emerald
  gradients: {
    pink: 'rgba(236, 72, 153, 0.1)',
    purple: 'rgba(139, 92, 246, 0.1)',
    cyan: 'rgba(6, 182, 212, 0.1)'
  }
}

// Generate fashion sales data based on period
const generateSalesData = (period) => {
  const datasets = {
    '7d': {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      data: {
        dresses: [1200, 1900, 3000, 2500, 2200, 3400, 2800],
        tops: [800, 1200, 1800, 1500, 1700, 2100, 1900],
        shoes: [600, 900, 1200, 1100, 1400, 1800, 1600]
      }
    },
    '30d': {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      data: {
        dresses: [15800, 18900, 22100, 19200],
        tops: [12400, 14800, 17200, 15600],
        shoes: [9800, 11200, 13500, 12100]
      }
    },
    '90d': {
      labels: ['Month 1', 'Month 2', 'Month 3'],
      data: {
        dresses: [76000, 82300, 85600],
        tops: [59200, 64800, 68100],
        shoes: [46600, 51200, 54300]
      }
    }
  }
  return datasets[period] || datasets['30d']
}

// Create chart configuration
const createChartConfig = (salesData) => {
  return {
    type: 'line',
    data: {
      labels: salesData.labels,
      datasets: [
        {
          label: 'Dresses',
          data: salesData.data.dresses,
          borderColor: fashionColors.primary,
          backgroundColor: fashionColors.gradients.pink,
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: fashionColors.primary,
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointHoverBackgroundColor: fashionColors.primary,
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 3
        },
        {
          label: 'Tops & Blouses',
          data: salesData.data.tops,
          borderColor: fashionColors.secondary,
          backgroundColor: fashionColors.gradients.purple,
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: fashionColors.secondary,
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointHoverBackgroundColor: fashionColors.secondary,
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 3
        },
        {
          label: 'Shoes',
          data: salesData.data.shoes,
          borderColor: fashionColors.accent,
          backgroundColor: fashionColors.gradients.cyan,
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: fashionColors.accent,
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointHoverBackgroundColor: fashionColors.accent,
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index'
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          align: 'end',
          labels: {
            usePointStyle: true,
            pointStyle: 'circle',
            padding: 20,
            font: {
              size: 12,
              weight: '500'
            },
            color: '#374151'
          }
        },
        tooltip: {
          enabled: true,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          titleColor: '#111827',
          bodyColor: '#374151',
          borderColor: '#e5e7eb',
          borderWidth: 1,
          cornerRadius: 8,
          displayColors: true,
          padding: 12,
          titleFont: {
            size: 14,
            weight: 'bold'
          },
          bodyFont: {
            size: 13
          },
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: $${context.parsed.y.toLocaleString()}`
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          border: {
            display: false
          },
          ticks: {
            color: '#6b7280',
            font: {
              size: 12,
              weight: '500'
            },
            padding: 10
          }
        },
        y: {
          grid: {
            color: '#f3f4f6',
            borderDash: [2, 4]
          },
          border: {
            display: false
          },
          ticks: {
            color: '#6b7280',
            font: {
              size: 12
            },
            padding: 15,
            callback: function(value) {
              return '$' + (value / 1000).toFixed(0) + 'k'
            }
          }
        }
      },
      elements: {
        line: {
          borderCapStyle: 'round',
          borderJoinStyle: 'round'
        }
      },
      animation: {
        duration: 1500,
        easing: 'easeInOutCubic',
        delay: (context) => {
          let delay = 0
          if (context.type === 'data' && context.mode === 'default') {
            delay = context.dataIndex * 100 + context.datasetIndex * 200
          }
          return delay
        }
      }
    }
  }
}

// Initialize chart
const initChart = () => {
  if (chartInstance) {
    chartInstance.destroy()
  }

  const salesData = generateSalesData(props.period)
  const config = createChartConfig(salesData)

  chartInstance = new Chart(chartCanvas.value, config)
}

// Watch for period changes
watch(() => props.period, () => {
  initChart()
})

onMounted(() => {
  initChart()
})

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy()
  }
})
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