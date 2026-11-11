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
            v-model="form.contact"
            label="Contacto"
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
        > {{ isEditing ? 'Actualizar Proveedor' : 'Crear Proveedor' }} </v-btn>
    </v-form>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits } from 'vue'
import type { Provider } from '@/services/providers.ts'

const props = defineProps<{
  provider: Provider | null
}>()

const emit = defineEmits<{
  create: [provider: Omit<Provider, 'id' | 'createdAt' | 'updatedAt'>]
  update: [id: number, provider: Partial<Provider>]
  cancel: []
}>()

const valid = ref(false)

const form = ref({
  name: '',
  contact: ''
})

const rules = {
  required: (v: any) => !!v || 'Este campo es obligatorio'
}

const isEditing = ref(false)

watch(() => props.provider, (newProvider) => {
  if (newProvider) {
    isEditing.value = true
    form.value = {
      name: newProvider.name,
      contact: newProvider.contact
    }
  } else {
    resetForm()
  }
}, { immediate: true, deep: true })

function resetForm() {
  isEditing.value = false
  form.value = {
    name: '',
    contact: ''
  }
  valid.value = false
}

function onSubmit() {
  if (valid.value) {
    if (isEditing.value && props.provider) {
      emit('update', props.provider.id, form.value)
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