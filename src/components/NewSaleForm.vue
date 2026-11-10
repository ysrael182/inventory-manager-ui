<template>
  <v-form v-model="valid" @submit.prevent="onSubmit">
    <!-- Buscador de Productos -->
    <v-autocomplete
      v-model="selectedProduct"
      v-search="searchProducts"
      :items="availableProducts"
      item-title="name"
      item-value="id"
      label="Buscar y agregar producto"
      return-object
      clearable
      @update:model-value="addProduct"
    />

    <!-- Lista de productos agregados -->
    <v-card v-if="sale.products.length > 0" variant="outlined" class="pa-4 mb-4">
      <div class="text-subtitle-1 mb-2 font-weight-bold">Productos Seleccionados:</div>
      
      <v-row v-for="(item, index) in sale.products" :key="item.id" align="center" class="mb-2">
        <v-col cols="5">
          <div class="text-body-1 font-weight-medium">{{ item.name }}</div>
        </v-col>
        
        <v-col cols="3">
          <v-text-field
            v-model.number="item.quantity"
            label="Cant."
            type="number"
            min="1"
            density="compact"
            hide-details
          />
        </v-col>
        
        <v-col cols="3">
          <v-text-field
            v-model.number="item.price"
            label="Precio (Bs)"
            type="number"
            min="0"
            step="0.01"
            density="compact"
            hide-details
          />
        </v-col>
        
        <v-col cols="1" class="text-right">
          <v-btn icon="mdi-delete" variant="text" color="error" density="compact" @click="removeProduct(index)" />
        </v-col>
      </v-row>
    </v-card>

    <v-text-field v-model="sale.salesDetails" label="Detalle de venta" />
    
    <!-- Total calculado automáticamente (Sigue siendo editable si lo deseas) -->
    <v-text-field 
      v-model.number="sale.salesPrice" 
      label="Total de venta (Bs)" 
      type="number" 
      required 
    />
    
    <v-text-field v-model="sale.saleDate" label="Fecha de venta" type="date" required />

    <v-card-actions class="mt-4">
      <v-spacer />
      <v-btn text @click="$emit('cancel')">Cancelar</v-btn>
      <v-btn color="primary" type="submit" :disabled="!valid || sale.products.length === 0">Crear</v-btn>
    </v-card-actions>
  </v-form>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'

// Interfaces para tipado estricto
interface Product {
  id: number
  name: string
  price: number
}

interface SaleItem extends Product {
  quantity: number
}

const emit = defineEmits(['create', 'cancel'])

const valid = ref(false)
const selectedProduct = ref<Product | null>(null)

// Lista de ejemplo para el buscador (Reemplazar con tu API o Store)
const availableProducts = ref<Product[]>([
  { id: 1, name: 'Coca Cola 2L', price: 11.00 },
  { id: 2, name: 'Pan Molde Integral', price: 15.50 },
  { id: 3, name: 'Leche Pil 1L', price: 6.50 },
])

const searchProducts = (query: string) => {
  if (!query) return availableProducts.value
  return availableProducts.value.filter(product =>
    product.name.toLowerCase().includes(query.toLowerCase())
  )
}

const sale = ref({
  products: [] as SaleItem[],
  salesDetails: '',
  salesPrice: 0,
  saleDate: ''
})

// Agregar producto a la tabla si no existe
function addProduct(product: Product | null) {
  if (!product) return

  const exists = sale.value.products.find(p => p.id === product.id)
  if (exists) {
    exists.quantity++
  } else {
    sale.value.products.push({
      ...product,
      quantity: 1
    })
  }
  
  // Limpiar el buscador
  selectedProduct.value = null
}

// Remover producto de la lista
function removeProduct(index: number) {
  sale.value.products.splice(index, 1)
}

// Calcular automáticamente el precio total cuando cambian los productos, cantidades o precios individuales
const totalCalculated = computed(() => {
  return sale.value.products.reduce((acc, item) => acc + (item.quantity * item.price), 0)
})

watch(totalCalculated, (newTotal) => {
  sale.value.salesPrice = Number(newTotal.toFixed(2))
})

function onSubmit() {
  if (sale.value.products.length === 0 || !sale.value.salesPrice || !sale.value.saleDate) {
    console.warn('Campos obligatorios faltan')
    return
  }

  const newSale = { ...sale.value }
  
  // Limpiar formulario
  sale.value = {
    products: [],
    salesDetails: '',
    salesPrice: 0,
    saleDate: ''
  }
  valid.value = false
  
  emit('create', newSale)
}
</script>
