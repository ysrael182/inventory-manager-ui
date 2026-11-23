<template>
  <v-form ref="form" @submit.prevent="onSubmit" style="max-height: 500px; overflow-y: auto">
    <v-text-field
      v-model="sale.saleDate"
      label="Fecha de venta"
      type="date"
      :rules="[rules.required]"
      required
    />

    <v-autocomplete
      v-model="selectedProduct"
      :items="availableProducts"
      :loading="loadingProducts"
      :disabled="loadingProducts"
      item-title="name"
      item-value="id"
      label="Buscar y agregar producto"
      return-object
      clearable
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
      Agregar producto
    </v-btn>

    <v-alert v-if="sale.products.length === 0" type="info" variant="tonal" class="mb-4">
      Necesitas agregar al menos un producto
    </v-alert>

    <v-alert
      v-if="!loadingProducts && availableProducts.length === 0"
      type="info"
      variant="tonal"
      class="mb-4"
    >
      No hay productos disponibles para vender.
    </v-alert>

    <v-card v-if="sale.products.length > 0" variant="outlined" class="pa-4 mb-4">
      <div class="text-subtitle-1 mb-2 font-weight-bold">Productos seleccionados</div>

      <v-row v-for="(item, index) in sale.products" :key="item.id" align="center" class="mb-2">
        <v-col cols="12" sm="4">
          <div class="text-body-1 font-weight-medium">{{ item.name }}</div>
          <div class="text-caption">
            Unidad: {{ item.unitName }} · Disponible: {{ item.availableQty }}
          </div>
        </v-col>

        <v-col cols="6" sm="3">
          <v-text-field
            v-model.number="item.quantity"
            :label="`Cantidad (${item.unitName})`"
            :max="item.availableQty"
            :rules="[rules.positiveInteger, rules.withinStock(item.availableQty)]"
            type="number"
            min="1"
            step="1"
            density="compact"
            hide-details="auto"
          />
        </v-col>

        <v-col cols="5" sm="3" style="display: flex; align-items: center; gap: 8px">
          <v-text-field
            v-model.number="item.price"
            label="Precio"
            :rules="[rules.nonNegativeNumber]"
            type="number"
            min="0"
            step="0.01"
            density="compact"
            hide-details="auto"
            style="width: 100%"
          />
          <v-chip square text>
            <span>precio: {{ (item.quantity * item.price).toFixed(2) }}</span>
          </v-chip>
        </v-col>

        <v-col cols="11">
          <v-alert type="warning" variant="tonal" density="compact" class="pa-2">
            <v-checkbox
              v-model="item.updateQty"
              label="Ajustar inventario"
              density="compact"
              hide-details
              class="inventory-adjustment-checkbox"
            />
            <div class="inventory-adjustment-details font-weight-medium ml-8 mt-1">
              Stock después de guardar:
              <span class="font-weight-bold">
                {{ stockAfterSave(item) ?? 'no disponible' }}
              </span>
            </div>
          </v-alert>
          <v-tooltip top>
            <template #activator>
              <v-icon icon="mdi-information-outline"></v-icon>
            </template>
            <template #default>
              <span style="white-space: nowrap"
                >Marcado: descuenta la cantidad vendida; al editar, solo aplica la diferencia.
                Desmarcado: el inventario no cambia.</span
              >
            </template>
          </v-tooltip>
        </v-col>

        <v-col cols="1" class="text-right">
          <v-btn
            icon="mdi-delete"
            variant="text"
            color="error"
            density="compact"
            aria-label="Quitar producto"
            @click="removeProduct(index)"
          />
        </v-col>
      </v-row>

      <v-divider class="my-3" />
      <div class="text-body-1 text-right">Descuento: {{ discountCalculated.toFixed(2) }}</div>
      <div class="text-subtitle-1 font-weight-bold text-right">
        Total: {{ totalCalculated.toFixed(2) }}
      </div>
    </v-card>

    <v-textarea v-model="sale.note" label="Nota de la venta" rows="2" auto-grow />

    <v-row>
      <v-col cols="12">
        <v-chip :color="'primary'" text>
          <span>venta realizada por: </span>
          <span class="font-weight-bold">
            {{ props.initialSale?.user?.username ?? props.initialSale?.userId }}
          </span>
        </v-chip>
      </v-col>
    </v-row>

    <v-card-actions class="mt-4">
      <v-spacer />
      <v-btn text :disabled="saving" @click="emit('cancel')">Cancelar</v-btn>
      <v-btn
        color="primary"
        type="submit"
        :disabled="sale.products.length === 0 || loadingProducts || saving"
        :loading="saving"
      >
        {{ initialSale ? 'Actualizar venta' : 'Registrar venta' }}
      </v-btn>
    </v-card-actions>
  </v-form>

  <v-dialog v-model="productDialog" max-width="600">
    <v-card>
      <v-card-title>Agregar producto</v-card-title>
      <v-card-text>
        <NewProductForm
          :key="productFormKey"
          :product="null"
          @create="createProductForSale"
          @cancel="productDialog = false"
        />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';
  import type { VForm } from 'vuetify/components';
  import NewProductForm from '@/components/NewProductForm.vue';
  import { createProduct, getProducts, type Product } from '@/services/products.ts';
  import type { Sale } from '@/services/sales.ts';
  import { useToastStore } from '@/store/toast.ts';
  import { getUser } from '@/services/admin-users.ts';

  const props = withDefaults(
    defineProps<{
      saving?: boolean;
      initialSale?: Sale | null;
    }>(),
    {
      saving: false,
      initialSale: null,
    }
  );

  interface SaleItem {
    id: number;
    name: string;
    originalPrice: number;
    price: number;
    quantity: number;
    updateQty: boolean;
    originalQty: number;
    unitName: string;
    availableQty: number;
  }

  interface SalePayload {
    products: Array<Pick<SaleItem, 'id' | 'quantity' | 'price' | 'updateQty'>>;
    subtotal: number;
    discount: number;
    total: number;
    note: string;
    saleDate: string;
  }

  const emit = defineEmits<{
    create: [sale: SalePayload];
    update: [sale: SalePayload];
    cancel: [];
  }>();

  const toast = useToastStore();
  const form = ref<VForm | null>(null);
  const loadingProducts = ref(false);
  const productDialog = ref(false);
  const productFormKey = ref(0);
  const selectedProduct = ref<Product | null>(null);
  const availableProducts = ref<Product[]>([]);
  const sale = ref({
    products: [] as SaleItem[],
    note: '',
    saleDate:
      props.initialSale?.saleDate?.slice(0, 10) ??
      props.initialSale?.createdAt?.slice(0, 10) ??
      getCurrentDate(),
  });

  const rules = {
    required: (value: unknown) => Boolean(value) || 'Este campo es obligatorio',
    positiveInteger: (value: unknown) =>
      (Number.isInteger(Number(value)) && Number(value) > 0) || 'Debe ser un entero mayor que cero',
    withinStock: (availableQty: number) => (value: unknown) =>
      Number(value) <= availableQty || `Solo hay ${availableQty} disponibles`,
    nonNegativeNumber: (value: unknown) =>
      (Number.isFinite(Number(value)) && Number(value) >= 0) ||
      'Debe ser un precio igual o mayor que cero',
  };

  const totalCalculated = computed(() =>
    sale.value.products.reduce((total, item) => total + item.quantity * item.price, 0)
  );

  const subtotalCalculated = computed(() =>
    sale.value.products.reduce((subtotal, item) => subtotal + item.quantity * item.originalPrice, 0)
  );

  const discountCalculated = computed(() =>
    Math.max(0, subtotalCalculated.value - totalCalculated.value)
  );

  async function fetchProducts() {
    loadingProducts.value = true;
    try {
      const response = await getProducts();
      const saleItems = props.initialSale?.items ?? props.initialSale?.soldItems ?? [];
      const existingProductIds = new Set(saleItems.map(item => item.productId));
      availableProducts.value = response.data.filter(
        product => product.qty > 0 || existingProductIds.has(product.id)
      );

      if (props.initialSale) {
        sale.value = {
          note: props.initialSale.note,
          saleDate:
            props.initialSale.saleDate?.slice(0, 10) ??
            props.initialSale.createdAt?.slice(0, 10) ??
            getCurrentDate(),
          products: saleItems.map(item => {
            const product = response.data.find(product => product.id === item.productId);
            return {
              id: item.productId,
              name: product?.name ?? item.product?.name ?? `Producto ${item.productId}`,
              originalPrice: product?.price ?? item.price,
              price: item.price,
              quantity: item.qty,
              updateQty: true,
              originalQty: item.qty,
              unitName: product?.unit?.abbreviation || product?.unit?.name || 'unidad',
              availableQty: (product?.qty ?? 0) + item.qty,
            };
          }),
        };
      }
    } catch (error) {
      console.error('Error fetching products for sale:', error);
      toast.show('Error al cargar los productos', 'error');
    } finally {
      loadingProducts.value = false;
    }
  }

  function addProduct(product: Product | null) {
    if (!product) return;

    const existingItem = sale.value.products.find(item => item.id === product.id);
    if (existingItem) {
      if (existingItem.quantity >= existingItem.availableQty) {
        toast.show('No hay más unidades disponibles de este producto', 'info');
      } else {
        existingItem.quantity += 1;
      }
    } else {
      sale.value.products.push({
        id: product.id,
        name: product.name,
        originalPrice: product.price,
        price: product.price,
        quantity: 1,
        updateQty: true,
        originalQty: 0,
        unitName: product.unit?.abbreviation || product.unit?.name || 'unidad',
        availableQty: product.qty,
      });
    }

    selectedProduct.value = null;
  }

  function stockAfterSave(item: SaleItem): number | null {
    const currentStock = item.availableQty - item.originalQty;
    if (!item.updateQty) return currentStock;

    const quantityChange = Number(item.quantity) - item.originalQty;
    if (!Number.isFinite(quantityChange)) return null;

    return currentStock - quantityChange;
  }

  async function createProductForSale(
    productData: Omit<
      Product,
      'id' | 'createdAt' | 'updatedAt' | 'unit' | 'attributes' | 'soldItems'
    >
  ) {
    try {
      const response = await createProduct(productData);
      const product = response.data;
      availableProducts.value.push(product);
      addProduct(product);
      productDialog.value = false;
      productFormKey.value += 1;
      toast.show('Producto creado y agregado a la venta', 'success');
    } catch (error) {
      console.error('Error creating product for sale:', error);
      toast.show('Error al crear el producto', 'error');
    }
  }

  function removeProduct(index: number) {
    sale.value.products.splice(index, 1);
  }

  async function onSubmit() {
    const result = await form.value?.validate();
    if (!result?.valid || sale.value.products.length === 0) return;

    const products = sale.value.products.map(item => ({
      id: item.id,
      quantity: item.quantity,
      price: item.price,
      updateQty: item.updateQty,
    }));

    const payload = {
      products,
      subtotal: Number(subtotalCalculated.value.toFixed(2)),
      discount: Number(discountCalculated.value.toFixed(2)),
      total: Number(totalCalculated.value.toFixed(2)),
      note: sale.value.note,
      saleDate: new Date(`${sale.value.saleDate}T00:00:00.000Z`).toISOString(),
    };

    if (props.initialSale) {
      emit('update', payload);
    } else {
      emit('create', payload);
    }
  }

  function resetForm() {
    sale.value = { products: [], note: '', saleDate: getCurrentDate() };
    selectedProduct.value = null;
    form.value?.resetValidation();
  }

  function getCurrentDate(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  defineExpose({ resetForm });

  onMounted(fetchProducts);
</script>

<style scoped>
  .inventory-adjustment-checkbox :deep(.v-label) {
    color: rgb(var(--v-theme-on-surface));
    opacity: 1;
  }

  .inventory-adjustment-details {
    font-size: 0.6875rem;
    line-height: 1rem;
  }
</style>
