<template>
  <v-container>
    <v-card class="mb-4" variant="outlined">
      <v-card-title>Filtrar ventas por fecha</v-card-title>
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
            <v-btn
              color="primary"
              :disabled="Boolean(dateFilterError) || loading"
              :loading="loading"
              @click="applyDateFilters"
            >
              Aplicar
            </v-btn>
            <v-btn
              variant="outlined"
              :disabled="loading || (!startDate && !endDate)"
              @click="clearDateFilters"
            >
              Limpiar
            </v-btn>
          </v-col>
        </v-row>
        <v-alert v-if="dateFilterError" class="mt-3" type="warning" variant="tonal">
          {{ dateFilterError }}
        </v-alert>
      </v-card-text>
    </v-card>

    <v-data-table
      :headers="headers"
      :items="saleRows"
      :loading="loading"
      class="elevation-2"
    >
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>📦 Registro de Ventas</v-toolbar-title>
          <v-spacer />
          <v-btn color="primary" prepend-icon="mdi-plus" to="/sales/new">
            Registrar Nueva Venta
          </v-btn>
        </v-toolbar>
      </template>

      <template v-slot:item.productNames="{ value }">
        <div class="product-list">{{ value }}</div>
      </template>

      <template v-slot:item.saleDate="{ value }">
        {{ formatDate(value) }}
      </template>

      <template v-slot:item.actions="{ item }">
        <v-btn
          icon="mdi-pencil"
          variant="text"
          color="primary"
          aria-label="Editar venta"
          @click="editSale(item)"
        />
        <v-btn
          icon="mdi-delete"
          variant="text"
          color="error"
          aria-label="Eliminar venta"
          :loading="deletingSaleId === item.id"
          @click="deleteSale(item.id)"
        />
      </template>
    </v-data-table>

    <v-dialog v-model="editDialog" max-width="800">
      <v-card>
        <v-card-title>Editar venta</v-card-title>
        <v-card-text>
          <NewSaleForm
            v-if="editingSale"
            :key="editingSale.id"
            :initial-sale="editingSale"
            :saving="savingSale"
            @update="updateSale"
            @cancel="closeEditDialog"
          />
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { priceFormatter } from '@/utills/formatPrice.ts'
import { formatDate, parseDateFilter } from '@/utills/formatDate.ts'
import NewSaleForm from '@/components/NewSaleForm.vue'
import {
  deleteSale as deleteSaleApi,
  getSales,
  updateSale as updateSaleApi,
  type CreateSaleInput,
  type Sale,
  type SalesDateFilters
} from '@/services/sales.ts'
import { useToastStore } from '@/store/toast.ts'

const loading = ref(false)
const startDate = ref('')
const endDate = ref('')
const savingSale = ref(false)
const deletingSaleId = ref<number | null>(null)
const editDialog = ref(false)
const sales = ref<Sale[]>([])
const editingSale = ref<Sale | null>(null)
const toast = useToastStore()

const headers = ref([
  { title: 'Productos vendidos', key: 'productNames' },
  { title: 'Nota de la venta', key: 'note' },
  { title: 'Total de venta', key: 'total' },
  { title: 'Fecha de venta', key: 'saleDate' },
  { title: 'Acciones', key: 'actions', sortable: false }
])

const saleRows = computed(() => sales.value.map(sale => {
  const items = sale.items ?? sale.soldItems ?? []
  return {
    ...sale,
    productNames: items
      .map(item => `${item.product?.name ?? `Producto ${item.productId}`}\ncantidad: ${item.qty}`)
      .join('\n\n'),
    note: sale.note,
    total: priceFormatter.format(sale.total),
    saleDate: sale.saleDate ?? sale.createdAt ?? ''
  }
}))

const dateFilterError = computed(() => {
  const parsedStartDate = startDate.value ? parseDateFilter(startDate.value) : null
  const parsedEndDate = endDate.value ? parseDateFilter(endDate.value) : null
  if (startDate.value && !parsedStartDate) return 'La fecha de inicio no es válida.'
  if (endDate.value && !parsedEndDate) return 'La fecha de fin no es válida.'
  return parsedStartDate && parsedEndDate && parsedStartDate > parsedEndDate
    ? 'La fecha de inicio no puede ser posterior a la fecha de fin.'
    : ''
})

async function fetchSales(filters?: SalesDateFilters) {
  loading.value = true
  try {
    sales.value = await getSales(filters)
  } catch (error) {
    console.error('Error fetching sales:', error)
    toast.show('Error al cargar las ventas', 'error')
  } finally {
    loading.value = false
  }
}

function applyDateFilters() {
  if (dateFilterError.value) return

  const parsedStartDate = startDate.value ? parseDateFilter(startDate.value) : null
  const parsedEndDate = endDate.value ? parseDateFilter(endDate.value) : null
  const filters: SalesDateFilters = {
    ...(parsedStartDate ? { startDate: parsedStartDate } : {}),
    ...(parsedEndDate ? { endDate: parsedEndDate } : {})
  }
  void fetchSales(filters)
}

function clearDateFilters() {
  startDate.value = ''
  endDate.value = ''
  void fetchSales()
}

function editSale(sale: Sale) {
  editingSale.value = sale
  editDialog.value = true
}

function closeEditDialog() {
  editDialog.value = false
  editingSale.value = null
}

async function updateSale(sale: {
  products: Array<{ id: number; quantity: number; price: number; updateQty: boolean }>
  subtotal: number
  discount: number
  total: number
  note: string
  saleDate: string
}) {
  if (!editingSale.value) return

  const updatedSale: CreateSaleInput = {
    userId: editingSale.value.userId,
    subtotal: sale.subtotal,
    discount: sale.discount,
    total: sale.total,
    note: sale.note,
    saleDate: sale.saleDate,
    items: sale.products.map(item => ({
      productId: item.id,
      qty: item.quantity,
      price: item.price,
      updateQty: item.updateQty
    }))
  }

  savingSale.value = true
  try {
    await updateSaleApi(editingSale.value.id, updatedSale)
    toast.show('Venta actualizada correctamente', 'success')
    closeEditDialog()
    await fetchSales()
  } catch (error) {
    console.error('Error updating sale:', error)
    toast.show('Error al actualizar la venta', 'error')
  } finally {
    savingSale.value = false
  }
}

async function deleteSale(id: number) {
  if (!window.confirm('¿Está seguro de eliminar esta venta?')) return

  deletingSaleId.value = id
  try {
    await deleteSaleApi(id)
    sales.value = sales.value.filter(sale => sale.id !== id)
    toast.show('Venta eliminada correctamente', 'success')
  } catch (error) {
    console.error('Error deleting sale:', error)
    toast.show('Error al eliminar la venta', 'error')
  } finally {
    deletingSaleId.value = null
  }
}

onMounted(fetchSales)
</script>

<style scoped>
.product-list {
  white-space: pre-line;
}
</style>
