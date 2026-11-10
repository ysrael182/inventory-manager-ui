<template>
  <v-container>
    <v-data-table
      :headers="headers"
      :items="products"
      class="elevation-2"
      :loading="loading"
    >
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>📦 Lista de productos</v-toolbar-title>
          <v-spacer />
          <v-btn color="primary" prepend-icon="mdi-plus" @click="dialog = true">
            Agregar Producto
          </v-btn>
        </v-toolbar>
      </template>
      <template v-slot:no-data>
        <v-alert type="info" class="pa-4">
          No hay productos disponibles
        </v-alert>
      </template>
    </v-data-table>
    <v-dialog v-model="dialog" max-width="600">
      <v-card>
        <v-card-title>Nuevo Producto</v-card-title>
        <v-card-text>
          <NewProductForm @create="addProduct" @cancel="dialog = false" />
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { priceFormatter } from '@/utills/formatPrice.ts'
  import NewProductForm from '@/components/NewProductForm.vue'
  import { getProducts } from '@/services/products.ts'

  const dialog = ref(false)
  const loading = ref(false)
  const products = ref([])

  const headers = ref([
    { title: 'Nombre', key: 'name' },
    { title: 'Identificador', key: 'id' },
    { title: 'Cantidad', key: 'qty' },
    { title: 'Unidad', key: 'unit' },
    { title: 'Precio', key: 'price' }
  ])

  const fetchProducts = async () => {
    loading.value = true
    try {
      const response = await getProducts()
      // Format price for display
      products.value = response.data.map(product => ({
        ...product,
        price: priceFormatter.format(product.price)
      }))
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      loading.value = false
    }
  }

  const addProduct = (newProduct: any) => {
    // Add the new product to the list with formatted price
    products.value.push({
      ...newProduct,
      price: priceFormatter.format(newProduct.price)
    })
    dialog.value = false
  }

  onMounted(() => {
    fetchProducts()
  })
</script>
