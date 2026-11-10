// stores/toast.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useToastStore = defineStore('toast', () => {
  const messages = ref<{ text: string; type: 'success' | 'error' | 'info' }[]>([])

  function show(text: string, type: 'success' | 'error' | 'info' = 'info') {
    messages.value.push({ text, type })
    setTimeout(() => {
      messages.value.shift()
    }, 3000) // auto-hide after 3s
  }

  return { messages, show }
})
