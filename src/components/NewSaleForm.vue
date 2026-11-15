<template>
  <v-form ref="form" @submit.prevent="onSubmit">
    <v-autocomplete
      v-model="selectedProduct"
      :items="availableProducts"
      :loading="loadingProducts"
      :disabled="loadingProducts"
      item-title="name"
      item-value="id"
      label="Buscar y agregar producto"
      return-object
      clearable
      @update:model-value="addProduct"
    />

    <v-btn
      type="button"
      color="secondary"
      variant="text"
      prepend-icon="mdi-plus"
      class="mb-4"
      @click="productDialog = true"
    >
      Agregar producto
    </v-btn>

    <v-alert
      v-if="sale.products.length === 0"
      type="info"
      variant="tonal"
      class="mb-4"
    >
      Necesitas agregar al menos un producto
    </v-alert>

    <v-alert
      v-if="!loadingProducts && availableProducts.length === 0"
      type="info"
      variant="tonal"
      class="mb-4"
    >
      No hay productos disponibles para vender.
    </v-alert>

    <v-card v-if="sale.products.length > 0" variant="outlined" class="pa-4 mb-4">
      <div class="text-subtitle-1 mb-2 font-weight-bold">Productos seleccionados</div>

      <v-row
        v-for="(item, index) in sale.products"
        :key="item.id"
        align="center"
        class="mb-2"
      >
        <v-col cols="12" sm="4">
          <div class="text-body-1 font-weight-medium">{{ item.name }}</div>
          <div class="text-caption">
            Unidad: {{ item.unitName }} · Disponible: {{ item.availableQty }}
          </div>
        </v-col>

        <v-col cols="6" sm="3">
          <v-text-field
            v-model.number="item.quantity"
            :label="`Cantidad (${item.unitName})`"
            :max="item.availableQty"
            :rules="[rules.positiveInteger, rules.withinStock(item.availableQty)]"
            type="number"
            min="1"
            step="1"
            density="compact"
            hide-details="auto"
          />
        </v-col>

        <v-col cols="5" sm="3">
          <v-text-field
            v-model.number="item.price"
            label="Precio"
            :rules="[rules.nonNegativeNumber]"
            type="number"
            min="0"
            step="0.01"
            density="compact"
            hide-details="auto"
          />
        </v-col>

        <v-col cols="1" class="text-right">
          <v-btn
            icon="mdi-delete"
            variant="text"
            color="error"
            density="compact"
            aria-label="Quitar producto"
            @click="removeProduct(index)"
          />
        </v-col>
      </v-row>

      <v-divider class="my-3" />
      <div class="text-body-1 text-right">
        Descuento: {{ discountCalculated.toFixed(2) }}
      </div>
      <div class="text-subtitle-1 font-weight-bold text-right">
        Total: {{ totalCalculated.toFixed(2) }}
      </div>
    </v-card>

    <v-textarea
      v-model="sale.note"
      label="Nota de la venta"
      rows="2"
      auto-grow
    />

    <v-card-actions class="mt-4">
      <v-spacer />
      <v-btn text :disabled="saving" @click="emit('cancel')">Cancelar</v-btn>
      <v-btn
        color="primary"
        type="submit"
        :disabled="sale.products.length === 0 || loadingProducts || saving"
        :loading="saving"
      >
        Registrar venta
      </v-btn>
    </v-card-actions>
  </v-form>

  <v-dialog v-model="productDialog" max-width="600">
    <v-card>
      <v-card-title>Agregar producto</v-card-title>
      <v-card-text>
        <NewProductForm
          :key="productFormKey"
          :product="null"
          @create="createProductForSale"
          @cancel="productDialog = false"
        />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { VForm } from 'vuetify/components'
import NewProductForm from '@/components/NewProductForm.vue'
import { createProduct, getProducts, type Product } from '@/services/products.ts'
import { useToastStore } from '@/store/toast.ts'

withDefaults(defineProps<{
  saving?: boolean
}>(), {
  saving: false
})

interface SaleItem {
  id: number
  name: string
  originalPrice: number
  price: number
  quantity: number
  unitName: string
  availableQty: number
}

interface SalePayload {
  products: SaleItem[]
  subtotal: number
  discount: number
  total: number
  note: string
}

const emit = defineEmits<{
  create: [sale: SalePayload]
  cancel: []
}>()

const toast = useToastStore()
const form = ref<VForm | null>(null)
const loadingProducts = ref(false)
const productDialog = ref(false)
const productFormKey = ref(0)
const selectedProduct = ref<Product | null>(null)
const availableProducts = ref<Product[]>([])
const sale = ref({ products: [] as SaleItem[], note: '' })

const rules = {
  positiveInteger: (value: unknown) =>
    (Number.isInteger(Number(value)) && Number(value) > 0) ||
    'Debe ser un entero mayor que cero',
  withinStock: (availableQty: number) => (value: unknown) =>
    Number(value) <= availableQty || `Solo hay ${availableQty} disponibles`,
  nonNegativeNumber: (value: unknown) =>
    (Number.isFinite(Number(value)) && Number(value) >= 0) ||
    'Debe ser un precio igual o mayor que cero'
}

const totalCalculated = computed(() =>
  sale.value.products.reduce((total, item) => total + item.quantity * item.price, 0)
)

const subtotalCalculated = computed(() =>
  sale.value.products.reduce(
    (subtotal, item) => subtotal + item.quantity * item.originalPrice,
    0
  )
)

const discountCalculated = computed(() =>
  Math.max(0, subtotalCalculated.value - totalCalculated.value)
)

async function fetchProducts() {
  loadingProducts.value = true
  try {
    const response = await getProducts()
    availableProducts.value = response.data.filter(product => product.qty > 0)
  } catch (error) {
    console.error('Error fetching products for sale:', error)
    toast.show('Error al cargar los productos', 'error')
  } finally {
    loadingProducts.value = false
  }
}

function addProduct(product: Product | null) {
  if (!product) return

  const existingItem = sale.value.products.find(item => item.id === product.id)
  if (existingItem) {
    if (existingItem.quantity >= existingItem.availableQty) {
      toast.show('No hay más unidades disponibles de este producto', 'info')
    } else {
      existingItem.quantity += 1
    }
  } else {
    sale.value.products.push({
      id: product.id,
      name: product.name,
      originalPrice: product.price,
      price: product.price,
      quantity: 1,
      unitName: product.unit?.abbreviation || product.unit?.name || 'unidad',
      availableQty: product.qty
    })
  }

  selectedProduct.value = null
}

async function createProductForSale(
  productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'unit' | 'attributes' | 'soldItems'>
) {
  try {
    const response = await createProduct(productData)
    const product = response.data
    availableProducts.value.push(product)
    addProduct(product)
    productDialog.value = false
    productFormKey.value += 1
    toast.show('Producto creado y agregado a la venta', 'success')
  } catch (error) {
    console.error('Error creating product for sale:', error)
    toast.show('Error al crear el producto', 'error')
  }
}

function removeProduct(index: number) {
  sale.value.products.splice(index, 1)
}

async function onSubmit() {
  const result = await form.value?.validate()
  if (!result?.valid || sale.value.products.length === 0) return

  const products = sale.value.products.map(item => ({ ...item }))

  emit('create', {
    products,
    subtotal: Number(subtotalCalculated.value.toFixed(2)),
    discount: Number(discountCalculated.value.toFixed(2)),
    total: Number(totalCalculated.value.toFixed(2)),
    note: sale.value.note
  })
}

function resetForm() {
  sale.value = { products: [], note: '' }
  selectedProduct.value = null
  form.value?.resetValidation()
}

defineExpose({ resetForm })

onMounted(fetchProducts)
</script>
