<template>
  <v-container>
    <v-card class="pa-6" elevation="4" max-width="800">
      <v-card-title class="text-h6">Registrar nueva venta</v-card-title>
      <v-card-text>
        <NewSaleForm
          :saving="savingSale"
          @create="addSale"
          @cancel="router.push('/sales')"
        />
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import NewSaleForm from '@/components/NewSaleForm.vue'
import { createSale } from '@/services/sales.ts'
import { useToastStore } from '@/store/toast.ts'

interface SaleFormData {
  products: Array<{
    id: number
    quantity: number
    price: number
    updateQty: boolean
  }>
  subtotal: number
  discount: number
  total: number
  note: string
  saleDate: string
}

const router = useRouter()
const toast = useToastStore()
const savingSale = ref(false)

function getCurrentUserId(): number {
  const token = localStorage.getItem('token')
  const encodedPayload = token?.split('.')[1]
  if (!encodedPayload) {
    throw new Error('No se pudo obtener el usuario de la sesión actual')
  }

  let claims: Record<string, unknown>
  try {
    const base64 = encodedPayload.replace(/-/g, '+').replace(/_/g, '/')
    const paddedBase64 = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
    claims = JSON.parse(atob(paddedBase64)) as Record<string, unknown>
  } catch {
    throw new Error('El token de sesión no contiene un usuario válido')
  }

  const user = claims.user
  const nestedUser = typeof user === 'object' && user !== null
    ? user as Record<string, unknown>
    : undefined
  const value = claims.userId ?? claims.user_id ?? claims.id ?? claims.sub ??
    nestedUser?.userId ?? nestedUser?.id
  const userId = typeof value === 'number'
    ? value
    : typeof value === 'string' && /^\d+$/.test(value)
      ? Number(value)
      : Number.NaN

  if (!Number.isSafeInteger(userId) || userId <= 0) {
    throw new Error('No se encontró un ID de usuario válido en la sesión')
  }

  return userId
}

async function addSale(sale: SaleFormData) {
  savingSale.value = true
  try {
    await createSale({
      userId: getCurrentUserId(),
      subtotal: sale.subtotal,
      discount: sale.discount,
      total: sale.total,
      note: sale.note,
      saleDate: sale.saleDate,
      items: sale.products.map(item => ({
        productId: item.id,
        qty: item.quantity,
        price: item.price,
        updateQty: item.updateQty
      }))
    })
    toast.show('Venta registrada correctamente', 'success')
    await router.push('/sales')
  } catch (error) {
    console.error('Error creating sale:', error)
    toast.show(
      error instanceof Error ? error.message : 'Error al registrar la venta',
      'error'
    )
  } finally {
    savingSale.value = false
  }
}
</script>
