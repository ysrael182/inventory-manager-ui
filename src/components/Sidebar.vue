<template>
  <v-navigation-drawer app permanent class="app-sidebar" width="248">
    <div class="sidebar-profile">
      <v-avatar color="primary" size="44">
        <v-icon icon="mdi-account-outline" size="24" />
      </v-avatar>
      <div>
        <strong>Administración</strong>
        <span>Sesión activa</span>
      </div>
    </div>

    <v-list nav class="sidebar-navigation">
      <template v-if="isAuthenticated">
        <div class="sidebar-section-label">Gestión</div>
        <v-list-item prepend-icon="mdi-view-dashboard" title="Dashboard" to="/" />
        <v-list-item prepend-icon="mdi-cash" title="Ventas" to="/sales" />
        <v-list-item prepend-icon="mdi-cart-arrow-down" title="Compras" to="/purchases" />
        <v-list-item prepend-icon="mdi-package-variant" title="Productos" to="/products" />
        <v-list-item prepend-icon="mdi-truck" title="Proveedores" to="/providers" />
        <v-list-item prepend-icon="mdi-ruler" title="Unidades" to="/units" />
        <div class="sidebar-section-label">Análisis</div>
        <v-list-item prepend-icon="mdi-chart-bar" title="Reportes" to="/reports" />
      </template>

      <v-list-item v-if="!isAuthenticated" prepend-icon="mdi-login" title="Login" to="/login" />
    </v-list>

    <div v-if="isAuthenticated" class="sidebar-footer">
      <v-list-item prepend-icon="mdi-logout" title="Cerrar sesión" @click="logout" />
    </div>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
  import { computed } from 'vue';

  const isAuthenticated = computed(() => !!localStorage.getItem('token'));

  function logout() {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
</script>
