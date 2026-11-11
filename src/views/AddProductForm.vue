<template>
  <v-container>
    <v-card class="pa-6" elevation="4" max-width="600">
      <v-card-title class="text-h6">🛒 Crear Producto</v-card-title>

      <v-card-text>
        <v-form ref="formRef" v-model="valid">
          <!-- Nombre -->
          <v-text-field
            v-model="form.name"
            label="Nombre"
            :rules="[rules.required]"
            outlined
            dense
          />

          <!-- Identificador -->
          <v-text-field
            v-model="form.identifier"
            label="Identificador (SKU)"
            :rules="[rules.required]"
            outlined
            dense
          />

          <!-- Precio -->
          <v-text-field
            v-model="form.price"
            label="Precio"
            type="number"
            :rules="[rules.required, rules.positiveNumber]"
            outlined
            dense
            prefix="$"
          />

          <!-- Cantidad -->
          <v-text-field
            v-model="form.qty"
            label="Cantidad"
            type="number"
            :rules="[rules.required, rules.positiveNumber]"
            outlined
            dense
          />

          <!-- Tipo de unidad -->
          <v-select
            v-model="form.unitId"
            :items="units"
            item-title="name"
            item-value="id"
            label="Tipo de unidad"
            :rules="[rules.required]"
            outlined
            dense
            :loading="loadingUnits"
            no-data-text="Sin unidades"
          />

          <!-- Proveedor -->
          <v-select
            v-model="form.providers"
            :items="providers"
            item-title="name"
            item-value="id"
            label="Proveedor"
            outlined
            dense
            :loading="loadingProviders"
            multiple
            chips
            placeholder="Seleccionar proveedores (opcional)"
          />

          <!-- Descripción -->
          <v-textarea
            v-model="form.description"
            label="Descripción"
            outlined
            dense
          />

          <!-- Imagen -->
          <v-file-input
            v-model="form.image"
            label="Imagen"
            accept="image/*"
            outlined
            dense
          />

          <!-- Nota de la compra -->
          <v-textarea
            v-model="form.note"
            label="Nota de la compra"
            outlined
            dense
          />

          <!-- Submit -->
          <v-btn
            type="submit"
            color="primary"
            class="mt-4"
            :loading="submitting"
            @click="onSubmit"
          >
            Crear Producto
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getUnits, type Unit } from '@/services/units.ts'
import { getProviders, type Provider } from '@/services/providers.ts'
import { createProduct, type Product, type Provider as ProductProvider } from '@/services/products.ts'
import { useToastStore } from '@/store/toast.ts'

const router = useRouter()
const toast = useToastStore()

const valid = ref(false)
const submitting = ref(false)
const formRef = ref<any>(null)

const form = ref({
  name: '',
  identifier: '',
  price: null as number | null,
  qty: null as number | null,
  unitId: '' as string | number,
  providers: [] as ProductProvider[],
  description: '',
  image: null,
  note: ''
})

const units = ref<Unit[]>([])
const loadingUnits = ref(false)
const providers = ref<Provider[]>([])
const loadingProviders = ref(false)

const rules = {
  required: (v: any) => !!v || 'Este campo es obligatorio',
  positiveNumber: (v: any) => {
    const num = Number(v)
    return !v || (num > 0 && !isNaN(num)) || 'Debe ser un número positivo'
  }
}

const fetchUnits = async () => {
  loadingUnits.value = true
  try {
    const response = await getUnits()
    // Handle different response structures
    let unitsArray = response.data
    if (response.data && Array.isArray(response.data.data)) {
      unitsArray = response.data.data
    } else if (response.data && Array.isArray(response.data.units)) {
      unitsArray = response.data.units
    }
    units.value = unitsArray
  } catch (error) {
    console.error('Error fetching units:', error)
  } finally {
    loadingUnits.value = false
  }
}

const fetchProviders = async () => {
  loadingProviders.value = true
  try {
    const response = await getProviders()
    // Handle different response structures
    let providersArray = response.data
    if (response.data && Array.isArray(response.data.data)) {
      providersArray = response.data.data
    } else if (response.data && Array.isArray(response.data.providers)) {
      providersArray = response.data.providers
    }
    providers.value = providersArray
  } catch (error) {
    console.error('Error fetching providers:', error)
  } finally {
    loadingProviders.value = false
  }
}

async function onSubmit() {
  console.log('=== BUTTON CLICKED - onSubmit CALLED ===')
  console.log('formRef.value:', formRef.value)
  console.log('valid.value:', valid.value)
  // Manually validate the form
  const isValid = await formRef.value?.validate()
  console.log('Form validation result:', isValid)
  if (!isValid) {
    console.warn('Formulario inválido')
    return
  }

  console.log('Form data:', form.value)
  submitting.value = true
  try {
    // Prepare data for API (omit fields not needed for creation)
    const productData = {
      name: form.value.name,
      identifier: form.value.identifier,
      price: form.value.price,
      qty: form.value.qty,
      unitId: Number(form.value.unitId),
      providers: form.value.providers.map(p => ({ id: p.id, name: p.name })),
      description: form.value.description,
      note: form.value.note
    }

    console.log('Sending to API:', productData)
    const response = await createProduct(productData)
    console.log('API response:', response)
    
    toast.show('Producto creado correctamente', 'success')
    router.push('/products')
  } catch (error) {
    console.error('Error creating product:', error)
    toast.show('Error al crear el producto', 'error')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchUnits()
  fetchProviders()
  // Debug: check form ref after mount
  setTimeout(() => {
    console.log('Form ref after mount:', formRef.value)
    console.log('Form ref type:', typeof formRef.value)
    if (formRef.value) {
      console.log('Form ref keys:', Object.keys(formRef.value))
      console.log('Has validate:', typeof formRef.value.validate)
    }
  }, 100)
})
</script>
