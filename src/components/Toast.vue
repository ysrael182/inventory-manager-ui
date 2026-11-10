<!-- components/Toast.vue -->
<template>
  <div class="toast-container">
    <div
      v-for="(msg, i) in toast.messages"
      :key="i"
      class="toast"
      :class="msg.type"
    >
      {{ msg.text }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useToastStore } from '@/store/toast'
const toast = useToastStore()
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 9999;
}
.toast {
  padding: 10px 16px;
  border-radius: 4px;
  color: #fff;
  font-weight: 500;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
}
.toast.success { background: #4caf50; }
.toast.error { background: #f44336; }
.toast.info { background: #2196f3; }
</style>
