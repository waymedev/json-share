<template>
  <div class="flex space-x-2">
    <!-- Always show share link button, disabled when not shared -->
    <button
      @click="handleCopyShareLink"
      class="text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
      title="Copy share link"
      :disabled="!file.is_shared"
    >
      <Link class="h-4 w-4" />
    </button>

    <!-- Always show settings button -->
    <button
      @click="handleEditSettings"
      class="text-gray-600 hover:text-gray-800"
      title="Edit settings"
    >
      <Settings class="h-4 w-4" />
    </button>

    <!-- Always show delete button -->
    <button
      @click="handleConfirmDelete"
      class="text-red-600 hover:text-red-800"
      title="Delete"
    >
      <Trash class="h-4 w-4" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { Link, Settings, Trash } from "lucide-vue-next";
import type { SavedItem } from "../services/saved";

const props = defineProps<{
  file: SavedItem;
  activeFilter: "all" | "shared" | "expired";
}>();

const emit = defineEmits<{
  (e: "copy-share-link", file: SavedItem): void;
  (e: "edit-settings", file: SavedItem): void;
  (e: "confirm-delete", file: SavedItem): void;
}>();

const handleCopyShareLink = (): void => {
  emit("copy-share-link", props.file);
};

const handleEditSettings = (): void => {
  emit("edit-settings", props.file);
};

const handleConfirmDelete = (): void => {
  emit("confirm-delete", props.file);
};
</script>
