<template>
  <div class="bg-white rounded-lg shadow-md overflow-hidden">
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-100">
          <tr>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              File Name
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Status
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <template v-if="loading">
            <tr v-for="i in 3" :key="i">
              <td colspan="3" class="px-6 py-4">
                <div class="h-6 bg-gray-200 rounded animate-pulse"></div>
              </td>
            </tr>
          </template>
          <template v-else>
            <tr v-for="file in files" :key="file.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div
                  @click="handleViewFile(file.id)"
                  class="flex items-center cursor-pointer hover:text-emerald-600"
                >
                  <FileText class="flex-shrink-0 h-5 w-5 text-gray-500 mr-3" />
                  <div class="text-sm font-medium text-gray-900">
                    {{ file.file_name }}
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span
                  :class="
                    file.is_expired
                      ? 'bg-red-100 text-red-800'
                      : file.is_shared
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  "
                  class="px-2 py-1 rounded-full text-xs"
                >
                  {{
                    file.is_expired
                      ? "Expired"
                      : file.is_shared
                      ? "Shared"
                      : "Unshared"
                  }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <FileActions
                  :file="file"
                  :active-filter="activeFilter"
                  @copy-share-link="handleCopyShareLink"
                  @edit-settings="handleEditSettings"
                  @confirm-unshare="handleConfirmUnshare"
                  @share-file="handleShareFile"
                  @confirm-delete="handleConfirmDelete"
                />
              </td>
            </tr>

            <!-- Empty state -->
            <tr v-if="files.length === 0">
              <td colspan="4" class="px-6 py-10 text-center text-gray-500">
                <div class="flex flex-col items-center">
                  <FileQuestion class="h-12 w-12 text-gray-400 mb-3" />
                  <p class="text-lg font-medium">No files found</p>
                  <p class="text-sm mt-1">
                    {{
                      activeFilter === "all"
                        ? "You haven't uploaded any files yet."
                        : activeFilter === "shared"
                        ? "You haven't shared any files yet."
                        : "You don't have any expired files."
                    }}
                  </p>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FileQuestion, FileText } from "lucide-vue-next";
import type { SavedItem } from "../services/saved";
import FileActions from "./FileActions.vue";

defineProps<{
  files: SavedItem[];
  loading: boolean;
  activeFilter: "all" | "shared" | "expired";
}>();

const emit = defineEmits<{
  (e: "view-file", id: number): void;
  (e: "copy-share-link", file: SavedItem): void;
  (e: "edit-settings", file: SavedItem): void;
  (e: "confirm-unshare", file: SavedItem): void;
  (e: "share-file", file: SavedItem): void;
  (e: "confirm-delete", file: SavedItem): void;
}>();

const handleViewFile = (id: number): void => {
  emit("view-file", id);
};

const handleCopyShareLink = (file: SavedItem): void => {
  emit("copy-share-link", file);
};

const handleEditSettings = (file: SavedItem): void => {
  emit("edit-settings", file);
};

const handleConfirmUnshare = (file: SavedItem): void => {
  emit("confirm-unshare", file);
};

const handleShareFile = (file: SavedItem): void => {
  emit("share-file", file);
};

const handleConfirmDelete = (file: SavedItem): void => {
  emit("confirm-delete", file);
};
</script>
