<template>
  <Transition
    enter-active-class="ease-out duration-300"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="ease-in duration-200"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="show"
      class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity z-40"
    ></div>
  </Transition>

  <Transition
    enter-active-class="ease-out duration-300"
    enter-from-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
    enter-to-class="opacity-100 translate-y-0 sm:scale-100"
    leave-active-class="ease-in duration-200"
    leave-from-class="opacity-100 translate-y-0 sm:scale-100"
    leave-to-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
  >
    <div
      v-if="show"
      class="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div
        class="flex min-h-screen items-end justify-center p-4 text-center sm:items-center sm:p-0"
      >
        <div
          class="relative w-full transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:max-w-lg sm:p-6"
        >
          <div class="mb-5">
            <h3
              class="text-lg font-semibold leading-6 text-gray-900"
              id="modal-title"
            >
              Edit Share Settings
            </h3>
            <p class="text-sm text-gray-500 mt-1" v-if="props.file">
              {{ props.file.file_name }}
            </p>
          </div>

          <form @submit.prevent="handleSave">
            <!-- Sharing Status - Capsule Toggle -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Sharing Status
              </label>
              <div class="inline-flex rounded-full p-1 bg-gray-100">
                <button
                  type="button"
                  class="px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 focus:outline-none"
                  :class="
                    isShared
                      ? 'bg-white text-gray-800 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  "
                  @click="isShared = true"
                >
                  Shared
                </button>
                <button
                  type="button"
                  class="px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 focus:outline-none"
                  :class="
                    !isShared
                      ? 'bg-white text-gray-800 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  "
                  @click="isShared = false"
                >
                  Not Shared
                </button>
              </div>
            </div>

            <!-- Expiration Days - Simplified Options -->
            <div class="mb-6" v-if="isShared">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Expiration Time
              </label>
              <div class="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  @click="expirationDays = '1'"
                  class="px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none"
                  :class="
                    expirationDays === '1'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                  "
                >
                  1 Day
                </button>
                <button
                  type="button"
                  @click="expirationDays = '7'"
                  class="px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none"
                  :class="
                    expirationDays === '7'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                  "
                >
                  7 Days
                </button>
                <button
                  type="button"
                  @click="expirationDays = 'unlimited'"
                  class="px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none"
                  :class="
                    expirationDays === 'unlimited'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                  "
                >
                  Forever
                </button>
              </div>
            </div>

            <div
              class="mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3"
            >
              <button
                type="button"
                class="inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1"
                @click="handleCancel"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="inline-flex w-full justify-center rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 sm:col-start-2"
                :disabled="isLoading"
              >
                <Loader2 v-if="isLoading" class="animate-spin h-4 w-4 mr-2" />
                {{ isLoading ? "Saving..." : "Save Changes" }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { Loader2 } from "lucide-vue-next";
import { ref, watch } from "vue";
import type { SavedItem } from "../services/saved";

// Props
const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  file: {
    type: Object as () => SavedItem | null,
    default: null,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  currentExpirationDays: {
    type: Number,
    default: undefined,
  },
});

// Emits
const emit = defineEmits(["save", "close"]);

// Reactive state
const isShared = ref(props.file?.is_shared ?? false);
const expirationDays = ref(
  props.currentExpirationDays ? String(props.currentExpirationDays) : "7"
);

// Watch for changes in props
watch(
  () => props.file,
  (newFile) => {
    if (newFile) {
      isShared.value = newFile.is_shared ?? false;
    }
  },
  { immediate: true }
);

watch(
  () => props.currentExpirationDays,
  (days) => {
    if (days) {
      expirationDays.value = String(days);
    } else if (days === 0) {
      expirationDays.value = "unlimited";
    }
  },
  { immediate: true }
);

// Methods
const handleSave = () => {
  emit("save", {
    isShared: isShared.value,
    expirationDays:
      expirationDays.value === "unlimited" ? 0 : Number(expirationDays.value),
  });
};

const handleCancel = () => {
  emit("close");
};
</script>

<style scoped>
/* Optional: Add transition for smoother button state changes */
button {
  transition: all 0.2s ease;
}
</style>
