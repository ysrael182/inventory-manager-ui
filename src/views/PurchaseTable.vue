<template>
  <v-container>
    <v-data-table
      :headers="headers"
      :items="purchases"
      class="elevation-2"
      :loading="loading"
    >
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>📦 Registro de Compras</v-toolbar-title>
          <v-spacer />
          <v-btn color="primary" prepend-icon="mdi-plus" to="/purchases/new">
            Agregar Compra
          </v-btn>
        </v-toolbar>
      </template>

      <template v-slot:item.products="{ item }">
        <span v-if="item.items.length">
          {{ item.items.map(purchaseItem => `Producto #${purchaseItem.productId}: ${purchaseItem.qty} unidades`).join(', ') }}
        </span>
        <span v-else>Sin productos</span>
      </template>

      <template v-slot:no-data>
        <v-alert type="info" class="pa-4">No hay compras disponibles</v-alert>
      </template>
    </v-data-table>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getPurchases, type Purchase } from '@/services/purchases.ts'
import { useToastStore } from '@/store/toast.ts'

const purchases = ref<Purchase[]>([])
const loading = ref(false)
const toast = useToastStore()

const headers = [
  { title: 'ID', key: 'id' },
  { title: 'Nota', key: 'note' },
  { title: 'Fecha de compra', key: 'purchaseDate' },
  { title: 'Productos', key: 'products', sortable: false }
]

async function fetchPurchases() {
  loading.value = true
  try {
    purchases.value = await getPurchases()
  } catch (error) {
    console.error('Error fetching purchases:', error)
    toast.show('Error al cargar las compras', 'error')
  } finally {
    loading.value = false
  }
}

onMounted(fetchPurchases)
</script>
