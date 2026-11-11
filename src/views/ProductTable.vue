<template>
  <v-container>
    <v-data-table
      :headers="headers"
      :items="products"
      class="elevation-2"
      :loading="loading"
    >
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>📦 Lista de productos</v-toolbar-title>
          <v-spacer />
          <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateDialog">
            Agregar Producto
          </v-btn>
          <v-btn color="secondary" prepend-icon="mdi-truck" @click="openProviderDialog" class="ml-2">
            Agregar Proveedor
          </v-btn>
          <v-btn color="accent" prepend-icon="mdi-ruler" @click="openUnitDialog" class="ml-2">
            Agregar Unidad
          </v-btn>
        </v-toolbar>
      </template>
      <template v-slot:no-data>
        <v-alert type="info" class="pa-4">
          No hay productos disponibles
        </v-alert>
      </template>
      <template v-slot:item.unidad="{ item }">
        {{ item.unit?.abbreviation || item.unit?.name || 'N/A' }}
      </template>
      <template v-slot:item.proveedor="{ item }">
        {{ item.providers?.[0]?.name || 'N/A' }}
      </template>
      <template v-slot:item.actions="{ item }">
        <v-btn
          icon
          color="primary"
          @click="editProduct(item)"
          title="Editar producto"
        >
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn
          icon
          color="error"
          @click="deleteProduct(item.id)"
          title="Eliminar producto"
        >
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </template>
    </v-data-table>
    
    <!-- Product Dialog -->
    <v-dialog v-model="dialog" max-width="600">
      <v-card>
        <v-card-title>{{ editingProduct ? 'Editar Producto' : 'Nuevo Producto' }}</v-card-title>
        <v-card-text>
          <NewProductForm 
            :product="editingProduct" 
            @create="addProduct" 
            @update="updateProduct" 
            @cancel="onCancel" 
          />
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Provider Dialog -->
    <v-dialog v-model="providerDialog" max-width="600">
      <v-card>
        <v-card-title>{{ editingProvider ? 'Editar Proveedor' : 'Nuevo Proveedor' }}</v-card-title>
        <v-card-text>
          <NewProviderForm 
            :provider="editingProvider" 
            @create="addProvider" 
            @update="updateProvider" 
            @cancel="onProviderCancel" 
          />
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Unit Dialog -->
    <v-dialog v-model="unitDialog" max-width="600">
      <v-card>
        <v-card-title>{{ editingUnit ? 'Editar Unidad' : 'Nueva Unidad' }}</v-card-title>
        <v-card-text>
          <NewUnitForm 
            :unit="editingUnit" 
            @create="addUnit" 
            @update="updateUnit" 
            @cancel="onUnitCancel" 
          />
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { priceFormatter } from '@/utills/formatPrice.ts'
  import NewProductForm from '@/components/NewProductForm.vue'
  import NewProviderForm from '@/components/NewProviderForm.vue'
  import NewUnitForm from '@/components/NewUnitForm.vue'
  import { 
    getProducts, 
    deleteProduct as deleteProductApi, 
    updateProduct as updateProductApi, 
    createProduct, 
    type Product 
  } from '@/services/products.ts'
  import { 
    getProviders, 
    createProvider, 
    updateProvider as updateProviderApi, 
    deleteProvider as deleteProviderApi,
    type Provider 
  } from '@/services/providers.ts'
  import { 
    getUnits, 
    createUnit, 
    updateUnit as updateUnitApi, 
    deleteUnit as deleteUnitApi,
    type Unit 
  } from '@/services/units.ts'
  import { useToastStore } from '@/store/toast.ts'

  const dialog = ref(false)
  const providerDialog = ref(false)
  const unitDialog = ref(false)
  const loading = ref(false)
  const products = ref<Product[]>([])
  const editingProduct = ref<Product | null>(null)
  const editingProvider = ref<Provider | null>(null)
  const editingUnit = ref<Unit | null>(null)
  const toast = useToastStore()

  const headers = ref([
    { title: 'Nombre', key: 'name' },
    { title: 'Identificador', key: 'identifier' },
    { title: 'Cantidad', key: 'qty' },
    { title: 'Unidad', key: 'unidad', sortable: false },
    { title: 'Precio', key: 'displayPrice' },
    { title: 'Proveedor', key: 'proveedor', sortable: false },
    { title: 'Acciones', key: 'actions', sortable: false }
  ])

  const fetchProducts = async () => {
    loading.value = true
    try {
      const response = await getProducts()
      
      // Handle different response structures
      let productsArray: Product[] = response.data
      if (response.data && Array.isArray(response.data.data)) {
        // Response is { data: [...] }
        productsArray = response.data.data
      } else if (response.data && Array.isArray(response.data.products)) {
        // Response is { products: [...] }
        productsArray = response.data.products
      }
      
      // Format price for display - keep original price for editing
      products.value = productsArray.map(product => ({
        ...product,
        displayPrice: priceFormatter.format(product.price)
      }))
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      loading.value = false
    }
  }

  const addProduct = async (newProduct: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'unit' | 'attributes' | 'soldItems'>) => {
    console.log('=== ProductTable addProduct received ===')
    console.log('newProduct:', newProduct)
    try {
      // Call the backend API to create the product
      const response = await createProduct(newProduct)
      const createdProduct = response.data
      
      // Add the new product to the list with formatted price
      products.value.push({
        ...createdProduct,
        displayPrice: priceFormatter.format(createdProduct.price)
      })
      toast.show('Producto creado correctamente', 'success')
      dialog.value = false
    } catch (error) {
      console.error('Error creating product:', error)
      toast.show('Error al crear el producto', 'error')
    }
  }

  const editProduct = (product: Product) => {
    editingProduct.value = product
    dialog.value = true
  }

  const updateProduct = async (id: number, productData: Partial<Product>) => {
    try {
      await updateProductApi(id, productData)
      // Update the product in the local list
      const index = products.value.findIndex(p => p.id === id)
      if (index !== -1) {
        products.value[index] = {
          ...products.value[index],
          ...productData,
          displayPrice: priceFormatter.format(productData.price ?? products.value[index].price)
        }
      }
      toast.show('Producto actualizado correctamente', 'success')
      dialog.value = false
      editingProduct.value = null
    } catch (error) {
      console.error('Error updating product:', error)
      toast.show('Error al actualizar el producto', 'error')
    }
  }

  const deleteProduct = async (id: string | number) => {
    try {
      await deleteProductApi(id)
      // Remove the product from the local list
      products.value = products.value.filter(product => product.id !== id)
      toast.show('Producto eliminado correctamente', 'success')
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.show('Error al eliminar el producto', 'error')
    }
  }

  const onCancel = () => {
    dialog.value = false
    editingProduct.value = null
  }

  const openCreateDialog = () => {
    editingProduct.value = null
    dialog.value = true
  }

    // Provider dialog handlers
    const openProviderDialog = () => {
      editingProvider.value = null
      providerDialog.value = true
    }

    const onProviderCancel = () => {
      providerDialog.value = false
      editingProvider.value = null
    }

    const addProvider = async (newProvider: Omit<Provider, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        const response = await createProvider(newProvider)
        toast.show('Proveedor creado correctamente', 'success')
        providerDialog.value = false
      } catch (error) {
        console.error('Error creating provider:', error)
        toast.show('Error al crear el proveedor', 'error')
      }
    }

    const updateProvider = async (id: number, providerData: Partial<Provider>) => {
      try {
        await updateProviderApi(id, providerData)
        toast.show('Proveedor actualizado correctamente', 'success')
        providerDialog.value = false
        editingProvider.value = null
      } catch (error) {
        console.error('Error updating provider:', error)
        toast.show('Error al actualizar el proveedor', 'error')
      }
    }

    // Unit dialog handlers
    const openUnitDialog = () => {
      editingUnit.value = null
      unitDialog.value = true
    }

    const onUnitCancel = () => {
      unitDialog.value = false
      editingUnit.value = null
    }

    const addUnit = async (newUnit: Omit<Unit, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        const response = await createUnit(newUnit)
        toast.show('Unidad creada correctamente', 'success')
        unitDialog.value = false
      } catch (error) {
        console.error('Error creating unit:', error)
        toast.show('Error al crear la unidad', 'error')
      }
    }

    const updateUnit = async (id: number, unitData: Partial<Unit>) => {
      try {
        await updateUnitApi(id, unitData)
        toast.show('Unidad actualizada correctamente', 'success')
        unitDialog.value = false
        editingUnit.value = null
      } catch (error) {
        console.error('Error updating unit:', error)
        toast.show('Error al actualizar la unidad', 'error')
      }
    }

    onMounted(() => {
      fetchProducts()
    })
  </script>
