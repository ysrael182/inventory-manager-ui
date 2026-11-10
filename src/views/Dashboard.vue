<template>
  <v-container>
    <!-- Bar Chart -->
    <v-card class="mb-4">
      <v-card-title>📊 Ventas por Producto</v-card-title>
      <v-card-text>
        <Bar :data="chartData" :options="chartOptions" />
      </v-card-text>
    </v-card>

    <!-- Line Chart -->
    <v-card class="mb-4">
      <v-card-title>📈 Tendencia de Ventas</v-card-title>
      <v-card-text>
        <Line :data="lineData" :options="lineOptions" />
      </v-card-text>
    </v-card>

    <!-- Pie Chart -->
    <v-card>
      <v-card-title>🥧 Distribución de Productos</v-card-title>
      <v-card-text>
        <Pie :data="pieData" :options="pieOptions" />
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, LineElement, PointElement, CategoryScale, LinearScale, ArcElement } from 'chart.js'
import { Bar, Line, Pie } from 'vue-chartjs'

ChartJS.register(Title, Tooltip, Legend, BarElement, LineElement, PointElement, CategoryScale, LinearScale, ArcElement)

const chartData = {
  labels: ['Producto A', 'Producto B', 'Producto C'],
  datasets: [
    {
      label: 'Cantidad Vendida',
      data: [12, 19, 7],
      backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726']
    }
  ]
}

const chartOptions = {
  responsive: true,
  plugins: {
    legend: { position: 'top' },
    title: { display: true, text: 'Ventas por Producto' }
  }
}

const lineData = {
  labels: ['Enero', 'Febrero', 'Marzo', 'Abril'],
  datasets: [
    {
      label: 'Ventas Mensuales',
      data: [30, 45, 28, 60],
      borderColor: '#42A5F5',
      backgroundColor: '#42A5F5',
      fill: false
    }
  ]
}

const lineOptions = {
  responsive: true,
  plugins: {
    legend: { position: 'top' },
    title: { display: true, text: 'Tendencia de Ventas' }
  }
}

const pieData = {
  labels: ['Producto A', 'Producto B', 'Producto C'],
  datasets: [
    {
      label: 'Distribución',
      data: [12, 19, 7],
      backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726']
    }
  ]
}

const pieOptions = {
  responsive: true,
  plugins: {
    legend: { position: 'bottom' },
    title: { display: true, text: 'Distribución de Productos' }
  }
}
</script>
