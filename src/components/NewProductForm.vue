<template>
    <v-form v-model="valid" @submit.prevent="onSubmit">
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
        > Crear Producto </v-btn>
    </v-form>
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