<template>
  <v-form v-model="valid" @submit.prevent="onSubmit">
    <v-text-field v-model="form.name" label="nombre" :rules="[rules.required]" outlined dense />

    <v-text-field
      v-model="form.phoneNumber"
      label="telefono"
      :rules="[rules.phone]"
      outlined
      dense
    />

    <v-text-field
      v-model="form.mobilePhoneNumber"
      label="celular"
      :rules="[rules.phone]"
      outlined
      dense
    />

    <v-text-field
      v-model="form.email"
      label="Email"
      type="email"
      :rules="[rules.email]"
      outlined
      dense
    />

    <v-btn type="button" color="secondary" variant="text" class="mt-4 mr-2" @click="onCancel"
      >Cancelar</v-btn
    >
    <v-btn type="submit" color="primary" class="mt-4">
      {{ isEditing ? 'Actualizar Proveedor' : 'Crear Proveedor' }}
    </v-btn>
  </v-form>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue';
  import type { Provider } from '@/services/providers.ts';

  const props = defineProps<{
    provider: Provider | null;
  }>();

  const emit = defineEmits<{
    create: [provider: Omit<Provider, 'id' | 'createdAt' | 'updatedAt'>];
    update: [id: number, provider: Partial<Provider>];
    cancel: [];
  }>();

  const valid = ref(false);

  const form = ref({
    name: '',
    phoneNumber: '',
    mobilePhoneNumber: '',
    email: '',
  });

  const rules = {
    required: (v: string) => !!v || 'Este campo es obligatorio',
    phone: (v: string) => !v || /^\+?[0-9\s()-]{7,20}$/.test(v) || 'Ingrese un teléfono válido',
    email: (v: string) => !v || /.+@.+\..+/.test(v) || 'Ingrese un correo válido',
  };

  const isEditing = ref(false);

  watch(
    () => props.provider,
    newProvider => {
      if (newProvider) {
        isEditing.value = true;
        form.value = {
          name: newProvider.name,
          phoneNumber: newProvider.phoneNumber,
          mobilePhoneNumber: newProvider.mobilePhoneNumber,
          email: newProvider.email,
        };
      } else {
        resetForm();
      }
    },
    { immediate: true, deep: true }
  );

  function resetForm() {
    isEditing.value = false;
    form.value = {
      name: '',
      phoneNumber: '',
      mobilePhoneNumber: '',
      email: '',
    };
    valid.value = false;
  }

  function onSubmit() {
    if (valid.value) {
      if (isEditing.value && props.provider) {
        emit('update', props.provider.id, form.value);
      } else {
        emit('create', form.value);
      }
    }
  }

  function onCancel() {
    resetForm();
    emit('cancel');
  }
</script>
