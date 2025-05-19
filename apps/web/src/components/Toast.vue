<template>
  <Transition
    enter-active-class="transform ease-out duration-300 transition"
    enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
    enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
    leave-active-class="transition ease-in duration-100"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="show"
      class="fixed top-4 right-4 z-50 pointer-events-none flex items-start justify-end px-4 sm:px-6"
    >
      <div
        class="w-[380px] bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden"
      >
        <div class="p-4">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <XCircle
                v-if="type === 'error'"
                class="h-6 w-6 text-red-400"
                aria-hidden="true"
              />
              <CheckCircle
                v-else
                class="h-6 w-6 text-emerald-400"
                aria-hidden="true"
              />
            </div>
            <div class="ml-3 flex-1 pt-0.5">
              <p class="text-sm font-medium text-gray-900">{{ title }}</p>
              <p class="mt-1 text-sm text-gray-500">{{ message }}</p>
            </div>
            <div class="ml-4 flex-shrink-0 flex">
              <button
                type="button"
                class="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                @click="handleClose"
              >
                <span class="sr-only">Close</span>
                <X class="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { CheckCircle, XCircle, X } from "lucide-vue-next";

interface Props {
  show: boolean;
  title: string;
  message: string;
  type?: "success" | "error";
}

interface Emits {
  (e: "close"): void;
}

const props = withDefaults(defineProps<Props>(), {
  type: "success",
});

const emit = defineEmits<Emits>();

const handleClose = () => {
  emit("close");
};
</script>
