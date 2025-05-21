<template>
  <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
    <div class="flex space-x-2">
      <button
        @click="handleFilterChange('all')"
        class="px-4 py-2 rounded-md transition-colors"
        :class="
          activeFilter === 'all'
            ? 'bg-emerald-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        "
      >
        All
      </button>
      <button
        @click="handleFilterChange('shared')"
        class="px-4 py-2 rounded-md transition-colors"
        :class="
          activeFilter === 'shared'
            ? 'bg-emerald-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        "
      >
        Shared
      </button>
      <button
        @click="handleFilterChange('expired')"
        class="px-4 py-2 rounded-md transition-colors"
        :class="
          activeFilter === 'expired'
            ? 'bg-emerald-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        "
      >
        Expired
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  activeFilter: "all" | "shared" | "expired";
}>();

const emit = defineEmits<{
  (e: "filter-change", filter: "all" | "shared" | "expired"): void;
}>();

const handleFilterChange = (filter: "all" | "shared" | "expired"): void => {
  emit("filter-change", filter);
};
</script>
