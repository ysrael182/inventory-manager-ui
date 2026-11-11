<template>
  <v-container>
    <v-data-table
      :headers="headers"
      :items="providers"
      class="elevation-2"
      :loading="loading"
    >
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>🚚 Lista de proveedores</v-toolbar-title>
          <v-spacer />
          <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateDialog">
            Agregar Proveedor
          </v-btn>
        </v-toolbar>
      </template>
      <template v-slot:no-data>
        <v-alert type="info" class="pa-4">
          No hay proveedores disponibles
        </v-alert>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-btn
          icon
          color="primary"
          @click="editProvider(item)"
          title="Editar proveedor"
        >
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn
          icon
          color="error"
          @click="deleteProvider(item.id)"
          title="Eliminar proveedor"
        >
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </template>
    </v-data-table>
    <v-dialog v-model="dialog" max-width="600">
      <v-card>
        <v-card-title>{{ editingProvider ? 'Editar Proveedor' : 'Nuevo Proveedor' }}</v-card-title>
        <v-card-text>
          <NewProviderForm 
            :provider="editingProvider" 
            @create="addProvider" 
            @update="updateProvider" 
            @cancel="onCancel" 
          />
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import NewProviderForm from '@/components/NewProviderForm.vue'
import { getProviders, deleteProvider as deleteProviderApi, updateProvider as updateProviderApi, createProvider, type Provider } from '@/services/providers.ts'
import { useToastStore } from '@/store/toast.ts'

const dialog = ref(false)
const loading = ref(false)
const providers = ref<Provider[]>([])
const editingProvider = ref<Provider | null>(null)
const toast = useToastStore()

const headers = ref([
  { title: 'Nombre', key: 'name' },
  { title: 'Contacto', key: 'contact' },
  { title: 'Acciones', key: 'actions', sortable: false }
])

const fetchProviders = async () => {
  loading.value = true
  try {
    const response = await getProviders()
    providers.value = response
  } catch (error) {
    console.error('Error fetching providers:', error)
  } finally {
    loading.value = false
  }
}

const addProvider = async (newProvider: Omit<Provider, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const response = await createProvider(newProvider)
    providers.value.push(response)
    toast.show('Proveedor creado correctamente', 'success')
    dialog.value = false
  } catch (error) {
    console.error('Error creating provider:', error)
    toast.show('Error al crear el proveedor', 'error')
  }
}

const editProvider = (provider: Provider) => {
  editingProvider.value = provider
  dialog.value = true
}

const updateProvider = async (id: number, providerData: Partial<Provider>) => {
  try {
    await updateProviderApi(id, providerData)
    const index = providers.value.findIndex(p => p.id === id)
    if (index !== -1) {
      providers.value[index] = {
        ...providers.value[index],
        ...providerData
      }
    }
    toast.show('Proveedor actualizado correctamente', 'success')
    dialog.value = false
    editingProvider.value = null
  } catch (error) {
    console.error('Error updating provider:', error)
    toast.show('Error al actualizar el proveedor', 'error')
  }
}

const deleteProvider = async (id: number) => {
  try {
    await deleteProviderApi(id)
    providers.value = providers.value.filter(provider => provider.id !== id)
    toast.show('Proveedor eliminado correctamente', 'success')
  } catch (error) {
    console.error('Error deleting provider:', error)
    toast.show('Error al eliminar el proveedor', 'error')
  }
}

const onCancel = () => {
  dialog.value = false
  editingProvider.value = null
}

const openCreateDialog = () => {
  editingProvider.value = null
  dialog.value = true
}

onMounted(() => {
  fetchProviders()
})
</script>