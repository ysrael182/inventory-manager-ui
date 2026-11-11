<template>
  <v-container>
    <v-data-table
      :headers="headers"
      :items="units"
      class="elevation-2"
      :loading="loading"
    >
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>📏 Lista de unidades</v-toolbar-title>
          <v-spacer />
          <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateDialog">
            Agregar Unidad
          </v-btn>
        </v-toolbar>
      </template>
      <template v-slot:no-data>
        <v-alert type="info" class="pa-4">
          No hay unidades disponibles
        </v-alert>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-btn
          icon
          color="primary"
          @click="editUnit(item)"
          title="Editar unidad"
        >
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn
          icon
          color="error"
          @click="deleteUnit(item.id)"
          title="Eliminar unidad"
        >
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </template>
    </v-data-table>
    <v-dialog v-model="dialog" max-width="600">
      <v-card>
        <v-card-title>{{ editingUnit ? 'Editar Unidad' : 'Nueva Unidad' }}</v-card-title>
        <v-card-text>
          <NewUnitForm 
            :unit="editingUnit" 
            @create="addUnit" 
            @update="updateUnit" 
            @cancel="onCancel" 
          />
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import NewUnitForm from '@/components/NewUnitForm.vue'
import { getUnits, deleteUnit as deleteUnitApi, updateUnit as updateUnitApi, createUnit, type Unit } from '@/services/units.ts'
import { useToastStore } from '@/store/toast.ts'

const dialog = ref(false)
const loading = ref(false)
const units = ref<Unit[]>([])
const editingUnit = ref<Unit | null>(null)
const toast = useToastStore()

const headers = ref([
  { title: 'Nombre', key: 'name' },
  { title: 'Abreviación', key: 'abbreviation' },
  { title: 'Acciones', key: 'actions', sortable: false }
])

const fetchUnits = async () => {
  loading.value = true
  try {
    const response = await getUnits()
    units.value = response
  } catch (error) {
    console.error('Error fetching units:', error)
  } finally {
    loading.value = false
  }
}

const addUnit = async (newUnit: Omit<Unit, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const response = await createUnit(newUnit)
    units.value.push(response)
    toast.show('Unidad creada correctamente', 'success')
    dialog.value = false
  } catch (error) {
    console.error('Error creating unit:', error)
    toast.show('Error al crear la unidad', 'error')
  }
}

const editUnit = (unit: Unit) => {
  editingUnit.value = unit
  dialog.value = true
}

const updateUnit = async (id: number, unitData: Partial<Unit>) => {
  try {
    await updateUnitApi(id, unitData)
    const index = units.value.findIndex(u => u.id === id)
    if (index !== -1) {
      units.value[index] = {
        ...units.value[index],
        ...unitData
      }
    }
    toast.show('Unidad actualizada correctamente', 'success')
    dialog.value = false
    editingUnit.value = null
  } catch (error) {
    console.error('Error updating unit:', error)
    toast.show('Error al actualizar la unidad', 'error')
  }
}

const deleteUnit = async (id: number) => {
  try {
    await deleteUnitApi(id)
    units.value = units.value.filter(unit => unit.id !== id)
    toast.show('Unidad eliminada correctamente', 'success')
  } catch (error) {
    console.error('Error deleting unit:', error)
    toast.show('Error al eliminar la unidad', 'error')
  }
}

const onCancel = () => {
  dialog.value = false
  editingUnit.value = null
}

const openCreateDialog = () => {
  editingUnit.value = null
  dialog.value = true
}

onMounted(() => {
  fetchUnits()
})
</script>