<template>
  <v-container>
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
    </v-data-table>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { priceFormatter } from '@/utills/formatPrice.ts'
import { getSales, type Sale } from '@/services/sales.ts'
import { useToastStore } from '@/store/toast.ts'

const loading = ref(false)
const sales = ref<Sale[]>([])
const toast = useToastStore()

const headers = ref([
  { title: 'Productos vendidos', key: 'productNames' },
  { title: 'Nota de la venta', key: 'note' },
  { title: 'Total de venta', key: 'total' },
  { title: 'Fecha de venta', key: 'saleDate' }
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

async function fetchSales() {
  loading.value = true
  try {
    sales.value = await getSales()
  } catch (error) {
    console.error('Error fetching sales:', error)
    toast.show('Error al cargar las ventas', 'error')
  } finally {
    loading.value = false
  }
}

onMounted(fetchSales)
</script>

<style scoped>
.product-list {
  white-space: pre-line;
}
</style>
