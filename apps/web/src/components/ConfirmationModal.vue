<template>
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <div class="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
      <h3 class="text-lg font-bold text-gray-900 mb-4">
        {{ title }}
      </h3>
      <p class="text-gray-700 mb-6">{{ message }}</p>

      <div class="flex justify-end space-x-3">
        <button
          @click="handleCancel"
          class="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          @click="handleConfirm"
          class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  message: string;
}>();

const emit = defineEmits<{
  (e: "confirm"): void;
  (e: "cancel"): void;
}>();

const handleConfirm = (): void => {
  emit("confirm");
};

const handleCancel = (): void => {
  emit("cancel");
};
</script>
