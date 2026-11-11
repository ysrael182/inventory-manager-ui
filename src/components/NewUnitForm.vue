<template>
    <v-form v-model="valid" @submit.prevent="onSubmit">
        <v-text-field
            v-model="form.name"
            label="Nombre"
            :rules="[rules.required]"
            outlined
            dense
        />

        <v-text-field
            v-model="form.abbreviation"
            label="Abreviación"
            :rules="[rules.required]"
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
        <v-btn
            type="submit"
            color="primary"
            class="mt-4"
        > {{ isEditing ? 'Actualizar Unidad' : 'Crear Unidad' }} </v-btn>
    </v-form>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits } from 'vue'
import type { Unit } from '@/services/units.ts'

const props = defineProps<{
  unit: Unit | null
}>()

const emit = defineEmits<{
  create: [unit: Omit<Unit, 'id' | 'createdAt' | 'updatedAt'>]
  update: [id: number, unit: Partial<Unit>]
  cancel: []
}>()

const valid = ref(false)

const form = ref({
  name: '',
  abbreviation: ''
})

const rules = {
  required: (v: any) => !!v || 'Este campo es obligatorio'
}

const isEditing = ref(false)

watch(() => props.unit, (newUnit) => {
  if (newUnit) {
    isEditing.value = true
    form.value = {
      name: newUnit.name,
      abbreviation: newUnit.abbreviation
    }
  } else {
    resetForm()
  }
}, { immediate: true, deep: true })

function resetForm() {
  isEditing.value = false
  form.value = {
    name: '',
    abbreviation: ''
  }
  valid.value = false
}

function onSubmit() {
  if (valid.value) {
    if (isEditing.value && props.unit) {
      emit('update', props.unit.id, form.value)
    } else {
      emit('create', form.value)
    }
  }
}

function onCancel() {
  resetForm()
  emit('cancel')
}
</script>