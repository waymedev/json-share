<template>
  <div
    class="border-2 border-dashed border-emerald-300 rounded-lg p-8 mb-6 bg-white text-center cursor-pointer hover:border-emerald-500 transition-colors"
    @dragover.prevent="isDragging = true"
    @dragleave.prevent="isDragging = false"
    @drop.prevent="handleFileDrop"
    @click="triggerFileInput"
    :class="{ 'border-emerald-500 bg-emerald-50': isDragging }"
  >
    <input
      type="file"
      ref="fileInput"
      class="hidden"
      @change="handleFileSelected"
      accept=".json"
    />
    <Upload class="h-16 w-16 text-emerald-500 mx-auto mb-4" />
    <p class="text-lg font-medium text-gray-700 mb-2">上传文件区域</p>
    <ul class="text-gray-600 space-y-1">
      <li>• 拖拽或点击选择文件</li>
    </ul>
    <p v-if="selectedFile" class="mt-4 text-emerald-600 font-medium">
      已选择: {{ selectedFile.name }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { Upload } from "lucide-vue-next";
import { ref } from "vue";
import { useFileValidator } from "../composables/useFileValidator";

export interface FileInfo {
  name: string;
  size: number;
  type: string;
}

interface Props {
  maxFileSize?: number;
}

const props = withDefaults(defineProps<Props>(), {
  maxFileSize: 50 * 1024 * 1024, // 50MB default
});

const emit = defineEmits<{
  (e: "fileSelected", file: File, fileInfo: FileInfo): void;
  (e: "validationError", title: string, message: string): void;
}>();

const isDragging = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const selectedFile = ref<FileInfo | null>(null);
const { validateJsonFile } = useFileValidator();

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileSelected = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;

  const file = input.files[0];
  await processFile(file);
};

const handleFileDrop = async (event: DragEvent) => {
  isDragging.value = false;
  if (!event.dataTransfer?.files || event.dataTransfer.files.length === 0)
    return;

  const file = event.dataTransfer.files[0];
  await processFile(file);
};

const processFile = async (file: File) => {
  // Validate file
  const { isValid, errorTitle, errorMessage } = await validateJsonFile(
    file,
    props.maxFileSize
  );

  if (!isValid) {
    emit("validationError", errorTitle, errorMessage);
    return;
  }

  // Store file info
  const fileInfo: FileInfo = {
    name: file.name,
    size: file.size,
    type: file.type,
  };

  selectedFile.value = fileInfo;
  emit("fileSelected", file, fileInfo);
};

// Method to clear selected file
const clearSelection = () => {
  selectedFile.value = null;
  if (fileInput.value) {
    fileInput.value.value = "";
  }
};

// Expose methods to parent component
defineExpose({
  clearSelection,
});
</script>
