<template>
  <v-app>
    <!-- Top bar -->
    <v-app-bar app>
      <v-app-bar-title>MichiTech Registro de Ventas</v-app-bar-title>
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