<template>
  <v-container>
    <div class="mb-4">
      <h1 class="text-h4">Reportes de ventas</h1>
      <p class="text-body-2 text-medium-emphasis mt-1">
        Consulta ventas por producto, periodo y usuario.
      </p>
    </div>

    <v-card class="mb-6" variant="outlined">
      <v-card-title>Periodo del reporte</v-card-title>
      <v-card-text>
        <v-row align="center">
          <v-col cols="12" sm="5" md="4">
            <v-text-field
              v-model="startDate"
              type="date"
              label="Fecha de inicio"
              hide-details="auto"
            />
          </v-col>
          <v-col cols="12" sm="5" md="4">
            <v-text-field
              v-model="endDate"
              type="date"
              label="Fecha de fin"
              hide-details="auto"
            />
          </v-col>
          <v-col cols="12" sm="2" md="4" class="d-flex flex-wrap ga-2">
            <v-btn color="primary" :loading="reportLoading" @click="applyFilters">
              Aplicar
            </v-btn>
            <v-btn variant="outlined" :disabled="reportLoading" @click="clearFilters">
              Todo el tiempo
            </v-btn>
          </v-col>
        </v-row>
        <v-alert v-if="validationError" class="mt-3" type="warning" variant="tonal">
          {{ validationError }}
        </v-alert>
      </v-card-text>
    </v-card>

    <v-alert v-if="reportError" class="mb-4" type="error" variant="tonal">
      {{ reportError }}
    </v-alert>

    <div v-if="reportLoading" class="d-flex justify-center py-10">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <template v-else-if="!reportError">
      <v-row class="mb-2">
        <v-col v-for="stat in summaryCards" :key="stat.label" cols="12" sm="6" md="4" lg="2">
          <v-card height="100%" variant="tonal" color="primary">
            <v-card-text>
              <div class="text-body-2 text-medium-emphasis">{{ stat.label }}</div>
              <div class="text-h5 font-weight-bold mt-2">{{ stat.value }}</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <section aria-labelledby="period-charts-heading" class="mb-6">
        <h2 id="period-charts-heading" class="text-h5 mb-3">Tendencias por periodo</h2>
        <v-row>
          <v-col cols="12" lg="6">
            <v-card height="100%" variant="outlined">
              <v-card-title class="d-flex align-center justify-space-between ga-2">
                <span>Ventas</span>
                <v-select
                  v-model="salesChartPeriod"
                  :items="periodOptions"
                  label="Agrupar por"
                  density="compact"
                  hide-details
                  max-width="160"
                  @update:model-value="refreshSalesChart"
                />
              </v-card-title>
              <v-card-text>
                <v-alert v-if="salesChartError" type="error" variant="tonal">
                  {{ salesChartError }}
                </v-alert>
                <div v-else-if="salesChartLoading" class="d-flex justify-center py-8">
                  <v-progress-circular indeterminate color="primary" />
                </div>
                <p v-else-if="salesChartData.labels?.length === 0" class="text-body-2 text-medium-emphasis py-6">
                  No hay ventas para este periodo.
                </p>
                <div v-else style="height: 320px">
                  <Bar :data="salesChartData" :options="salesChartOptions" />
                </div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" lg="6">
            <v-card height="100%" variant="outlined">
              <v-card-title class="d-flex align-center justify-space-between ga-2">
                <span>Compras</span>
                <v-select
                  v-model="purchaseChartPeriod"
                  :items="periodOptions"
                  label="Agrupar por"
                  density="compact"
                  hide-details
                  max-width="160"
                  @update:model-value="refreshPurchaseChart"
                />
              </v-card-title>
              <v-card-text>
                <v-alert v-if="purchaseChartError" type="error" variant="tonal">
                  {{ purchaseChartError }}
                </v-alert>
                <div v-else-if="purchaseChartLoading" class="d-flex justify-center py-8">
                  <v-progress-circular indeterminate color="primary" />
                </div>
                <p v-else-if="purchaseChartData.labels?.length === 0" class="text-body-2 text-medium-emphasis py-6">
                  No hay compras para este periodo.
                </p>
                <div v-else style="height: 320px">
                  <Bar :data="purchaseChartData" :options="purchaseChartOptions" />
                </div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12">
            <v-card variant="outlined">
              <v-card-title class="text-wrap">Tendencia de ventas</v-card-title>
              <v-card-text>
                <p class="text-body-2 text-medium-emphasis mb-4">
                  La línea facilita ver cómo cambia el total de ventas entre periodos. Usa el mismo periodo y filtros del gráfico de ventas.
                </p>
                <div v-if="salesChartLoading" class="d-flex justify-center py-8" role="status" aria-live="polite">
                  <v-progress-circular indeterminate color="primary" aria-label="Cargando tendencia de ventas" />
                </div>
                <p v-else-if="salesChartError" class="text-body-2 text-medium-emphasis py-6">
                  La tendencia no está disponible porque no se pudo cargar el gráfico de ventas.
                </p>
                <p v-else-if="salesPeriodReport.length === 0" class="text-body-2 text-medium-emphasis py-6">
                  No hay ventas para mostrar en este periodo.
                </p>
                <div v-else style="height: 320px">
                  <Line :data="salesTrendChartData" :options="salesTrendChartOptions" />
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </section>

      <v-card class="mb-6" variant="outlined">
        <v-card-title class="d-flex align-center justify-space-between ga-2">
          <span>Ventas por producto</span>
          <v-btn
            prepend-icon="mdi-download"
            variant="outlined"
            :disabled="productRows.length === 0"
            @click="downloadProductsCsv"
          >
            Descargar CSV
          </v-btn>
        </v-card-title>
        <v-card-text class="pt-0">
          <p class="text-body-2 text-medium-emphasis mb-3">
            Los descuentos se registran por venta y se asignan proporcionalmente a cada producto.
          </p>
          <v-data-table
            :headers="productHeaders"
            :items="productRows"
            item-value="productId"
            :items-per-page="10"
          >
            <template #item.quantity="{ value }">{{ formatQuantity(value) }}</template>
            <template #item.grossAmount="{ value }">{{ formatCurrency(value) }}</template>
            <template #item.discount="{ value }">{{ formatCurrency(value) }}</template>
            <template #item.netAmount="{ value }">{{ formatCurrency(value) }}</template>
            <template #no-data>
              <div class="py-6 text-medium-emphasis">No hay ventas de productos para este periodo.</div>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>

      <v-card class="mb-6" variant="outlined">
        <v-card-title class="d-flex align-center justify-space-between ga-2">
          <span>Historial de ventas del producto</span>
          <v-btn
            prepend-icon="mdi-download"
            variant="outlined"
            :disabled="historyLoading || historyRows.length === 0"
            @click="downloadHistoryCsv"
          >
            Descargar CSV
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="7">
              <v-select
                v-model="selectedProductId"
                :items="productRows"
                item-title="productName"
                item-value="productId"
                label="Producto"
                no-data-text="No hay productos vendidos en este periodo"
                hide-details
                @update:model-value="refreshProductHistory"
              />
            </v-col>
            <v-col cols="12" md="5">
              <v-select
                v-model="selectedPeriod"
                :items="periodOptions"
                label="Agrupar por"
                hide-details
                @update:model-value="refreshProductHistory"
              />
            </v-col>
          </v-row>
          <v-alert v-if="historyError" class="mt-4" type="error" variant="tonal">
            {{ historyError }}
          </v-alert>
          <div v-if="historyLoading" class="d-flex justify-center py-8">
            <v-progress-circular indeterminate color="primary" />
          </div>
          <v-data-table
            v-if="!historyLoading"
            class="mt-4"
            :headers="historyHeaders"
            :items="historyRows"
            item-value="period"
            :items-per-page="10"
          >
            <template #item.quantity="{ value }">{{ formatQuantity(value) }}</template>
            <template #item.period="{ value }">{{ formatPeriod(value) }}</template>
            <template #item.grossAmount="{ value }">{{ formatCurrency(value) }}</template>
            <template #item.discount="{ value }">{{ formatCurrency(value) }}</template>
            <template #item.netAmount="{ value }">{{ formatCurrency(value) }}</template>
            <template #no-data>
              <div class="py-6 text-medium-emphasis">No hay historial disponible para este producto.</div>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>

      <v-card variant="outlined">
        <v-card-title class="d-flex align-center justify-space-between ga-2">
          <span>Ventas por usuario / cajero</span>
          <v-btn
            prepend-icon="mdi-download"
            variant="outlined"
            :disabled="userRows.length === 0"
            @click="downloadUsersCsv"
          >
            Descargar CSV
          </v-btn>
        </v-card-title>
        <v-card-text class="pt-0">
          <p class="text-body-2 text-medium-emphasis mb-3">
            Cada usuario se agrega sumando sus filas de productos; los descuentos son asignaciones proporcionales por venta.
          </p>
          <v-data-table
            :headers="userHeaders"
            :items="userRows"
            item-value="username"
            :items-per-page="10"
          >
            <template #item.quantity="{ value }">{{ formatQuantity(value) }}</template>
            <template #item.grossAmount="{ value }">{{ formatCurrency(value) }}</template>
            <template #item.discount="{ value }">{{ formatCurrency(value) }}</template>
            <template #item.netAmount="{ value }">{{ formatCurrency(value) }}</template>
            <template #no-data>
              <div class="py-6 text-medium-emphasis">No hay ventas por usuario para este periodo.</div>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </template>

    <section aria-labelledby="purchases-heading" class="mt-8">
      <h2 id="purchases-heading" class="text-h5 mb-3">Reporte de compras</h2>
      <v-alert v-if="purchaseReportError" class="mb-4" type="error" variant="tonal">
        {{ purchaseReportError }}
      </v-alert>
      <div v-if="purchaseReportLoading" class="d-flex justify-center py-8">
        <v-progress-circular indeterminate color="primary" />
      </div>
      <template v-else-if="!purchaseReportError">
        <v-row class="mb-2">
          <v-col v-for="stat in purchaseSummaryCards" :key="stat.label" cols="12" sm="6" md="4">
            <v-card height="100%" variant="tonal" color="secondary">
              <v-card-text>
                <div class="text-body-2 text-medium-emphasis">{{ stat.label }}</div>
                <div class="text-h5 font-weight-bold mt-2">{{ stat.value }}</div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
        <v-card variant="outlined">
          <v-card-title>Compras por producto</v-card-title>
          <v-data-table
            :headers="purchaseHeaders"
            :items="purchaseProducts"
            item-value="productId"
            :items-per-page="10"
          >
            <template #item.quantity="{ value }">{{ formatQuantity(value) }}</template>
            <template #item.totalAmount="{ value }">{{ formatCurrency(value) }}</template>
            <template #no-data>
              <div class="py-6 text-medium-emphasis">No hay compras de productos para este periodo.</div>
            </template>
          </v-data-table>
        </v-card>
      </template>
    </section>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Bar, Line } from 'vue-chartjs'
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
  type ChartData,
  type ChartOptions
} from 'chart.js'
import { priceFormatter } from '@/utills/formatPrice'
import { formatDate, parseDateFilter } from '@/utills/formatDate'
import {
  getProductSalesHistory,
  getProductSalesReport,
  getPurchaseReport,
  getPurchasePeriodReport,
  getSalesPeriodReport,
  getUserSalesReport,
  type ProductSalesHistoryBucket,
  type PurchasePeriodReportBucket,
  type PurchaseReport,
  type PurchaseReportProduct,
  type ProductSalesReportRow,
  type ReportDateFilters,
  type SalesPeriodReportBucket,
  type SalesPeriod,
  type UserSalesReportRow
} from '@/services/reports'

ChartJS.register(BarElement, CategoryScale, LineElement, LinearScale, PointElement, Tooltip)

const monthFormatter = new Intl.DateTimeFormat('es-BO', {
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC'
})
const quantityFormatter = new Intl.NumberFormat('es-BO', { maximumFractionDigits: 0 })

const startDate = ref('')
const endDate = ref('')
const appliedFilters = ref<ReportDateFilters>({})
const products = ref<ProductSalesReportRow[]>([])
const users = ref<UserSalesReportRow[]>([])
const purchaseProducts = ref<PurchaseReportProduct[]>([])
const history = ref<ProductSalesHistoryBucket[]>([])
const selectedProductId = ref<number | null>(null)
const selectedPeriod = ref<SalesPeriod>('month')
const salesChartPeriod = ref<SalesPeriod>('day')
const purchaseChartPeriod = ref<SalesPeriod>('month')
const salesPeriodReport = ref<SalesPeriodReportBucket[]>([])
const purchasePeriodReport = ref<PurchasePeriodReportBucket[]>([])
const reportLoading = ref(false)
const purchaseReportLoading = ref(false)
const salesChartLoading = ref(false)
const purchaseChartLoading = ref(false)
const historyLoading = ref(false)
const reportError = ref('')
const purchaseReportError = ref('')
const salesChartError = ref('')
const purchaseChartError = ref('')
const historyError = ref('')
const reportSummary = ref({
  saleCount: 0,
  quantity: 0,
  subtotal: 0,
  discount: 0,
  total: 0
})
const purchaseSummary = ref<PurchaseReport['summary']>({
  purchaseCount: 0,
  quantity: 0,
  totalAmount: 0
})
let reportRequestId = 0
let purchaseReportRequestId = 0
let salesChartRequestId = 0
let purchaseChartRequestId = 0
let historyRequestId = 0

const periodOptions: { title: string; value: SalesPeriod }[] = [
  { title: 'Día', value: 'day' },
  { title: 'Semana', value: 'week' },
  { title: 'Mes', value: 'month' },
  { title: 'Año', value: 'year' }
]

const productHeaders = [
  { title: 'Producto', key: 'productName' },
  { title: 'Cantidad', key: 'quantity' },
  { title: 'Importe bruto', key: 'grossAmount' },
  { title: 'Descuento asignado', key: 'discount' },
  { title: 'Importe neto', key: 'netAmount' }
]

const purchaseHeaders = [
  { title: 'Producto', key: 'productName' },
  { title: 'Cantidad', key: 'quantity' },
  { title: 'Importe total', key: 'totalAmount' }
]

const historyHeaders = [
  { title: 'Periodo', key: 'period' },
  { title: 'Cantidad', key: 'quantity' },
  { title: 'Importe bruto', key: 'grossAmount' },
  { title: 'Descuento asignado', key: 'discount' },
  { title: 'Importe neto', key: 'netAmount' }
]

const userHeaders = [
  { title: 'Usuario / cajero', key: 'username' },
  { title: 'Cantidad', key: 'quantity' },
  { title: 'Importe bruto', key: 'grossAmount' },
  { title: 'Descuento asignado', key: 'discount' },
  { title: 'Importe neto', key: 'netAmount' }
]

const productRows = computed(() => products.value)
const historyRows = computed(() => history.value)
const userRows = computed(() => {
  const grouped = new Map<string, {
    username: string
    quantity: number
    grossAmount: number
    discount: number
    netAmount: number
  }>()
  for (const row of users.value) {
    const user = grouped.get(row.username) ?? {
      username: row.username,
      quantity: 0,
      grossAmount: 0,
      discount: 0,
      netAmount: 0
    }
    user.quantity += row.quantity
    user.grossAmount += row.grossAmount
    user.discount += row.discount
    user.netAmount += row.netAmount
    grouped.set(row.username, user)
  }
  return [...grouped.values()].sort((a, b) => b.netAmount - a.netAmount)
})

const validationError = computed(() => {
  const parsedStartDate = startDate.value ? parseDateFilter(startDate.value) : null
  const parsedEndDate = endDate.value ? parseDateFilter(endDate.value) : null
  if (startDate.value && !parsedStartDate) return 'La fecha de inicio no es válida.'
  if (endDate.value && !parsedEndDate) return 'La fecha de fin no es válida.'
  if (parsedStartDate && parsedEndDate && parsedStartDate > parsedEndDate) {
    return 'La fecha de inicio no puede ser posterior a la fecha de fin.'
  }
  return ''
})

const summaryCards = computed(() => [
  { label: 'Ventas', value: formatQuantity(reportSummary.value.saleCount) },
  { label: 'Unidades vendidas', value: formatQuantity(reportSummary.value.quantity) },
  { label: 'Subtotal', value: formatCurrency(reportSummary.value.subtotal) },
  { label: 'Descuentos', value: formatCurrency(reportSummary.value.discount) },
  { label: 'Total neto', value: formatCurrency(reportSummary.value.total) }
])

const purchaseSummaryCards = computed(() => [
  { label: 'Compras', value: formatQuantity(purchaseSummary.value.purchaseCount) },
  { label: 'Unidades compradas', value: formatQuantity(purchaseSummary.value.quantity) },
  { label: 'Importe total', value: formatCurrency(purchaseSummary.value.totalAmount) }
])

const salesChartData = computed<ChartData<'bar'>>(() => ({
  labels: salesPeriodReport.value.map(item => formatPeriod(item.period)),
  datasets: [{
    label: 'Total de ventas',
    data: salesPeriodReport.value.map(item => item.total),
    backgroundColor: '#42A5F5'
  }]
}))

const salesTrendChartData = computed<ChartData<'line'>>(() => ({
  labels: salesPeriodReport.value.map(item => formatPeriod(item.period)),
  datasets: [{
    label: 'Total de ventas',
    data: salesPeriodReport.value.map(item => item.total),
    borderColor: '#1976D2',
    backgroundColor: 'rgba(25, 118, 210, 0.15)',
    pointBackgroundColor: '#1976D2',
    pointRadius: 4,
    pointHoverRadius: 6,
    fill: true,
    tension: 0.3
  }]
}))

const purchaseChartData = computed<ChartData<'bar'>>(() => ({
  labels: purchasePeriodReport.value.map(item => formatPeriod(item.period)),
  datasets: [{
    label: 'Importe total de compras',
    data: purchasePeriodReport.value.map(item => item.totalAmount),
    backgroundColor: '#66BB6A'
  }]
}))

const salesChartOptions = computed<ChartOptions<'bar'>>(() => makePeriodChartOptions('Total de ventas'))
const salesTrendChartOptions = computed<ChartOptions<'line'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: item => `Total de ventas: ${formatCurrency(Number(item.raw))}`
      }
    }
  },
  scales: {
    x: { ticks: { autoSkip: false, maxRotation: 45, minRotation: 0 } },
    y: {
      beginAtZero: true,
      ticks: { callback: value => formatCurrency(Number(value)) }
    }
  }
}))
const purchaseChartOptions = computed<ChartOptions<'bar'>>(() =>
  makePeriodChartOptions('Importe total de compras')
)

function formatCurrency(value: number): string {
  return priceFormatter.format(value)
}

function formatQuantity(value: number): string {
  return quantityFormatter.format(value)
}

function formatPeriod(value: string): string {
  if (/^\d{4}$/.test(value)) return value
  if (/^\d{4}-\d{2}$/.test(value)) {
    const date = new Date(`${value}-01T00:00:00.000Z`)
    return Number.isNaN(date.getTime()) ? value : monthFormatter.format(date)
  }
  return formatDate(value)
}

function makePeriodChartOptions(metric: string): ChartOptions<'bar'> {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: item => `${metric}: ${formatCurrency(Number(item.raw))}`
        }
      }
    },
    scales: {
      x: { ticks: { autoSkip: false, maxRotation: 45, minRotation: 0 } },
      y: {
        beginAtZero: true,
        ticks: { callback: value => formatCurrency(Number(value)) }
      }
    }
  }
}

function makeFilters(): ReportDateFilters {
  const parsedStartDate = startDate.value ? parseDateFilter(startDate.value) : null
  const parsedEndDate = endDate.value ? parseDateFilter(endDate.value) : null
  return {
    ...(parsedStartDate ? { startDate: parsedStartDate } : {}),
    ...(parsedEndDate ? { endDate: parsedEndDate } : {})
  }
}

function downloadCsv<T>(
  rows: readonly T[],
  columns: Array<{ title: string; getValue: (row: T) => string | number }>,
  fileName: string
) {
  const escapeCell = (value: string | number): string => {
    let text = String(value)
    if (typeof value === 'string' && /^[\s]*[=+\-@]/.test(value)) {
      text = `'${text}`
    }
    return `"${text.replace(/"/g, '""')}"`
  }
  const csv = [
    columns.map(column => escapeCell(column.title)).join(','),
    ...rows.map(row => columns.map(column => escapeCell(column.getValue(row))).join(','))
  ].join('\r\n')
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${fileName}.csv`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function getReportFileSuffix(): string {
  return appliedFilters.value.startDate || appliedFilters.value.endDate
    ? `${appliedFilters.value.startDate || 'inicio'}_${appliedFilters.value.endDate || 'actualidad'}`
    : 'todo'
}

function downloadProductsCsv() {
  downloadCsv(products.value, [
    { title: 'Producto', getValue: row => row.productName },
    { title: 'Cantidad', getValue: row => row.quantity },
    { title: 'Importe bruto', getValue: row => row.grossAmount },
    { title: 'Descuento asignado', getValue: row => row.discount },
    { title: 'Importe neto', getValue: row => row.netAmount }
  ], `ventas-productos-${getReportFileSuffix()}`)
}

function downloadHistoryCsv() {
  if (selectedProductId.value === null) return
  downloadCsv(history.value, [
    { title: 'Periodo', getValue: row => formatPeriod(row.period) },
    { title: 'Cantidad', getValue: row => row.quantity },
    { title: 'Importe bruto', getValue: row => row.grossAmount },
    { title: 'Descuento asignado', getValue: row => row.discount },
    { title: 'Importe neto', getValue: row => row.netAmount }
  ], `historial-producto-${selectedProductId.value}-${selectedPeriod.value}-${getReportFileSuffix()}`)
}

function downloadUsersCsv() {
  downloadCsv(userRows.value, [
    { title: 'Usuario / cajero', getValue: row => row.username },
    { title: 'Cantidad', getValue: row => row.quantity },
    { title: 'Importe bruto', getValue: row => row.grossAmount },
    { title: 'Descuento asignado', getValue: row => row.discount },
    { title: 'Importe neto', getValue: row => row.netAmount }
  ], `ventas-usuarios-${getReportFileSuffix()}`)
}

async function applyFilters() {
  if (validationError.value) return
  appliedFilters.value = makeFilters()
  await Promise.all([
    fetchReports(appliedFilters.value),
    fetchPurchaseReport(appliedFilters.value),
    fetchSalesChart(appliedFilters.value),
    fetchPurchaseChart(appliedFilters.value)
  ])
}

async function clearFilters() {
  startDate.value = ''
  endDate.value = ''
  appliedFilters.value = {}
  await Promise.all([
    fetchReports({}),
    fetchPurchaseReport({}),
    fetchSalesChart({}),
    fetchPurchaseChart({})
  ])
}

function refreshSalesChart() {
  void fetchSalesChart(appliedFilters.value)
}

function refreshPurchaseChart() {
  void fetchPurchaseChart(appliedFilters.value)
}

async function fetchSalesChart(filters: ReportDateFilters) {
  const requestId = ++salesChartRequestId
  salesChartLoading.value = true
  salesChartError.value = ''

  try {
    const report = await getSalesPeriodReport(salesChartPeriod.value, filters)
    if (requestId !== salesChartRequestId) return
    salesPeriodReport.value = report
  } catch (error) {
    if (requestId !== salesChartRequestId) return
    console.error('Error fetching sales period report:', error)
    salesChartError.value = 'No se pudo cargar el gráfico de ventas. Intenta nuevamente.'
    salesPeriodReport.value = []
  } finally {
    if (requestId === salesChartRequestId) salesChartLoading.value = false
  }
}

async function fetchPurchaseChart(filters: ReportDateFilters) {
  const requestId = ++purchaseChartRequestId
  purchaseChartLoading.value = true
  purchaseChartError.value = ''

  try {
    const report = await getPurchasePeriodReport(purchaseChartPeriod.value, filters)
    if (requestId !== purchaseChartRequestId) return
    purchasePeriodReport.value = report
  } catch (error) {
    if (requestId !== purchaseChartRequestId) return
    console.error('Error fetching purchase period report:', error)
    purchaseChartError.value = 'No se pudo cargar el gráfico de compras. Intenta nuevamente.'
    purchasePeriodReport.value = []
  } finally {
    if (requestId === purchaseChartRequestId) purchaseChartLoading.value = false
  }
}

async function fetchPurchaseReport(filters: ReportDateFilters) {
  const requestId = ++purchaseReportRequestId
  purchaseReportLoading.value = true
  purchaseReportError.value = ''

  try {
    const report = await getPurchaseReport(filters)
    if (requestId !== purchaseReportRequestId) return

    purchaseSummary.value = report.summary
    purchaseProducts.value = report.products
  } catch (error) {
    if (requestId !== purchaseReportRequestId) return
    console.error('Error fetching purchase report:', error)
    purchaseReportError.value = 'No se pudo cargar el reporte de compras. Intenta nuevamente.'
    purchaseSummary.value = { purchaseCount: 0, quantity: 0, totalAmount: 0 }
    purchaseProducts.value = []
  } finally {
    if (requestId === purchaseReportRequestId) purchaseReportLoading.value = false
  }
}

async function fetchReports(filters: ReportDateFilters) {
  const requestId = ++reportRequestId
  reportLoading.value = true
  reportError.value = ''

  try {
    const [productReport, userReport] = await Promise.all([
      getProductSalesReport(filters),
      getUserSalesReport(filters)
    ])
    if (requestId !== reportRequestId) return

    reportSummary.value = productReport.summary
    products.value = productReport.products
    users.value = userReport

    if (!products.value.some(product => product.productId === selectedProductId.value)) {
      selectedProductId.value = products.value[0]?.productId ?? null
    }

    await fetchProductHistory(selectedProductId.value, filters)
  } catch (error) {
    if (requestId !== reportRequestId) return
    console.error('Error fetching sales reports:', error)
    reportError.value = 'No se pudieron cargar los reportes. Intenta nuevamente.'
    historyRequestId++
    historyLoading.value = false
    products.value = []
    users.value = []
    history.value = []
    reportSummary.value = { saleCount: 0, quantity: 0, subtotal: 0, discount: 0, total: 0 }
  } finally {
    if (requestId === reportRequestId) reportLoading.value = false
  }
}

async function fetchProductHistory(productId: number | null, filters: ReportDateFilters) {
  const requestId = ++historyRequestId
  historyError.value = ''

  if (productId === null) {
    history.value = []
    historyLoading.value = false
    return
  }

  historyLoading.value = true
  try {
    history.value = await getProductSalesHistory(productId, selectedPeriod.value, filters)
  } catch (error) {
    if (requestId !== historyRequestId) return
    console.error('Error fetching product sales history:', error)
    history.value = []
    historyError.value = 'No se pudo cargar el historial de este producto.'
  } finally {
    if (requestId === historyRequestId) historyLoading.value = false
  }
}

function refreshProductHistory() {
  void fetchProductHistory(selectedProductId.value, appliedFilters.value)
}

onMounted(() => {
  void fetchReports({})
  void fetchPurchaseReport({})
  void fetchSalesChart({})
  void fetchPurchaseChart({})
})
</script>
