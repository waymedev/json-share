<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Navigation Bar -->
    <Header>
      <template #right>
        <div class="flex space-x-3">
          <button
            @click="handleCreateNewShare"
            class="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded flex items-center"
          >
            <Plus class="h-4 w-4 mr-2" />
            New File
          </button>
        </div>
      </template>
    </Header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8 flex-1 max-w-6xl">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-800 mb-6">My Files</h1>

        <!-- Filter Tabs -->
        <FilterTabs
          :active-filter="activeFilter"
          @filter-change="handleFilterChange"
        />

        <!-- Files List -->
        <FilesList
          :files="files"
          :loading="loading"
          :active-filter="activeFilter"
          @view-file="handleViewFile"
          @copy-share-link="handleCopyShareLink"
          @edit-settings="handleEditSettings"
          @confirm-unshare="handleConfirmUnshare"
          @share-file="handleShareFile"
          @confirm-delete="handleConfirmDelete"
        />

        <!-- Pagination -->
        <PaginationControls
          v-if="files.length > 0"
          :pagination="pagination"
          @page-change="handlePageChange"
        />
      </div>
    </main>

    <!-- Footer -->
    <Footer />

    <!-- Modals and Notifications -->
    <ConfirmationModal
      v-if="showConfirmModal"
      :title="confirmModalTitle"
      :message="confirmModalMessage"
      @confirm="handleConfirmAction"
      @cancel="showConfirmModal = false"
    />

    <EditShareModal
      :show="showEditModal"
      :file="selectedFile"
      :is-loading="isUpdating"
      :current-expiration-days="currentExpirationDays"
      @close="showEditModal = false"
      @save="handleSaveSettings"
    />

    <Modal
      :show="showSuccessModal"
      title="Settings Updated"
      message="File sharing settings have been updated successfully. You can share this file using the link below:"
      :share-link="shareLink"
      @close="showSuccessModal = false"
    />

    <ToastNotification
      v-if="showToast"
      :message="toastMessage"
      @close="showToast = false"
    />
  </div>
</template>

<script setup lang="ts">
import { Plus } from "lucide-vue-next";
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import ConfirmationModal from "../components/ConfirmationModal.vue";
import EditShareModal from "../components/EditShareModal.vue";
import FilesList from "../components/FilesList.vue";
import FilterTabs from "../components/FilterTabs.vue";
import Footer from "../components/Footer.vue";
import Header from "../components/Header.vue";
import Modal from "../components/Modal.vue";
import PaginationControls from "../components/PaginationControls.vue";
import ToastNotification from "../components/ToastNotification.vue";
import { useFilesManager } from "../composables/useFilesManager";
import { useModals } from "../composables/useModals";
import { useToast } from "../composables/useToast";
import type { SavedItem } from "../services/saved";

// Router
const router = useRouter();

// Composables
const {
  files,
  loading,
  pagination,
  activeFilter,
  fetchFiles,
  shareFile,
  unshareFile,
  deleteFile,
  updateFileSettings,
} = useFilesManager();

const { showToast, toastMessage, showToastNotification } = useToast();

const {
  showConfirmModal,
  confirmModalTitle,
  confirmModalMessage,
  confirmCallback,
  showEditModal,
  selectedFile,
  isUpdating,
  currentExpirationDays,
  showSuccessModal,
  shareLink,
  setupConfirmModal,
} = useModals();

// Initialize
onMounted(() => {
  fetchFiles(1);
});

// Event handlers
const handleCreateNewShare = (): void => {
  router.push("/");
};

const handleFilterChange = (filter: "all" | "shared" | "expired"): void => {
  activeFilter.value = filter;
  fetchFiles(1);
};

const handlePageChange = (page: number): void => {
  fetchFiles(page);
};

const handleViewFile = (id: number): void => {
  router.push(`/preview/${id}`);
};

const handleCopyShareLink = (file: SavedItem): void => {
  // Skip if file is not shared or is expired
  if (!file.is_shared || file.is_expired) return;

  const shareUrl = `${window.location.origin}/share/${file.share_id}`;

  navigator.clipboard
    .writeText(shareUrl)
    .then(() => {
      showToastNotification(
        `Share link for "${file.file_name}" copied to clipboard!`
      );
    })
    .catch((err) => {
      console.error("Failed to copy link: ", err);
      showToastNotification("Failed to copy link to clipboard");
    });
};

const handleEditSettings = (file: SavedItem): void => {
  selectedFile.value = file;
  currentExpirationDays.value = 7;
  showEditModal.value = true;
};

const handleSaveSettings = async (data: {
  isShared: boolean;
  expirationDays: number | undefined;
}): Promise<void> => {
  if (!selectedFile.value) return;

  isUpdating.value = true;

  try {
    await updateFileSettings(
      selectedFile.value.id,
      selectedFile.value.file_name,
      data.isShared,
      data.expirationDays
    );

    // If file is shared, show success modal with share link
    if (data.isShared && selectedFile.value.share_id) {
      shareLink.value = `${window.location.origin}/share/${selectedFile.value.share_id}`;
      showSuccessModal.value = true;
    } else {
      showToastNotification("File settings updated successfully");
    }

    showEditModal.value = false;
    await fetchFiles(pagination.value.page);
  } catch (error) {
    console.error("Failed to update file settings:", error);
    showToastNotification("Failed to update file settings");
  } finally {
    isUpdating.value = false;
  }
};

const handleShareFile = async (file: SavedItem): Promise<void> => {
  try {
    await shareFile(file);
    showToastNotification(`File "${file.file_name}" is now shared.`);
  } catch (error) {
    console.error("Failed to share file:", error);
    showToastNotification("Failed to share file");
  }
};

const handleConfirmUnshare = (file: SavedItem): void => {
  setupConfirmModal(
    "Unshare File",
    `Are you sure you want to unshare "${file.file_name}"? People with the link will no longer be able to access it.`,
    () => handleUnshareFile(file)
  );
};

const handleUnshareFile = async (file: SavedItem): Promise<void> => {
  try {
    await unshareFile(file);
    showConfirmModal.value = false;
    showToastNotification(`File "${file.file_name}" is no longer shared.`);
  } catch (error) {
    console.error("Failed to unshare file:", error);
    showToastNotification("Failed to unshare file");
    showConfirmModal.value = false;
  }
};

const handleConfirmDelete = (file: SavedItem): void => {
  setupConfirmModal(
    "Delete File",
    `Are you sure you want to delete "${file.file_name}"? This action cannot be undone.`,
    () => handleDeleteFile(file)
  );
};

const handleDeleteFile = async (file: SavedItem): Promise<void> => {
  try {
    await deleteFile(file);
    showConfirmModal.value = false;
    showToastNotification(`File "${file.file_name}" has been deleted.`);
  } catch (error) {
    console.error("Failed to delete file:", error);
    showToastNotification("Failed to delete file");
    showConfirmModal.value = false;
  }
};

const handleConfirmAction = (): void => {
  confirmCallback.value();
};
</script>

<style scoped>
/* Additional custom styles can be added here if needed */
@media (max-width: 640px) {
  table {
    display: block;
    overflow-x: auto;
  }
}
</style>
