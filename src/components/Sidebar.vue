<template>
  <v-navigation-drawer app permanent>
    <v-list nav>
      <template v-if="isAuthenticated">
        <v-list-item
          prepend-icon="mdi-view-dashboard"
          title="Dashboard"
          to="/"
        />
        <v-list-item
          prepend-icon="mdi-cash"
          title="Ventas"
          to="/sales"
        />
        <v-list-item
          prepend-icon="mdi-package-variant"
          title="Productos"
          to="/products"
        />
        <v-list-item
          prepend-icon="mdi-plus-box"
          title="Agregar Producto"
          to="/add-product"
        />
        <v-list-item
          prepend-icon="mdi-chart-bar"
          title="Reportes"
          to="/reports"
        />
      </template>

      <!-- Conditional login/logout -->
      <v-list-item
        v-if="!isAuthenticated"
        prepend-icon="mdi-login"
        title="Login"
        to="/login"
      />
      <v-list-item
        v-else
        prepend-icon="mdi-logout"
        title="Logout"
        @click="logout"
      />
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const isAuthenticated = computed(() => !!localStorage.getItem('token'))

function logout() {
  localStorage.removeItem('token')
  window.location.href = '/login'
}
</script>
