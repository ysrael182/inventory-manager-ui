<template>
  <v-container>
    <v-data-table
      :headers="headers"
      :items="products"
      class="elevation-2"
    >
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>📦 Registro de Ventas</v-toolbar-title>
          <v-spacer />
          <v-btn color="primary" prepend-icon="mdi-plus" @click="dialog = true">
            Registrar Nueva Venta
          </v-btn>
        </v-toolbar>
      </template>

      <template v-slot:item.actions="{ item }">
        <v-btn
            variant="text"
            color="primary"
            size="small"
            prepend-icon="mdi-pencil"
            @click="editItem(item)"
        >
            Editar
        </v-btn>

        <v-btn
            variant="text"
            color="error"
            size="small"
            prepend-icon="mdi-delete"
            @click="deleteItem(item)"
        >
            Eliminar
        </v-btn>
      </template>

    </v-data-table>
    <v-dialog v-model="dialog" max-width="600">
      <v-card>
        <v-card-title>Nueva Venta</v-card-title>
        <v-card-text>
          <NewSaleForm @create="addSale" @cancel="dialog = false" />
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { priceFormatter } from '@/utills/formatPrice.ts'
import NewSaleForm from '@/components/NewSaleForm.vue'

const dialog = ref(false)

const headers = ref([
  { title: 'Productos vendidos', key: 'productNames' },
  { title: 'Detalle de venta', key: 'salesDetails' },
  { title: 'Total de venta', key: 'salesPrice' },
  { title: 'Fecha de venta', key: 'saleDate' },
  { title: 'Acciones', key: 'actions', sortable: false } // 👈 new column
])

const products = ref([
  { productNames: 'Laptop 1 unidades, \n Mouse: 2 unidades', salesDetails: 'El cliente no pago', salesPrice: priceFormatter.format(12000), saleDate: '2023-01-15' },
  { productNames: 'Mouse', salesDetails: '', salesPrice: priceFormatter.format(1000), saleDate: '2023-01-16' },
  { productNames: 'Keyboard', salesDetails: '', salesPrice: priceFormatter.format(1350), saleDate: '2023-01-17' },
  { productNames: 'Monitor', salesDetails: '', salesPrice: priceFormatter.format(3000), saleDate: '2023-01-18' },
  { productNames: 'Cinta', salesDetails: '', salesPrice: priceFormatter.format(750), saleDate: '2023-01-19' }  
])

function addSale(sale: any) {
  products.value.push({
    productNames: sale.productNames,
    salesDetails: sale.salesDetails,
    salesPrice: priceFormatter.format(Number(sale.salesPrice)),
    saleDate: sale.saleDate
  })
  dialog.value = false
}

function editItem(item: any) {
  console.log('Editing:', item)
  // You can open a dialog or navigate to an edit form here
}

function deleteItem(item: any) {
  console.log('Deleting:', item)
  // You can remove the item from products.value here
  products.value = products.value.filter(p => p !== item)
}
</script>
