<template>
  <v-container>
    <div class="page-header table-page-header">
      <div>
        <h1>Compras</h1>
        <p>Revisa los ingresos de inventario y su historial.</p>
      </div>
      <v-btn color="primary" prepend-icon="mdi-plus" to="/purchases/new"> Nueva compra </v-btn>
    </div>
    <v-card class="mb-4" variant="outlined">
      <v-card-title>Filtrar compras por fecha</v-card-title>
      <v-card-text>
        <v-row align="center">
          <v-col cols="12" sm="5" md="4">
            <v-text-field
              v-model="startDate"
              type="date"
              label="Fecha de compra desde"
              hide-details="auto"
            />
          </v-col>
          <v-col cols="12" sm="5" md="4">
            <v-text-field
              v-model="endDate"
              type="date"
              label="Fecha de compra hasta"
              hide-details="auto"
            />
          </v-col>
          <v-col cols="12" sm="2" md="4" class="d-flex flex-wrap ga-2">
            <v-btn
              color="primary"
              :disabled="Boolean(dateFilterError) || loading"
              :loading="loading"
              @click="applyDateFilters"
            >
              Aplicar
            </v-btn>
            <v-btn
              variant="outlined"
              :disabled="loading || (!startDate && !endDate)"
              @click="clearDateFilters"
            >
              Limpiar
            </v-btn>
          </v-col>
        </v-row>
        <v-alert v-if="dateFilterError" class="mt-3" type="warning" variant="tonal">
          {{ dateFilterError }}
        </v-alert>
      </v-card-text>
    </v-card>

    <v-data-table :headers="headers" :items="purchases" class="elevation-2" :loading="loading">
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>Registro de compras</v-toolbar-title>
          <v-spacer />
        </v-toolbar>
      </template>

      <template v-slot:item.products="{ item }">
        <div v-if="item.items.length">
          <div v-for="(purchaseItem, index) in item.items" :key="purchaseItem.id">
            <div>{{ purchaseItem.product?.name ?? `Producto #${purchaseItem.productId}` }}</div>
            <div>{{ purchaseItem.qty }} unidades</div>
            <v-divider v-if="index < item.items.length - 1" class="my-2" />
          </div>
        </div>
        <span v-else>Sin productos</span>
      </template>

      <template v-slot:item.purchaseDate="{ value }">
        {{ formatDate(value) }}
      </template>

      <template v-slot:item.actions="{ item }">
        <v-btn
          icon="mdi-pencil"
          variant="text"
          color="primary"
          aria-label="Editar compra"
          @click="editPurchase(item.id)"
        />
        <v-btn
          icon="mdi-delete"
          variant="text"
          color="error"
          aria-label="Eliminar compra"
          :loading="deletingPurchaseId === item.id"
          @click="deletePurchase(item.id)"
        />
      </template>

      <template v-slot:no-data>
        <v-alert type="info" class="pa-4">No hay compras disponibles</v-alert>
      </template>
    </v-data-table>
  </v-container>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { formatDate, parseDateFilter } from '@/utills/formatDate.ts';
  import {
    deletePurchase as deletePurchaseApi,
    getPurchases,
    type Purchase,
    type PurchaseDateFilters,
  } from '@/services/purchases.ts';
  import { useToastStore } from '@/store/toast.ts';

  const purchases = ref<Purchase[]>([]);
  const loading = ref(false);
  const startDate = ref('');
  const endDate = ref('');
  const deletingPurchaseId = ref<number | null>(null);
  const toast = useToastStore();
  const router = useRouter();

  const headers = [
    { title: 'ID', key: 'id' },
    { title: 'Nota', key: 'note' },
    { title: 'Fecha de compra', key: 'purchaseDate' },
    { title: 'Productos', key: 'products', sortable: false },
    { title: 'Acciones', key: 'actions', sortable: false },
  ];

  const dateFilterError = computed(() => {
    const parsedStartDate = startDate.value ? parseDateFilter(startDate.value) : null;
    const parsedEndDate = endDate.value ? parseDateFilter(endDate.value) : null;
    if (startDate.value && !parsedStartDate) return 'La fecha de inicio no es válida.';
    if (endDate.value && !parsedEndDate) return 'La fecha de fin no es válida.';
    return parsedStartDate && parsedEndDate && parsedStartDate > parsedEndDate
      ? 'La fecha de inicio no puede ser posterior a la fecha de fin.'
      : '';
  });

  async function fetchPurchases(filters?: PurchaseDateFilters) {
    loading.value = true;
    try {
      purchases.value = await getPurchases(filters);
    } catch (error) {
      console.error('Error fetching purchases:', error);
      toast.show('Error al cargar las compras', 'error');
    } finally {
      loading.value = false;
    }
  }

  function applyDateFilters() {
    if (dateFilterError.value) return;

    const parsedStartDate = startDate.value ? parseDateFilter(startDate.value) : null;
    const parsedEndDate = endDate.value ? parseDateFilter(endDate.value) : null;
    const filters: PurchaseDateFilters = {
      ...(parsedStartDate ? { startDate: parsedStartDate } : {}),
      ...(parsedEndDate ? { endDate: parsedEndDate } : {}),
    };
    void fetchPurchases(filters);
  }

  function clearDateFilters() {
    startDate.value = '';
    endDate.value = '';
    void fetchPurchases();
  }

  function editPurchase(id: number) {
    void router.push(`/purchases/${id}/edit`);
  }

  async function deletePurchase(id: number) {
    if (!window.confirm('¿Está seguro de eliminar esta compra?')) return;

    deletingPurchaseId.value = id;
    try {
      await deletePurchaseApi(id);
      purchases.value = purchases.value.filter(purchase => purchase.id !== id);
      toast.show('Compra eliminada correctamente', 'success');
    } catch (error) {
      console.error('Error deleting purchase:', error);
      toast.show('Error al eliminar la compra', 'error');
    } finally {
      deletingPurchaseId.value = null;
    }
  }

  onMounted(fetchPurchases);
</script>
