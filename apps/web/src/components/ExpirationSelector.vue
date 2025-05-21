<template>
  <div class="bg-white rounded-lg shadow p-4 mb-6">
    <div class="flex items-center justify-between">
      <span class="text-gray-700 font-medium">过期时间：</span>
      <div class="relative">
        <select
          v-model="selectedExpiration"
          class="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          @change="handleExpirationChange"
        >
          <option
            v-for="option in expirationOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
        <div
          class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700"
        >
          <ChevronDown class="h-4 w-4" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChevronDown } from "lucide-vue-next";
import { ref, watch } from "vue";

interface ExpirationOption {
  value: string;
  label: string;
}

interface Props {
  initialValue?: string;
  options?: ExpirationOption[];
}

const props = withDefaults(defineProps<Props>(), {
  initialValue: "7",
  options: () => [
    { value: "1", label: "1 天" },
    { value: "7", label: "7 天" },
    { value: "unlimited", label: "永久" },
  ],
});

const emit = defineEmits<{
  (e: "change", value: string): void;
}>();

const selectedExpiration = ref(props.initialValue);
const expirationOptions = ref<ExpirationOption[]>(props.options);

// Watch for external changes to initialValue
watch(
  () => props.initialValue,
  (newValue) => {
    selectedExpiration.value = newValue;
  }
);

const handleExpirationChange = () => {
  emit("change", selectedExpiration.value);
};
</script>
