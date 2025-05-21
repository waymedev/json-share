<template>
  <div
    class="fixed bottom-4 right-4 bg-emerald-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center z-50 transition-opacity duration-300"
    :class="{ 'opacity-100': true, 'opacity-0': false }"
  >
    <CheckCircle class="h-5 w-5 mr-2" />
    <span>{{ message }}</span>
    <button
      @click="handleClose"
      class="ml-4 text-white hover:text-gray-200"
      aria-label="Close notification"
    >
      <X class="h-4 w-4" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { CheckCircle, X } from "lucide-vue-next";

defineProps<{
  message: string;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const handleClose = (): void => {
  emit("close");
};
</script>
