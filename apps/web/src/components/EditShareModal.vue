<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <div class="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
      <h3 class="text-lg font-bold text-gray-900 mb-4">
        Edit Sharing Settings
      </h3>

      <div class="mb-6">
        <div class="flex items-center justify-between mb-4">
          <label class="font-medium text-gray-700">File Sharing</label>
          <div
            class="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer"
          >
            <input
              id="sharing-toggle"
              v-model="isShared"
              type="checkbox"
              class="absolute w-0 h-0 opacity-0"
            />
            <label
              for="sharing-toggle"
              class="flex items-center w-full h-full bg-gray-300 rounded-full cursor-pointer"
              :class="{ 'bg-emerald-500': isShared }"
            >
              <span
                class="h-5 w-5 ml-0.5 bg-white rounded-full transform transition-transform duration-200 ease-in-out"
                :class="{ 'translate-x-6': isShared }"
              ></span>
            </label>
          </div>
        </div>

        <div
          v-if="isShared"
          class="mb-4 transition-opacity duration-200 ease-in-out"
          :class="{ 'opacity-100': isShared, 'opacity-0': !isShared }"
        >
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Expiration
          </label>
          <select
            v-model="expirationDays"
            class="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option :value="1">1 day</option>
            <option :value="7">7 days</option>
            <option :value="undefined">No expiration</option>
          </select>
        </div>

        <div class="mt-6 text-sm text-gray-600" v-if="isShared">
          <p>
            People with the link will be able to view this file.
            <span v-if="expirationDays"
              >The link will expire after {{ expirationDays }} day(s).</span
            >
            <span v-else>The link will never expire.</span>
          </p>
        </div>
      </div>

      <div class="flex justify-end space-x-3">
        <button
          @click="handleClose"
          class="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          @click="handleSave"
          class="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 flex items-center"
          :disabled="isLoading"
        >
          <Loader v-if="isLoading" class="animate-spin h-4 w-4 mr-2" />
          Save
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Loader } from "lucide-vue-next";
import { ref, watch } from "vue";
import type { SavedItem } from "../services/saved";

const props = defineProps<{
  show: boolean;
  file: SavedItem | null;
  isLoading: boolean;
  currentExpirationDays: number | undefined;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (
    e: "save",
    data: { isShared: boolean; expirationDays: number | undefined }
  ): void;
}>();

const isShared = ref(false);
const expirationDays = ref<number | undefined>(7);

// Watch for changes in the file and update form state
watch(
  () => props.file,
  (newFile) => {
    if (newFile) {
      isShared.value = newFile.is_shared || false;
      expirationDays.value = props.currentExpirationDays;
    }
  },
  { immediate: true }
);

const handleSave = (): void => {
  emit("save", {
    isShared: isShared.value,
    expirationDays: isShared.value ? expirationDays.value : undefined,
  });
};

const handleClose = (): void => {
  emit("close");
};
</script>
