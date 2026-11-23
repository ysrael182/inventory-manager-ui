<template>
  <v-container fluid class="login-page pa-0">
    <div class="login-brand-panel">
      <img src="@/assets/library-icon.png" alt="MichiTech" />
      <div>
        <span>MichiTech</span>
        <strong>Control de ventas e inventario</strong>
      </div>
    </div>
    <v-card elevation="0" class="login-card" max-width="430">
      <v-card-text class="pa-7 pa-sm-10">
        <v-avatar color="primary" variant="tonal" size="52" class="mb-5">
          <v-icon icon="mdi-book-open-page-variant-outline" size="28" />
        </v-avatar>
        <h1 class="text-h4 mb-2">Bienvenido</h1>
        <p class="text-body-2 text-medium-emphasis mb-7">
          Ingresa tus datos para administrar el negocio.
        </p>
        <v-form ref="form" v-model="valid" @submit.prevent="onSubmit" class="login-form">
          <v-text-field
            v-model="username"
            label="Usuario"
            :rules="[rules.required, rules.username]"
            prepend-icon="mdi-account"
            variant="outlined"
            density="comfortable"
            class="w-100"
          />

          <v-text-field
            v-model="password"
            label="Contraseña"
            type="password"
            :rules="[rules.required]"
            prepend-icon="mdi-lock"
            variant="outlined"
            density="comfortable"
            class="w-100"
          />

          <v-btn
            type="submit"
            color="primary"
            block
            size="large"
            class="mt-2"
            :disabled="!valid"
            prepend-icon="mdi-login"
          >
            Iniciar sesión
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import type { VForm } from 'vuetify/components';
  import { useToastStore } from '../store/toast';
  import { login } from '@/services/admin-users.ts';

  const form = ref<VForm | null>(null);
  const username = ref('');
  const password = ref('');
  const valid = ref(false);
  const useToast = useToastStore();

  const rules = {
    required: (v: string) => !!v || 'Field is required',
    username: (v: string) =>
      /^[a-zA-Z0-9_]{3,}$/.test(v) ||
      'Username must be at least 3 characters and contain only letters, numbers, or underscores',
  };

  async function onSubmit() {
    const isValid = form.value?.validate();
    if (isValid) {
      try {
        const response = await login(username.value, password.value);
        console.log('Login response:', response);
        if (response.status === 200) {
          localStorage.setItem('token', response.data.token);

          useToast.show('Login successful!', 'success');

          // Redirect to dashboard or another page
          window.location.href = '/';
        } else {
          useToast.show('Login failed. Please check your credentials and try again.', 'error');
        }
      } catch (err) {
        console.error('Login failed:', err);
        useToast.show('Login failed. Please check your credentials and try again.', 'error');
      }
    } else {
      console.log('Form validation failed');
      useToast.show('Login failed. Please check your credentials and try again.', 'error');
    }
  }
</script>

<style scoped>
  .login-page {
    position: relative;
    display: grid;
    min-height: 100vh;
    place-items: center;
    overflow: hidden;
    background:
      radial-gradient(circle at 15% 15%, rgba(255, 255, 255, 0.13), transparent 18rem),
      linear-gradient(135deg, #173765 0%, #24589a 58%, #3479c3 100%);
  }

  .login-page::after {
    position: absolute;
    right: -180px;
    bottom: -240px;
    width: 520px;
    height: 520px;
    border: 90px solid rgba(255, 255, 255, 0.055);
    border-radius: 50%;
    content: '';
  }

  .login-brand-panel {
    position: absolute;
    left: clamp(24px, 7vw, 100px);
    display: flex;
    align-items: center;
    gap: 14px;
    color: #fff;
  }

  .login-brand-panel img {
    width: 64px;
    height: 64px;
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.1);
  }

  .login-brand-panel div {
    display: flex;
    flex-direction: column;
  }

  .login-brand-panel span {
    font-size: 1.25rem;
    font-weight: 800;
  }

  .login-brand-panel strong {
    margin-top: 3px;
    color: rgba(255, 255, 255, 0.72);
    font-size: 0.78rem;
    font-weight: 500;
  }

  .login-card {
    position: relative;
    z-index: 1;
    width: calc(100% - 32px);
    margin-left: min(38vw, 420px);
    border: 1px solid rgba(255, 255, 255, 0.7) !important;
    border-radius: 24px !important;
    box-shadow: 0 24px 70px rgba(12, 38, 77, 0.28) !important;
  }

  @media (max-width: 900px) {
    .login-brand-panel {
      top: 32px;
    }

    .login-card {
      margin: 130px 16px 24px;
    }
  }

  .fill-height {
    min-height: 100vh;
  }
  .login-form input {
    min-width: 300px;
  }
</style>
