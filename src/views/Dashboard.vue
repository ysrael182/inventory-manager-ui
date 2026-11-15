<template>
  <v-container>
    <div class="mb-4">
      <h1 class="text-h4">Resumen de ventas</h1>
      <p class="text-body-2 text-medium-emphasis mt-1">
        Consulta ventas, productos y actividad de cajeros.
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
              :max="endDate || undefined"
              hide-details="auto"
            />
          </v-col>
          <v-col cols="12" sm="5" md="4">
            <v-text-field
              v-model="endDate"
              type="date"
              label="Fecha de fin"
              :min="startDate || undefined"
              hide-details="auto"
            />
          </v-col>
          <v-col cols="12" sm="2" md="4" class="d-flex flex-wrap ga-2">
            <v-btn color="primary" :loading="reportLoading" :disabled="Boolean(validationError)" @click="applyFilters">
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

    <div v-if="reportLoading" class="d-flex justify-center py-10" role="status" aria-live="polite">
      <v-progress-circular indeterminate color="primary" aria-label="Cargando reportes" />
    </div>

    <template v-else-if="!reportError">
      <section aria-labelledby="totals-heading">
        <h2 id="totals-heading" class="text-h5 mb-3">Totales generales</h2>
        <v-row class="mb-3">
          <v-col v-for="stat in summaryCards" :key="stat.label" cols="12" sm="6" md="4" lg="2">
            <v-card height="100%" variant="tonal" color="primary">
              <v-card-text>
                <div class="text-body-2 text-medium-emphasis">{{ stat.label }}</div>
                <div class="text-h5 font-weight-bold mt-2">{{ stat.value }}</div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </section>

      <v-card class="mb-6" variant="outlined">
        <v-card-title class="text-wrap">Ventas por producto</v-card-title>
        <v-card-text>
          <p class="text-body-2 text-medium-emphasis mb-4">
            Los descuentos se guardan por venta y se asignan proporcionalmente a los productos.
            Los valores por producto son descuentos asignados.
          </p>
          <v-row align="center">
            <v-col cols="12" sm="6">
              <v-select
                v-model="productMetric"
                :items="productMetricOptions"
                label="Comparar por"
                hide-details
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-select
                v-model="productChartType"
                :items="productChartTypeOptions"
                label="Tipo de gráfico"
                hide-details
              />
            </v-col>
            <v-col cols="12" class="d-flex justify-sm-end">
              <v-btn
                variant="text"
                :disabled="products.length <= chartLimit"
                @click="showAllProducts = !showAllProducts"
              >
                {{ showAllProducts ? 'Ver top 10' : 'Ver todos' }}
              </v-btn>
            </v-col>
          </v-row>
          <p v-if="!products.length" class="text-body-2 text-medium-emphasis py-6">
            No hay ventas de productos para este periodo.
          </p>
          <template v-else>
            <div class="mt-4" role="img" :aria-label="`Gráfico ${productChartType === 'doughnut' ? 'circular' : 'de barras'} de ventas por producto, comparado por ${selectedProductMetric.title}`">
              <Doughnut
                v-if="productChartType === 'doughnut'"
                :data="productDoughnutData"
                :options="productDoughnutOptions"
              />
              <Bar v-else :data="productChartData" :options="productChartOptions" />
            </div>
            <v-expansion-panels class="mt-4">
              <v-expansion-panel title="Ver datos de productos en una lista">
                <v-expansion-panel-text>
                  <v-list lines="two">
                    <v-list-item
                      v-for="product in sortedProducts"
                      :key="product.productId"
                      :title="product.productName"
                      :subtitle="`Cantidad: ${formatQuantity(product.quantity)} · Bruto: ${formatCurrency(product.grossAmount)} · Descuento asignado: ${formatCurrency(product.discount)} · Neto: ${formatCurrency(product.netAmount)}`"
                    >
                      <template #append>
                        <span class="font-weight-medium">
                          {{ formatMetric(product[productMetric], productMetric) }}
                        </span>
                      </template>
                    </v-list-item>
                  </v-list>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </template>
        </v-card-text>
      </v-card>

      <v-card class="mb-6" variant="outlined">
        <v-card-title class="text-wrap">Ventas del producto en el tiempo</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="5">
              <v-select
                v-model="selectedProductId"
                :items="products"
                item-title="productName"
                item-value="productId"
                label="Producto"
                no-data-text="No hay productos vendidos en este periodo"
                hide-details
                @update:model-value="refreshProductHistory"
              />
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <v-select
                v-model="selectedPeriod"
                :items="periodOptions"
                label="Agrupar por"
                hide-details
                @update:model-value="refreshProductHistory"
              />
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-select
                v-model="historyMetric"
                :items="historyMetricOptions"
                label="Mostrar"
                hide-details
              />
            </v-col>
          </v-row>
          <v-alert v-if="historyError" class="mt-4" type="error" variant="tonal">
            {{ historyError }}
          </v-alert>
          <div v-else-if="historyLoading" class="d-flex justify-center py-8" role="status" aria-live="polite">
            <v-progress-circular indeterminate color="primary" aria-label="Cargando historial del producto" />
          </div>
          <p v-else-if="selectedProductId === null" class="text-body-2 text-medium-emphasis py-6">
            Selecciona un producto con ventas para consultar su historial.
          </p>
          <template v-else-if="history.length">
            <div class="mt-4" role="img" :aria-label="`Gráfico del historial del producto, agrupado por ${selectedPeriodOptions.title}, ${selectedHistoryMetric.title}`">
              <Bar :data="historyChartData" :options="historyChartOptions" />
            </div>
            <v-expansion-panels class="mt-4">
              <v-expansion-panel title="Ver historial en una lista">
                <v-expansion-panel-text>
                  <v-list lines="two">
                    <v-list-item
                      v-for="bucket in history"
                      :key="bucket.period"
                      :title="formatPeriod(bucket.period)"
                      :subtitle="`Cantidad: ${formatQuantity(bucket.quantity)} · Bruto: ${formatCurrency(bucket.grossAmount)} · Descuento asignado: ${formatCurrency(bucket.discount)} · Neto: ${formatCurrency(bucket.netAmount)}`"
                    >
                      <template #append>
                        <span class="font-weight-medium">
                          {{ formatMetric(bucket[historyMetric], historyMetric) }}
                        </span>
                      </template>
                    </v-list-item>
                  </v-list>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </template>
          <p v-else-if="selectedProductId !== null" class="text-body-2 text-medium-emphasis py-6">
            No hay historial disponible para este producto en el periodo seleccionado.
          </p>
        </v-card-text>
      </v-card>

      <v-card variant="outlined">
        <v-card-title class="text-wrap">Ventas por usuario / cajero</v-card-title>
        <v-card-text>
          <p class="text-body-2 text-medium-emphasis mb-4">
            Los totales se calculan sumando las filas de productos devueltas para cada usuario.
          </p>
          <v-row>
            <v-col cols="12" sm="6" md="5">
              <v-select
                v-model="userMetric"
                :items="userMetricOptions"
                label="Comparar por"
                hide-details
              />
            </v-col>
          </v-row>
          <p v-if="!userRows.length" class="text-body-2 text-medium-emphasis py-6">
            No hay ventas por usuario para este periodo.
          </p>
          <template v-else>
            <div class="mt-4" role="img" :aria-label="`Gráfico de ventas por usuario, comparado por ${selectedUserMetric.title}`">
              <Bar :data="userChartData" :options="userChartOptions" />
            </div>
            <v-expansion-panels class="mt-4">
              <v-expansion-panel title="Ver datos de usuarios en una lista">
                <v-expansion-panel-text>
                  <v-list lines="two">
                    <v-list-item
                      v-for="user in sortedUserRows"
                      :key="user.username"
                      :title="user.username"
                      :subtitle="`Cantidad: ${formatQuantity(user.quantity)} · Bruto: ${formatCurrency(user.grossAmount)} · Descuento asignado: ${formatCurrency(user.discount)} · Neto: ${formatCurrency(user.netAmount)}`"
                    >
                      <template #append>
                        <span class="font-weight-medium">
                          {{ formatMetric(user[userMetric], userMetric) }}
                        </span>
                      </template>
                    </v-list-item>
                  </v-list>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </template>
        </v-card-text>
      </v-card>
    </template>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Bar, Doughnut } from 'vue-chartjs'
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
  type ChartData,
  type ChartOptions
} from 'chart.js'
import { priceFormatter } from '@/utills/formatPrice'
import {
  getProductSalesHistory,
  getProductSalesReport,
  getUserSalesReport,
  type ProductSalesHistoryBucket,
  type ProductSalesReportRow,
  type ReportDateFilters,
  type SalesPeriod,
  type UserSalesReportRow
} from '@/services/reports'

ChartJS.register(Title, Tooltip, Legend, ArcElement, BarElement, CategoryScale, LinearScale)

type ProductMetricKey = 'quantity' | 'grossAmount' | 'discount' | 'netAmount'
type UserMetricKey = 'quantity' | 'netAmount'
type ProductChartType = 'bar' | 'doughnut'
type UserSalesTotal = Pick<ProductSalesReportRow, 'quantity' | 'grossAmount' | 'discount' | 'netAmount'> & {
  username: string
}

const quantityFormatter = new Intl.NumberFormat('es-BO', { maximumFractionDigits: 0 })
const dateFormatter = new Intl.DateTimeFormat('es-BO', { timeZone: 'UTC', dateStyle: 'medium' })
const monthFormatter = new Intl.DateTimeFormat('es-BO', { timeZone: 'UTC', month: 'short', year: 'numeric' })

const startDate = ref('')
const endDate = ref('')
const appliedFilters = ref<ReportDateFilters>({})
const products = ref<ProductSalesReportRow[]>([])
const userRows = ref<UserSalesTotal[]>([])
const history = ref<ProductSalesHistoryBucket[]>([])
const selectedProductId = ref<number | null>(null)
const selectedPeriod = ref<SalesPeriod>('month')
const productMetric = ref<ProductMetricKey>('quantity')
const historyMetric = ref<ProductMetricKey>('netAmount')
const userMetric = ref<UserMetricKey>('netAmount')
const productChartType = ref<ProductChartType>('bar')
const showAllProducts = ref(false)
const reportLoading = ref(false)
const historyLoading = ref(false)
const reportError = ref('')
const historyError = ref('')
const reportSummary = ref({
  saleCount: 0,
  quantity: 0,
  subtotal: 0,
  discount: 0,
  total: 0
})
const chartLimit = 10
let reportRequestId = 0
let historyRequestId = 0

const periodOptions: { title: string; value: SalesPeriod }[] = [
  { title: 'Día', value: 'day' },
  { title: 'Semana', value: 'week' },
  { title: 'Mes', value: 'month' },
  { title: 'Año', value: 'year' }
]

const productMetricOptions: { title: string; value: ProductMetricKey }[] = [
  { title: 'Cantidad', value: 'quantity' },
  { title: 'Importe bruto', value: 'grossAmount' },
  { title: 'Descuento asignado', value: 'discount' },
  { title: 'Importe neto', value: 'netAmount' }
]
const historyMetricOptions = productMetricOptions
const userMetricOptions: { title: string; value: UserMetricKey }[] = [
  { title: 'Cantidad', value: 'quantity' },
  { title: 'Importe neto', value: 'netAmount' }
]
const productChartTypeOptions: { title: string; value: ProductChartType }[] = [
  { title: 'Barras', value: 'bar' },
  { title: 'Circular', value: 'doughnut' }
]

const selectedProductMetric = computed(() =>
  productMetricOptions.find(option => option.value === productMetric.value) ?? productMetricOptions[0]
)
const selectedHistoryMetric = computed(() =>
  historyMetricOptions.find(option => option.value === historyMetric.value) ?? historyMetricOptions[0]
)
const selectedUserMetric = computed(() =>
  userMetricOptions.find(option => option.value === userMetric.value) ?? userMetricOptions[0]
)
const selectedPeriodOptions = computed(() =>
  periodOptions.find(option => option.value === selectedPeriod.value) ?? periodOptions[0]
)
const validationError = computed(() => {
  if (startDate.value && !isValidDate(startDate.value)) return 'La fecha de inicio no es válida.'
  if (endDate.value && !isValidDate(endDate.value)) return 'La fecha de fin no es válida.'
  if (startDate.value && endDate.value && startDate.value > endDate.value) {
    return 'La fecha de inicio no puede ser posterior a la fecha de fin.'
  }
  return ''
})
const summaryCards = computed(() => [
  { label: 'Ventas', value: formatQuantity(reportSummary.value.saleCount) },
  { label: 'Unidades vendidas', value: formatQuantity(reportSummary.value.quantity) },
  { label: 'Subtotal', value: formatCurrency(reportSummary.value.subtotal) },
  { label: 'Descuentos', value: formatCurrency(reportSummary.value.discount) },
  { label: 'Total de ventas', value: formatCurrency(reportSummary.value.total) }
])
const sortedProducts = computed(() =>
  [...products.value].sort((a, b) => b[productMetric.value] - a[productMetric.value])
)
const sortedUserRows = computed(() =>
  [...userRows.value].sort((a, b) => b[userMetric.value] - a[userMetric.value])
)
const visibleProducts = computed(() =>
  showAllProducts.value ? sortedProducts.value : sortedProducts.value.slice(0, chartLimit)
)
const productChartData = computed<ChartData<'bar'>>(() => ({
  labels: visibleProducts.value.map(row => shortenLabel(row.productName)),
  datasets: [{
    label: selectedProductMetric.value.title,
    data: visibleProducts.value.map(row => row[productMetric.value]),
    backgroundColor: '#42A5F5'
  }]
}))
const productDoughnutData = computed<ChartData<'doughnut'>>(() => ({
  labels: visibleProducts.value.map(row => shortenLabel(row.productName)),
  datasets: [{
    label: selectedProductMetric.value.title,
    data: visibleProducts.value.map(row => row[productMetric.value]),
    backgroundColor: [
      '#42A5F5', '#66BB6A', '#FFA726', '#AB47BC', '#EF5350',
      '#26A69A', '#5C6BC0', '#FF7043', '#9CCC65', '#78909C'
    ]
  }]
}))
const historyChartData = computed<ChartData<'bar'>>(() => ({
  labels: history.value.map(row => formatPeriod(row.period)),
  datasets: [{
    label: selectedHistoryMetric.value.title,
    data: history.value.map(row => row[historyMetric.value]),
    backgroundColor: '#66BB6A'
  }]
}))
const userChartData = computed<ChartData<'bar'>>(() => ({
  labels: sortedUserRows.value.map(row => shortenLabel(row.username)),
  datasets: [{
    label: selectedUserMetric.value.title,
    data: sortedUserRows.value.map(row => row[userMetric.value]),
    backgroundColor: '#FFA726'
  }]
}))

function makeBarOptions(
  metric: ProductMetricKey | UserMetricKey,
  titleForIndex: (index: number) => string
): ChartOptions<'bar'> {
  const isQuantity = metric === 'quantity'
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: items => items.length ? titleForIndex(items[0].dataIndex) : '',
          label: item => `${selectedMetricTitle(metric)}: ${isQuantity
            ? formatQuantity(Number(item.raw))
            : formatCurrency(Number(item.raw))}`
        }
      }
    },
    scales: {
      x: {
        ticks: { autoSkip: false, maxRotation: 45, minRotation: 0 }
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: value => isQuantity
            ? formatQuantity(Number(value))
            : formatCurrency(Number(value))
        }
      }
    }
  }
}

const productChartOptions = computed(() =>
  makeBarOptions(productMetric.value, index => visibleProducts.value[index]?.productName ?? '')
)
const productDoughnutOptions = computed<ChartOptions<'doughnut'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'bottom',
      labels: {
        generateLabels: chart => {
          const defaultLabels = ChartJS.defaults.plugins.legend.labels.generateLabels(chart)
          return defaultLabels.map(label => ({
            ...label,
            text: shortenLabel(visibleProducts.value[label.index]?.productName ?? label.text)
          }))
        }
      }
    },
    tooltip: {
      callbacks: {
        label: item => {
          const product = visibleProducts.value[item.dataIndex]
          const amount = Number(item.raw)
          return `${product?.productName ?? ''}: ${formatMetric(amount, productMetric.value)}`
        }
      }
    }
  }
}))
const historyChartOptions = computed(() =>
  makeBarOptions(historyMetric.value, index => history.value[index] ? formatPeriod(history.value[index].period) : '')
)
const userChartOptions = computed(() =>
  makeBarOptions(userMetric.value, index => sortedUserRows.value[index]?.username ?? '')
)

function selectedMetricTitle(metric: ProductMetricKey | UserMetricKey): string {
  return [...productMetricOptions, ...userMetricOptions].find(option => option.value === metric)?.title ?? ''
}

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

function formatCurrency(value: number): string {
  return priceFormatter.format(value)
}

function formatQuantity(value: number): string {
  return quantityFormatter.format(value)
}

function formatMetric(value: number, metric: ProductMetricKey | UserMetricKey): string {
  return metric === 'quantity' ? formatQuantity(value) : formatCurrency(value)
}

function shortenLabel(value: string): string {
  return value.length > 24 ? `${value.slice(0, 21)}…` : value
}

function formatPeriod(value: string): string {
  if (/^\d{4}$/.test(value)) return value
  if (/^\d{4}-\d{2}$/.test(value)) {
    const date = new Date(`${value}-01T00:00:00.000Z`)
    return Number.isNaN(date.getTime()) ? value : monthFormatter.format(date)
  }
  const week = value.match(/^(\d{4})-W(\d{2})$/)
  if (week) return `Sem. ${week[2]}, ${week[1]}`
  const dateValue = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? `${value}T00:00:00.000Z`
    : /^\d{4}-\d{2}-\d{2}T/.test(value)
      ? `${value.slice(0, 10)}T00:00:00.000Z`
      : null
  if (!dateValue) return value
  const date = new Date(dateValue)
  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date)
}

function makeFilters(): ReportDateFilters {
  return {
    ...(startDate.value ? { startDate: startDate.value } : {}),
    ...(endDate.value ? { endDate: endDate.value } : {})
  }
}

async function applyFilters() {
  if (validationError.value) return
  appliedFilters.value = makeFilters()
  await fetchReports(appliedFilters.value)
}

async function clearFilters() {
  startDate.value = ''
  endDate.value = ''
  appliedFilters.value = {}
  await fetchReports({})
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

    products.value = productReport.products
    reportSummary.value = productReport.summary
    userRows.value = aggregateUserRows(userReport)
    showAllProducts.value = false
    if (!products.value.some(product => product.productId === selectedProductId.value)) {
      selectedProductId.value = products.value[0]?.productId ?? null
    }
  } catch (error) {
    if (requestId !== reportRequestId) return
    reportError.value = getErrorMessage(error, 'No se pudieron cargar los reportes.')
  } finally {
    if (requestId === reportRequestId) reportLoading.value = false
  }

  if (requestId === reportRequestId && !reportError.value) {
    await refreshProductHistory()
  }
}

function aggregateUserRows(rows: UserSalesReportRow[]): UserSalesTotal[] {
  const totals = new Map<string, UserSalesTotal>()
  for (const row of rows) {
    const total = totals.get(row.username) ?? {
      username: row.username,
      quantity: 0,
      grossAmount: 0,
      discount: 0,
      netAmount: 0
    }
    total.quantity += row.quantity
    total.grossAmount += row.grossAmount
    total.discount += row.discount
    total.netAmount += row.netAmount
    totals.set(row.username, total)
  }
  return [...totals.values()].sort((a, b) => b[userMetric.value] - a[userMetric.value])
}

async function refreshProductHistory() {
  const productId = selectedProductId.value
  const requestId = ++historyRequestId
  historyError.value = ''
  history.value = []

  if (productId === null) {
    historyLoading.value = false
    return
  }

  historyLoading.value = true
  try {
    const result = await getProductSalesHistory(productId, selectedPeriod.value, appliedFilters.value)
    if (requestId === historyRequestId) history.value = result
  } catch (error) {
    if (requestId === historyRequestId) {
      historyError.value = getErrorMessage(error, 'No se pudo cargar el historial del producto.')
    }
  } finally {
    if (requestId === historyRequestId) historyLoading.value = false
  }
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string') {
    return error.message
  }
  return fallback
}

onMounted(() => {
  void fetchReports({})
})
</script>

<style scoped>
.v-card-text > .mt-4[role='img'] {
  height: 320px;
  position: relative;
}
</style>
