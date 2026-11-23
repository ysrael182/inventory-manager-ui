<template>
  <v-container>
    <div class="d-flex flex-wrap align-center justify-space-between ga-4 mb-6">
      <div>
        <h1 class="text-h4">Dashboard</h1>
        <p class="text-body-2 text-medium-emphasis mt-1">
          Resumen general de ventas e inventario vendido.
        </p>
      </div>
      <v-btn color="primary" prepend-icon="mdi-chart-box-outline" to="/reports">
        Ver reportes detallados
      </v-btn>
    </div>

    <v-alert v-if="summaryError" class="mb-4" type="error" variant="tonal">
      {{ summaryError }}
    </v-alert>

    <div v-if="loading" class="d-flex justify-center py-10" role="status" aria-live="polite">
      <v-progress-circular indeterminate color="primary" aria-label="Cargando resumen" />
    </div>

    <section v-else-if="!summaryError" aria-labelledby="summary-heading">
      <h2 id="summary-heading" class="text-h5 mb-4">Totales generales</h2>
      <v-row>
        <v-col v-for="stat in summaryCards" :key="stat.label" cols="12" sm="6" lg="4">
          <v-card class="summary-card h-100" :color="stat.color" variant="tonal">
            <v-card-text class="d-flex align-center justify-space-between ga-4">
              <div>
                <div class="text-body-1 text-medium-emphasis">{{ stat.label }}</div>
                <div class="text-h4 font-weight-bold mt-2">{{ stat.value }}</div>
              </div>
              <v-avatar :color="stat.color" variant="flat" size="52">
                <v-icon :icon="stat.icon" size="28" />
              </v-avatar>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      <p class="text-body-2 text-medium-emphasis mt-4">
        Los totales incluyen todo el historial. Usa Reportes para filtrar periodos y consultar el detalle.
      </p>
    </section>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { priceFormatter } from '@/utills/formatPrice'
import { getProductSalesReport } from '@/services/reports'

const quantityFormatter = new Intl.NumberFormat('es-BO', { maximumFractionDigits: 0 })

const loading = ref(false)
const summaryError = ref('')
const summary = ref({
  saleCount: 0,
  quantity: 0,
  subtotal: 0,
  discount: 0,
  total: 0
})

const summaryCards = computed(() => [
  { label: 'Ventas', value: formatQuantity(summary.value.saleCount), icon: 'mdi-receipt-text-outline', color: 'primary' },
  { label: 'Unidades vendidas', value: formatQuantity(summary.value.quantity), icon: 'mdi-bookshelf', color: 'info' },
  { label: 'Subtotal', value: formatCurrency(summary.value.subtotal), icon: 'mdi-cash-multiple', color: 'secondary' },
  { label: 'Descuentos', value: formatCurrency(summary.value.discount), icon: 'mdi-tag-outline', color: 'warning' },
  { label: 'Total de ventas', value: formatCurrency(summary.value.total), icon: 'mdi-chart-line', color: 'success' }
])

function formatCurrency(value: number): string {
  return priceFormatter.format(value)
}

function formatQuantity(value: number): string {
  return quantityFormatter.format(value)
}

async function fetchSummary() {
  loading.value = true
  summaryError.value = ''

  try {
    const report = await getProductSalesReport()
    summary.value = report.summary
  } catch (error) {
    summaryError.value = getErrorMessage(error)
  } finally {
    loading.value = false
  }
}

function getErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string') {
    return error.message
  }
  return 'No se pudo cargar el resumen de ventas.'
}

onMounted(() => {
  void fetchSummary()
})
</script>

<style scoped>
.summary-card {
  min-height: 132px;
}
</style>
