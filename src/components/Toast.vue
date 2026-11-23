<!-- components/Toast.vue -->
<template>
  <div class="toast-container">
    <div v-for="(msg, i) in toast.messages" :key="i" class="toast" :class="msg.type">
      {{ msg.text }}
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useToastStore } from '@/store/toast';
  const toast = useToastStore();
</script>

<style scoped>
  .toast-container {
    position: fixed;
    top: 88px;
    right: 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    z-index: 9999;
  }
  .toast {
    min-width: 280px;
    padding: 13px 16px;
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: 12px;
    color: #fff;
    font-weight: 650;
    box-shadow: 0 12px 32px rgba(28, 44, 68, 0.18);
  }
  .toast.success {
    background: #318369;
  }
  .toast.error {
    background: #c84f4f;
  }
  .toast.info {
    background: #4685a0;
  }
</style>
