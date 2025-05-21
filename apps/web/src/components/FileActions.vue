<template>
  <div class="flex space-x-2">
    <!-- Copy Link button - shown everywhere but conditionally disabled -->
    <button
      @click="handleCopyShareLink"
      class="text-emerald-600 hover:text-emerald-900"
      :class="
        !file.is_shared || file.is_expired
          ? 'opacity-50 cursor-not-allowed'
          : ''
      "
      :disabled="!file.is_shared || file.is_expired"
      title="Copy Share Link"
    >
      <Link class="h-5 w-5" />
    </button>

    <!-- Update button - shown everywhere -->
    <button
      @click="handleEdit"
      class="text-blue-600 hover:text-blue-900"
      title="Edit Share Settings"
    >
      <Edit class="h-5 w-5" />
    </button>

    <!-- Delete button - shown on "all" and "expired" pages -->
    <button
      @click="handleDelete"
      class="text-red-600 hover:text-red-900"
      title="Delete"
    >
      <Trash2 class="h-5 w-5" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { Edit, Link, Trash2 } from "lucide-vue-next";
import type { SavedItem } from "../services/saved";

interface Props {
  file: SavedItem;
  activeFilter: "all" | "shared" | "expired";
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "copy-share-link", file: SavedItem): void;
  (e: "edit-settings", file: SavedItem): void;
  (e: "confirm-unshare", file: SavedItem): void;
  (e: "share-file", file: SavedItem): void;
  (e: "confirm-delete", file: SavedItem): void;
}>();

const handleCopyShareLink = () => {
  if (!props.file.is_shared || props.file.is_expired) return;
  emit("copy-share-link", props.file);
};

const handleEdit = () => {
  emit("edit-settings", props.file);
};

const handleUnshare = () => {
  emit("confirm-unshare", props.file);
};

const handleShare = () => {
  emit("share-file", props.file);
};

const handleDelete = () => {
  emit("confirm-delete", props.file);
};
</script>
