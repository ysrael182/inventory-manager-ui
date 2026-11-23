<template>
  <v-app>
    <!-- Top bar -->
    <v-app-bar v-if="!isLoginPage" app class="app-topbar" height="72">
      <v-app-bar-title class="app-brand">
        <img class="app-brand-logo" src="@/assets/library-icon.png" alt="Michi-Tech library logo" />
      </v-app-bar-title>
      <template #append>
        <div class="app-topbar-status">
          <v-icon icon="mdi-store-outline" size="20" />
          <span>usuario logueado: {{ currentUserName }}</span>
        </div>
      </template>
    </v-app-bar>

    <!-- Sidebar -->
    <Sidebar v-if="!isLoginPage" />

    <!-- Main content -->
    <v-main>
      <Toast />
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useRoute } from 'vue-router';
  import { getCurrentUserName } from '@/utills/getCurrentUserName';
  import Toast from '@/components/Toast.vue';
  import Sidebar from '@/components/Sidebar.vue';

  const route = useRoute();
  const isLoginPage = computed(() => route.name === 'Login');
  const currentUserName = computed(() => getCurrentUserName() || 'Invitado');
</script>
