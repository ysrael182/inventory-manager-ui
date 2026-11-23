<template>
  <v-app>
    <!-- Top bar -->
    <v-app-bar app class="app-topbar" height="80">
      <v-app-bar-title class="app-brand">
        <img
          class="app-brand-logo"
          src="@/assets/library-icon.png"
          alt="Michi-Tech library logo"
        />
        MichiTech Registro de Ventas
      </v-app-bar-title>
    </v-app-bar>

    <!-- Sidebar -->
    <Sidebar />

    <!-- Main content -->
    <v-main>
       <Toast />
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import Toast from '@/components/Toast.vue'
import Sidebar from '@/components/Sidebar.vue'
</script>