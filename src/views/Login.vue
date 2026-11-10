<template>
  <v-container class="fill-height d-flex align-center justify-center">
    <v-card elevation="8" max-width="600" class="pa-6">
      <v-card-title class="text-h5 text-center">🔐 Login</v-card-title>

      <v-card-text>
        <v-form ref="form" v-model="valid" @submit.prevent="onSubmit" class="login-form">
          <v-text-field
            v-model="username"
            label="Username"
            :rules="[rules.required, rules.username]"
            prepend-icon="mdi-account"
            outlined
            dense
            class="w-100"
          />

          <v-text-field
            v-model="password"
            label="Password"
            type="password"
            :rules="[rules.required]"
            prepend-icon="mdi-lock"
            outlined
            dense
            class="w-100"
          />

          <v-btn
            type="submit"
            color="primary"
            block
            class="mt-4"
            :disabled="!valid"
          >
            Login
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { VForm } from 'vuetify/components'
import { useToastStore } from '../store/toast'
import { login } from '@/services/admin-users.ts'

const form = ref<VForm | null>(null)
const username = ref('')
const password = ref('')
const valid = ref(false)
const useToast = useToastStore()

const rules = {
  required: (v: string) => !!v || 'Field is required',
  username: (v: string) =>
    /^[a-zA-Z0-9_]{3,}$/.test(v) || 
    'Username must be at least 3 characters and contain only letters, numbers, or underscores'
}

async function onSubmit() {
  const isValid = form.value?.validate()
  if (isValid) {
    try {
      const response = await login(username.value, password.value)
      console.log('Login response:', response)
      if (response.status === 200) {
        localStorage.setItem('token', response.data.token)

        useToast.show('Login successful!', 'success')

        // Redirect to dashboard or another page
        window.location.href = '/'
      } else {
        useToast.show('Login failed. Please check your credentials and try again.', 'error')
      }
    } catch (err) {
      console.error('Login failed:', err)
      useToast.show('Login failed. Please check your credentials and try again.', 'error')
    }
  } else {
    console.log('Form validation failed')
    useToast.show('Login failed. Please check your credentials and try again.', 'error' )
  }
}
</script>

<style scoped>
.fill-height {
  min-height: 100vh;
}
.login-form input {
  min-width: 300px;
}
</style>
