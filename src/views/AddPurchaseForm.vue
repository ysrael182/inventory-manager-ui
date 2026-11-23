<template>
  <v-container>
    <div class="page-header table-page-header">
      <div>
        <h1>{{ isEditing ? 'Editar compra' : 'Registrar compra' }}</h1>
        <p>Agrega los productos recibidos y configura el ajuste de stock.</p>
      </div>
    </div>
    <v-card class="pa-6" elevation="4" max-width="800">
      <v-card-title class="text-h6">{{
        isEditing ? 'Editar Compra' : 'Registrar Compra'
      }}</v-card-title>

      <v-card-text>
        <v-form ref="formRef" v-model="valid" @submit.prevent="onSubmit">
          <v-text-field
            v-model="form.purchaseDate"
            label="Fecha de compra"
            type="date"
            :rules="[rules.required]"
            required
          />

          <v-textarea v-model="form.note" label="Nota" rows="2" />

          <v-select
            v-model="selectedProduct"
            :items="products"
            item-title="name"
            return-object
            label="Producto"
            :loading="loadingProducts"
            :disabled="loadingProducts"
            no-data-text="No hay productos disponibles"
            @update:model-value="addProduct"
          />
          <v-btn
            type="button"
            color="secondary"
            variant="text"
            prepend-icon="mdi-plus"
            class="mb-4"
            @click="productDialog = true"
          >
            Crear producto
          </v-btn>

          <v-alert v-if="!form.items.length" type="info" class="mb-4">
            Agrega al menos un producto a la compra.
          </v-alert>

          <v-card
            v-for="(item, index) in form.items"
            :key="item.productId"
            variant="outlined"
            class="pa-4 mb-3"
          >
            <v-row align="center">
              <v-col cols="12" sm="4">
                <div class="font-weight-medium">{{ item.name }}</div>
              </v-col>
              <v-col cols="5" sm="3">
                <v-text-field
                  v-model.number="item.qty"
                  :label="`Cantidad (${unitName(item)})`"
                  type="number"
                  min="1"
                  step="1"
                  :rules="[rules.required, rules.positiveInteger]"
                  required
                />
              </v-col>
              <v-col cols="5" sm="3">
                <v-text-field
                  v-model.number="item.price"
                  label="Precio unitario"
                  type="number"
                  min="0"
                  step="0.01"
                  prefix="$"
                  :rules="[rules.required, rules.nonNegativeNumber]"
                  required
                />
              </v-col>
              <v-col cols="2" sm="2" class="text-right">
                <v-btn
                  icon="mdi-delete"
                  variant="text"
                  color="error"
                  aria-label="Quitar producto"
                  @click="removeProduct(index)"
                />
              </v-col>
            </v-row>
            <v-alert
              type="warning"
              variant="tonal"
              density="compact"
              icon="mdi-information-outline"
              class="pa-2"
            >
              <v-checkbox
                v-model="item.updateQty"
                label="Ajustar el stock actual según la cantidad comprada"
                density="compact"
                hide-details
              />
              <div class="purchase-inventory-details ml-8">
                Marcado: en una compra nueva suma la cantidad al stock; al editar, aplica la
                diferencia. Desmarcado: el stock actual no cambia.
              </div>
              <div class="purchase-inventory-details font-weight-medium ml-8 mt-1">
                Stock estimado después de guardar:
                <span class="font-weight-bold">
                  {{ stockAfterSave(item) ?? 'no disponible' }}
                </span>
              </div>
            </v-alert>
          </v-card>

          <v-btn
            type="submit"
            color="primary"
            class="mt-4"
            :loading="submitting"
            :disabled="!form.items.length"
          >
            {{ isEditing ? 'Guardar Cambios' : 'Registrar Compra' }}
          </v-btn>
          <v-btn class="mt-4 ml-2" variant="text" to="/purchases"> Cancelar </v-btn>
        </v-form>
      </v-card-text>
    </v-card>

    <v-dialog v-model="productDialog" max-width="600">
      <v-card>
        <v-card-title>Agregar producto</v-card-title>
        <v-card-text>
          <NewProductForm
            :key="productFormKey"
            :product="null"
            @create="createProductForPurchase"
            @cancel="productDialog = false"
          />
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import NewProductForm from '@/components/NewProductForm.vue';
  import {
    createPurchase,
    getPurchase,
    updatePurchase,
    type Purchase,
  } from '@/services/purchases.ts';
  import { createProduct, getProducts, type Product } from '@/services/products.ts';
  import { useToastStore } from '@/store/toast.ts';

  interface PurchaseFormItem {
    productId: number;
    name: string;
    unitName: string;
    qty: number;
    price: number;
    updateQty: boolean;
    originalQty: number;
  }

  interface FormValidation {
    validate: () => Promise<{ valid: boolean }>;
  }

  const router = useRouter();
  const route = useRoute();
  const toast = useToastStore();
  const isEditing = computed(() => route.name === 'EditPurchase');
  const formRef = ref<FormValidation | null>(null);
  const valid = ref(false);
  const submitting = ref(false);
  const productDialog = ref(false);
  const productFormKey = ref(0);
  const loadingProducts = ref(false);
  const products = ref<Product[]>([]);
  const selectedProduct = ref<Product | null>(null);
  const today = new Date();

  const form = ref({
    note: '',
    purchaseDate: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`,
    items: [] as PurchaseFormItem[],
  });

  const rules = {
    required: (value: unknown) =>
      (value !== '' && value !== null && value !== undefined) || 'Este campo es obligatorio',
    positiveInteger: (value: unknown) =>
      (Number.isInteger(Number(value)) && Number(value) > 0) || 'Debe ser un entero mayor que cero',
    nonNegativeNumber: (value: unknown) =>
      (Number.isFinite(Number(value)) && Number(value) >= 0) ||
      'Debe ser un número igual o mayor que cero',
  };

  function toDateInputValue(value: string | null): string {
    if (!value) return '';

    const localizedDate = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
    if (localizedDate) {
      const [, day, month, year] = localizedDate;
      return `${year}-${month}-${day}`;
    }

    return value.slice(0, 10);
  }

  async function loadPurchase(id: string | string[] | undefined) {
    const purchaseId = Number(id);
    if (!Number.isInteger(purchaseId) || purchaseId <= 0) {
      toast.show('Compra no válida', 'error');
      await router.push('/purchases');
      return;
    }

    try {
      const purchase: Purchase = await getPurchase(purchaseId);
      form.value.note = purchase.note;
      form.value.purchaseDate = toDateInputValue(purchase.purchaseDate);
      form.value.items = (purchase.items ?? []).map(item => ({
        productId: item.productId,
        name: item.product?.name ?? `Producto #${item.productId}`,
        unitName: item.product?.unit?.abbreviation || item.product?.unit?.name || '',
        qty: item.qty,
        price: item.price,
        updateQty: false,
        originalQty: item.qty,
      }));
    } catch (error) {
      console.error('Error fetching purchase:', error);
      toast.show('Error al cargar la compra', 'error');
      await router.push('/purchases');
    }
  }

  function unitName(item: PurchaseFormItem): string {
    const productUnit = products.value.find(product => product.id === item.productId)?.unit;
    return productUnit?.abbreviation || productUnit?.name || item.unitName || 'unidad';
  }

  async function fetchProducts() {
    loadingProducts.value = true;
    try {
      const response = await getProducts();
      products.value = response.data;
    } catch (error) {
      console.error('Error fetching products for purchase:', error);
      toast.show('Error al cargar los productos', 'error');
    } finally {
      loadingProducts.value = false;
    }
  }

  function addProduct(product: Product | null) {
    if (!product) return;

    const existingItem = form.value.items.find(item => item.productId === product.id);
    if (existingItem) {
      existingItem.qty += 1;
    } else {
      form.value.items.push({
        productId: product.id,
        name: product.name,
        unitName: product.unit?.abbreviation || product.unit?.name || 'unidad',
        qty: 1,
        price: product.price,
        updateQty: false,
        originalQty: 0,
      });
    }

    selectedProduct.value = null;
  }

  function stockAfterSave(item: PurchaseFormItem): number | null {
    const currentStock = products.value.find(product => product.id === item.productId)?.qty;
    if (currentStock === undefined) return null;

    if (!item.updateQty) return currentStock;

    const quantity = Number(item.qty);
    if (!Number.isFinite(quantity)) return null;

    const quantityChange = isEditing.value ? quantity - item.originalQty : quantity;
    return currentStock + quantityChange;
  }

  function removeProduct(index: number) {
    form.value.items.splice(index, 1);
  }

  async function createProductForPurchase(
    productData: Omit<
      Product,
      'id' | 'createdAt' | 'updatedAt' | 'unit' | 'attributes' | 'soldItems'
    >
  ) {
    try {
      const response = await createProduct(productData);
      const product = response.data;
      products.value.push(product);
      addProduct(product);
      productDialog.value = false;
      productFormKey.value += 1;
      toast.show('Producto creado y agregado a la compra', 'success');
    } catch (error) {
      console.error('Error creating product for purchase:', error);
      toast.show('Error al crear el producto', 'error');
    }
  }

  async function onSubmit() {
    const result = await formRef.value?.validate();
    if (!result?.valid || !form.value.items.length) return;

    submitting.value = true;
    try {
      const purchaseData = {
        note: form.value.note,
        purchaseDate: form.value.purchaseDate,
        items: form.value.items.map(({ productId, qty, price, updateQty }) => ({
          productId,
          qty,
          price,
          updateQty,
        })),
      };

      if (isEditing.value) {
        await updatePurchase(Number(route.params.id), purchaseData);
        toast.show('Compra actualizada correctamente', 'success');
      } else {
        await createPurchase(purchaseData);
        toast.show('Compra registrada correctamente', 'success');
      }
      await router.push('/purchases');
    } catch (error) {
      console.error('Error saving purchase:', error);
      toast.show(
        isEditing.value ? 'Error al actualizar la compra' : 'Error al registrar la compra',
        'error'
      );
    } finally {
      submitting.value = false;
    }
  }

  watch(
    () => route.params.id,
    id => {
      if (isEditing.value) void loadPurchase(id);
    },
    { immediate: true }
  );

  onMounted(fetchProducts);
</script>

<style scoped>
  .purchase-inventory-details {
    font-size: 0.6875rem;
    line-height: 1rem;
  }
</style>
