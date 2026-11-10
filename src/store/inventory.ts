import { defineStore } from 'pinia'

export interface Product {
  id: number
  name: string
}

export const useInventoryStore = defineStore('inventory', {
  state: () => ({
    products: [] as Product[]
  }),
  actions: {
    addProduct(product: Product) {
      this.products.push(product)
    },
    removeProduct(id: number) {
      this.products = this.products.filter(p => p.id !== id)
    }
  }
})
