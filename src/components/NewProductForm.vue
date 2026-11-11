<template>
    <v-form v-model="valid" @submit.prevent="onSubmit">
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

        <!-- Proveedores -->
        <v-select
            v-model="form.providers"
            :items="providers"
            item-title="name"
            item-value="id"
            label="Proveedores"
            outlined
            dense
            :loading="loadingProviders"
            multiple
            chips
            placeholder="Seleccionar proveedores (opcional)"
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

        <v-btn
            type="button"
            color="secondary"
            variant="text"
            class="mt-4 mr-2"
            @click="onCancel"
        >Cancelar</v-btn>
        <!-- Submit -->
        <v-btn
            type="submit"
            color="primary"
            class="mt-4"
        > {{ isEditing ? 'Actualizar Producto' : 'Crear Producto' }} </v-btn>
    </v-form>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, defineProps, defineEmits } from 'vue'
import { getUnits, type Unit } from '@/services/units.ts'
import { getProviders, type Provider } from '@/services/providers.ts'
import type { Product } from '@/services/products.ts'

const props = defineProps<{
  product: Product | null
}>()

const emit = defineEmits<{
  create: [product: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'unit' | 'attributes' | 'soldItems'>]
  update: [id: number, product: Partial<Product>]
  cancel: []
}>()

const valid = ref(false)

const form = ref({
  name: '',
  identifier: '',
  price: null as number | null,
  qty: null as number | null,
  unitId: '' as string | number,
  providers: [] as number[],
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

const isEditing = ref(false)

const fetchUnits = async () => {
  loadingUnits.value = true
  try {
    const unitsArray = await getUnits()
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
    const providersArray = await getProviders()
    providers.value = providersArray
  } catch (error) {
    console.error('Error fetching providers:', error)
  } finally {
    loadingProviders.value = false
  }
}

// Watch for product prop changes to populate form
watch(() => props.product, (newProduct) => {
  if (newProduct) {
    isEditing.value = true
    form.value = {
      name: newProduct.name,
      identifier: newProduct.identifier,
      price: newProduct.price,
      qty: newProduct.qty,
      unitId: newProduct.unitId,
      providers: newProduct.providers?.map(p => p.id) || [],
      description: newProduct.description,
      image: null,
      note: newProduct.note ?? ''
    }
  } else {
    resetForm()
  }
}, { immediate: true, deep: true })

function resetForm() {
  isEditing.value = false
  form.value = {
    name: '',
    identifier: '',
    price: null as number | null,
    qty: null as number | null,
    unitId: '' as string | number,
    providers: [] as number[],
    description: '',
    image: null,
    note: ''
  }
  valid.value = false
}

function onSubmit() {
  console.log('=== NewProductForm onSubmit ===')
  console.log('valid.value:', valid.value)
  console.log('form.value:', form.value)
  console.log('isEditing.value:', isEditing.value)
  if (valid.value) {
    if (isEditing.value && props.product) {
      emit('update', props.product.id, form.value)
    } else {
      emit('create', form.value)
    }
  } else {
    console.warn('Formulario inválido')
  }
}

function onCancel() {
  resetForm()
  emit('cancel')
}

onMounted(() => {
  fetchUnits()
  fetchProviders()
})
</script>