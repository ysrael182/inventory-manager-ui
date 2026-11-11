<template>
  <v-container>
    <v-card class="pa-6" elevation="4" max-width="800">
      <v-card-title class="text-h6">Registrar Compra</v-card-title>

      <v-card-text>
        <v-form ref="formRef" v-model="valid" @submit.prevent="onSubmit">
          <v-text-field
            v-model="form.purchaseDate"
            label="Fecha de compra"
            type="date"
            :rules="[rules.required]"
            required
          />

          <v-textarea
            v-model="form.note"
            label="Nota"
            rows="2"
          />

          <v-select
            v-model="selectedProduct"
            :items="products"
            item-title="name"
            return-object
            label="Producto"
            :loading="loadingProducts"
            :disabled="loadingProducts"
            no-data-text="No hay productos disponibles"
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
            Crear producto
          </v-btn>

          <v-alert v-if="!form.items.length" type="info" class="mb-4">
            Agrega al menos un producto a la compra.
          </v-alert>

          <v-card
            v-for="(item, index) in form.items"
            :key="item.productId"
            variant="outlined"
            class="pa-4 mb-3"
          >
            <v-row align="center">
              <v-col cols="12" sm="4">
                <div class="font-weight-medium">{{ item.name }}</div>
              </v-col>
              <v-col cols="5" sm="3">
                <v-text-field
                  v-model.number="item.qty"
                  label="Cantidad"
                  type="number"
                  min="1"
                  step="1"
                  :rules="[rules.required, rules.positiveInteger]"
                  required
                />
              </v-col>
              <v-col cols="5" sm="3">
                <v-text-field
                  v-model.number="item.price"
                  label="Precio unitario"
                  type="number"
                  min="0"
                  step="0.01"
                  prefix="$"
                  :rules="[rules.required, rules.nonNegativeNumber]"
                  required
                />
              </v-col>
              <v-col cols="2" sm="2" class="text-right">
                <v-btn
                  icon="mdi-delete"
                  variant="text"
                  color="error"
                  aria-label="Quitar producto"
                  @click="removeProduct(index)"
                />
              </v-col>
            </v-row>
          </v-card>

          <v-btn
            type="submit"
            color="primary"
            class="mt-4"
            :loading="submitting"
            :disabled="!form.items.length"
          >
            Registrar Compra
          </v-btn>
          <v-btn class="mt-4 ml-2" variant="text" to="/purchases">
            Cancelar
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>

    <v-dialog v-model="productDialog" max-width="600">
      <v-card>
        <v-card-title>Agregar producto</v-card-title>
        <v-card-text>
          <NewProductForm
            :key="productFormKey"
            :product="null"
            @create="createProductForPurchase"
            @cancel="productDialog = false"
          />
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import NewProductForm from '@/components/NewProductForm.vue'
import { createPurchase } from '@/services/purchases.ts'
import { createProduct, getProducts, type Product } from '@/services/products.ts'
import { useToastStore } from '@/store/toast.ts'

interface PurchaseFormItem {
  productId: number
  name: string
  qty: number
  price: number
}

interface FormValidation {
  validate: () => Promise<{ valid: boolean }>
}

const router = useRouter()
const toast = useToastStore()
const formRef = ref<FormValidation | null>(null)
const valid = ref(false)
const submitting = ref(false)
const productDialog = ref(false)
const productFormKey = ref(0)
const loadingProducts = ref(false)
const products = ref<Product[]>([])
const selectedProduct = ref<Product | null>(null)
const today = new Date()

const form = ref({
  note: '',
  purchaseDate: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`,
  items: [] as PurchaseFormItem[]
})

const rules = {
  required: (value: unknown) =>
    (value !== '' && value !== null && value !== undefined) || 'Este campo es obligatorio',
  positiveInteger: (value: unknown) =>
    (Number.isInteger(Number(value)) && Number(value) > 0) || 'Debe ser un entero mayor que cero',
  nonNegativeNumber: (value: unknown) =>
    (Number.isFinite(Number(value)) && Number(value) >= 0) || 'Debe ser un número igual o mayor que cero'
}

async function fetchProducts() {
  loadingProducts.value = true
  try {
    const response = await getProducts()
    products.value = response.data
  } catch (error) {
    console.error('Error fetching products for purchase:', error)
    toast.show('Error al cargar los productos', 'error')
  } finally {
    loadingProducts.value = false
  }
}

function addProduct(product: Product | null) {
  if (!product) return

  const existingItem = form.value.items.find(item => item.productId === product.id)
  if (existingItem) {
    existingItem.qty += 1
  } else {
    form.value.items.push({
      productId: product.id,
      name: product.name,
      qty: 1,
      price: product.price
    })
  }

  selectedProduct.value = null
}

function removeProduct(index: number) {
  form.value.items.splice(index, 1)
}

async function createProductForPurchase(
  productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'unit' | 'attributes' | 'soldItems'>
) {
  try {
    const response = await createProduct(productData)
    const product = response.data
    products.value.push(product)
    addProduct(product)
    productDialog.value = false
    productFormKey.value += 1
    toast.show('Producto creado y agregado a la compra', 'success')
  } catch (error) {
    console.error('Error creating product for purchase:', error)
    toast.show('Error al crear el producto', 'error')
  }
}

async function onSubmit() {
  const result = await formRef.value?.validate()
  if (!result?.valid || !form.value.items.length) return

  submitting.value = true
  try {
    await createPurchase({
      note: form.value.note,
      purchaseDate: form.value.purchaseDate,
      items: form.value.items.map(({ productId, qty, price }) => ({ productId, qty, price }))
    })
    toast.show('Compra registrada correctamente', 'success')
    await router.push('/purchases')
  } catch (error) {
    console.error('Error creating purchase:', error)
    toast.show('Error al registrar la compra', 'error')
  } finally {
    submitting.value = false
  }
}

onMounted(fetchProducts)
</script>
