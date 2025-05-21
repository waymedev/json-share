<template>
  <div
    class="px-4 py-3 bg-gray-50 border-t border-gray-200 sm:px-6 flex justify-between items-center"
  >
    <div class="text-sm text-gray-700">
      Showing
      <span class="font-medium">{{
        pagination.total === 0
          ? 0
          : (pagination.page - 1) * pagination.page_size + 1
      }}</span>
      to
      <span class="font-medium">{{
        Math.min(pagination.page * pagination.page_size, pagination.total)
      }}</span>
      of
      <span class="font-medium">{{ pagination.total }}</span>
      results
    </div>
    <div class="flex-1 flex justify-end">
      <button
        @click="handlePageChange(pagination.page - 1)"
        :disabled="pagination.page <= 1"
        :class="
          pagination.page <= 1
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-gray-200'
        "
        class="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-l-md"
      >
        Previous
      </button>
      <button
        @click="handlePageChange(pagination.page + 1)"
        :disabled="pagination.page >= pagination.total_pages"
        :class="
          pagination.page >= pagination.total_pages
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-gray-200'
        "
        class="relative inline-flex items-center px-4 py-2 ml-1 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-r-md"
      >
        Next
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Pagination } from "../services/types";

defineProps<{
  pagination: Pagination;
}>();

const emit = defineEmits<{
  (e: "page-change", page: number): void;
}>();

const handlePageChange = (page: number): void => {
  emit("page-change", page);
};
</script>
