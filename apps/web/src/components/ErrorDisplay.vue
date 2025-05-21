<template>
  <div class="flex-1 flex flex-col items-center justify-center p-8">
    <div class="bg-red-50 p-4 rounded-full mb-6">
      <XCircle class="h-16 w-16 text-red-500" />
    </div>
    <h2 class="text-2xl font-bold text-gray-800 mb-4">
      Link Expired or Invalid
    </h2>
    <p class="text-gray-600 mb-6 text-center">
      {{ errorMessage }}
    </p>
    <div class="bg-gray-50 rounded-lg p-6 mb-6 text-left max-w-lg w-full">
      <h3 class="text-lg font-semibold text-gray-700 mb-3">
        This could be because:
      </h3>
      <ul class="space-y-2 text-gray-600">
        <li class="flex items-start">
          <Clock class="h-5 w-5 text-gray-500 mr-2 flex-shrink-0 mt-0.5" />
          <span>The shared link has expired</span>
        </li>
        <li class="flex items-start">
          <Trash2 class="h-5 w-5 text-gray-500 mr-2 flex-shrink-0 mt-0.5" />
          <span>The file has been deleted by the owner</span>
        </li>
        <li class="flex items-start">
          <Link class="h-5 w-5 text-gray-500 mr-2 flex-shrink-0 mt-0.5" />
          <span>The link URL is incorrect or incomplete</span>
        </li>
      </ul>
    </div>
    <button
      @click="handleGoHome"
      class="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-6 rounded-md flex items-center justify-center"
    >
      <Home class="h-5 w-5 mr-2" />
      Go to Homepage
    </button>
  </div>
</template>

<script setup lang="ts">
import { Clock, Home, Link, Trash2, XCircle } from "lucide-vue-next";

const props = defineProps<{
  errorMessage: string;
}>();

const emit = defineEmits<{
  (e: "goHome"): void;
}>();

const handleGoHome = () => {
  emit("goHome");
};
</script>
