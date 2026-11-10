<template>
  <v-container>
    <v-card class="pa-6" elevation="4" max-width="600">
      <v-card-title class="text-h6">🛒 Crear Producto</v-card-title>

      <v-card-text>
        <v-form v-model="valid" @submit.prevent="onSubmit">
          <!-- Nombre -->
          <v-text-field
            v-model="form.name"
            label="Nombre"
            :rules="[rules.required]"
            outlined
            dense
          />

          <!-- Cantidad -->
          <v-text-field
            v-model="form.qty"
            label="Cantidad"
            type="number"
            :rules="[rules.required]"
            outlined
            dense
          />

          <!-- Tipo de unidad -->
          <v-select
            v-model="form.unit"
            :items="units"
            label="Tipo de unidad"
            :rules="[rules.required]"
            outlined
            dense
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
          >
            Crear Producto
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const valid = ref(false)

const form = ref({
  name: '',
  qty: null,
  unit: '',
  description: '',
  image: null,
  note: ''
})

const units = ['Piezas', 'Metros', 'Litros', 'Cajas']

const rules = {
  required: (v: any) => !!v || 'Este campo es obligatorio'
}

function onSubmit() {
  if (valid.value) {
    console.log('Nuevo producto:', form.value)
    // Aquí puedes enviar los datos al backend con Axios/Fetch
  } else {
    console.warn('Formulario inválido')
  }
}
</script>
