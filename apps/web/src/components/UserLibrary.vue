<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Navigation Bar -->
    <Header>
      <template #right>
        <div class="flex space-x-3">
          <button
            @click="createNewShare"
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

        <!-- Filter Buttons -->
        <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div class="flex space-x-2">
            <button
              @click="
                activeFilter = 'all';
                fetchFiles(1);
              "
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
              @click="
                activeFilter = 'shared';
                fetchFiles(1);
              "
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
              @click="
                activeFilter = 'expired';
                fetchFiles(1);
              "
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

        <!-- Files List -->
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
                <tr
                  v-for="file in files"
                  :key="file.id"
                  class="hover:bg-gray-50"
                >
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div
                      @click="goToPreview(file.id)"
                      class="flex items-center cursor-pointer hover:text-emerald-600"
                    >
                      <FileText
                        class="flex-shrink-0 h-5 w-5 text-gray-500 mr-3"
                      />
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
                      @copy-share-link="copyShareLink"
                      @edit-settings="showEditSettings"
                      @confirm-unshare="confirmUnshare"
                      @share-file="shareFile"
                      @confirm-delete="confirmDelete"
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
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
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
                Math.min(
                  pagination.page * pagination.page_size,
                  pagination.total
                )
              }}</span>
              of
              <span class="font-medium">{{ pagination.total }}</span>
              results
            </div>
            <div class="flex-1 flex justify-end">
              <button
                @click="fetchFiles(pagination.page - 1)"
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
                @click="fetchFiles(pagination.page + 1)"
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
        </div>
      </div>
    </main>

    <!-- Footer -->
    <Footer />

    <!-- Confirmation Modal -->
    <div
      v-if="showConfirmModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
        <h3 class="text-lg font-bold text-gray-900 mb-4">
          {{ confirmModalTitle }}
        </h3>
        <p class="text-gray-700 mb-6">{{ confirmModalMessage }}</p>

        <div class="flex justify-end space-x-3">
          <button
            @click="showConfirmModal = false"
            class="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            @click="confirmAction()"
            class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Settings Modal -->
    <EditShareModal
      :show="showEditModal"
      :file="selectedFile"
      :is-loading="isUpdating"
      :current-expiration-days="currentExpirationDays"
      @close="showEditModal = false"
      @save="handleSaveSettings"
    />

    <!-- Success Modal -->
    <Modal
      :show="showSuccessModal"
      title="Settings Updated"
      message="File sharing settings have been updated successfully. You can share this file using the link below:"
      :share-link="shareLink"
      @close="showSuccessModal = false"
    />

    <!-- Toast Notification -->
    <div
      v-if="showToast"
      class="fixed bottom-4 right-4 bg-emerald-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center z-50 transition-opacity duration-300"
      :class="{ 'opacity-100': showToast, 'opacity-0': !showToast }"
    >
      <CheckCircle class="h-5 w-5 mr-2" />
      <span>{{ toastMessage }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CheckCircle, FileQuestion, FileText, Plus } from "lucide-vue-next";
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { savedService, type SavedItem } from "../services/saved";
import type { Pagination } from "../services/types";
import EditShareModal from "./EditShareModal.vue";
import FileActions from "./FileActions.vue";
import Footer from "./Footer.vue";
import Header from "./Header.vue";
import Modal from "./Modal.vue";
// Router
const router = useRouter();

// State
const activeFilter = ref<"all" | "shared" | "expired">("all");
const files = ref<SavedItem[]>([]);
const loading = ref(false);
const pagination = ref<Pagination>({
  page: 1,
  page_size: 10,
  total: 0,
  total_pages: 0,
});

// Toast notification state
const showToast = ref(false);
const toastMessage = ref("");
let toastTimeout: number | null = null;

// Confirmation modal state
const showConfirmModal = ref(false);
const confirmModalTitle = ref("");
const confirmModalMessage = ref("");
const confirmCallback = ref(() => {});

// Edit modal state
const showEditModal = ref(false);
const selectedFile = ref<SavedItem | null>(null);
const isUpdating = ref(false);
const currentExpirationDays = ref<number | undefined>(undefined);

// Success modal state
const showSuccessModal = ref(false);
const shareLink = ref("");

// Fetch files on component mount
onMounted(() => {
  fetchFiles(1);
});

// Toast methods
const showToastNotification = (message: string) => {
  // Clear existing timeout if there is one
  if (toastTimeout !== null) {
    window.clearTimeout(toastTimeout);
  }

  // Set toast message and show it
  toastMessage.value = message;
  showToast.value = true;

  // Set timeout to hide toast after 3 seconds
  toastTimeout = window.setTimeout(() => {
    showToast.value = false;
    toastTimeout = null;
  }, 3000);
};

// Methods
const fetchFiles = async (page: number) => {
  loading.value = true;

  try {
    let response;

    if (activeFilter.value === "all") {
      response = await savedService.getSavedFiles(
        page,
        pagination.value.page_size
      );
    } else if (activeFilter.value === "shared") {
      response = await savedService.getSavedFiles(
        page,
        pagination.value.page_size,
        undefined,
        true
      );
    } else if (activeFilter.value === "expired") {
      response = await savedService.getSavedFiles(
        page,
        pagination.value.page_size,
        true,
        undefined
      );
    }

    if (response && response.data) {
      files.value = response.data.list;
      pagination.value = {
        page: response.data.pagination.page,
        page_size: response.data.pagination.page_size,
        total: response.data.pagination.total,
        total_pages: response.data.pagination.total_pages,
      };
    }

    loading.value = false;
  } catch (error) {
    console.error("Failed to fetch files:", error);
    loading.value = false;
  }
};

const goToPreview = (id: number) => {
  router.push(`/preview/${id}`);
};

const createNewShare = (): void => {
  router.push("/");
};

const copyShareLink = (file: SavedItem): void => {
  // Skip if file is not shared or is expired
  if (!file.is_shared || file.is_expired) return;

  const shareUrl = `${window.location.origin}/share/${file.share_id}`;
  console.log("shareUrl", shareUrl);
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

const showEditSettings = async (file: SavedItem) => {
  selectedFile.value = file;
  isUpdating.value = true;

  try {
    // Get current file details including expiration_days
    const response = await savedService.getSavedFileDetail(file.id);
    if (response && response.data) {
      currentExpirationDays.value = response.data.expiration_days;
    }

    showEditModal.value = true;
    isUpdating.value = false;
  } catch (error) {
    console.error("Failed to get file details:", error);
    isUpdating.value = false;
    showToastNotification("Failed to load file details");
  }
};

const handleSaveSettings = async (data: {
  isShared: boolean;
  expirationDays: number | undefined;
}) => {
  if (!selectedFile.value) return;

  isUpdating.value = true;

  console.log("selectedFile", selectedFile.value);

  try {
    await savedService.updateSavedFile(selectedFile.value.id, {
      file_name: selectedFile.value.file_name,
      is_shared: data.isShared,
      expiration_days: data.expirationDays,
    });

    // If file is shared, show success modal with share link
    if (data.isShared) {
      shareLink.value = `${window.location.origin}/share/${selectedFile.value.share_id}`;
      showSuccessModal.value = true;
    } else {
      showToastNotification("File settings updated successfully");
    }

    showEditModal.value = false;
    fetchFiles(pagination.value.page);
  } catch (error) {
    console.error("Failed to update file settings:", error);
    showToastNotification("Failed to update file settings");
  } finally {
    isUpdating.value = false;
  }
};

const shareFile = async (file: SavedItem): Promise<void> => {
  try {
    await savedService.updateSavedFile(file.id, {
      file_name: file.file_name,
      is_shared: true,
      expiration_days: 30, // Default 30 days
    });
    showToastNotification(`File "${file.file_name}" is now shared.`);
    fetchFiles(pagination.value.page);
  } catch (error) {
    console.error("Failed to share file:", error);
    showToastNotification("Failed to share file");
  }
};

const confirmUnshare = (file: SavedItem): void => {
  confirmModalTitle.value = "Unshare File";
  confirmModalMessage.value = `Are you sure you want to unshare "${file.file_name}"? People with the link will no longer be able to access it.`;
  confirmCallback.value = () => unshareFile(file);
  showConfirmModal.value = true;
};

const unshareFile = async (file: SavedItem): Promise<void> => {
  try {
    await savedService.updateSavedFile(file.id, {
      file_name: file.file_name,
      is_shared: false,
    });
    showConfirmModal.value = false;
    showToastNotification(`File "${file.file_name}" is no longer shared.`);
    fetchFiles(pagination.value.page);
  } catch (error) {
    console.error("Failed to unshare file:", error);
    showToastNotification("Failed to unshare file");
    showConfirmModal.value = false;
  }
};

const confirmDelete = (file: SavedItem): void => {
  confirmModalTitle.value = "Delete File";
  confirmModalMessage.value = `Are you sure you want to delete "${file.file_name}"? This action cannot be undone.`;
  confirmCallback.value = () => deleteFile(file);
  showConfirmModal.value = true;
};

const deleteFile = async (file: SavedItem): Promise<void> => {
  try {
    await savedService.deleteSavedFile(file.id);
    showConfirmModal.value = false;
    showToastNotification(`File "${file.file_name}" has been deleted.`);
    fetchFiles(pagination.value.page);
  } catch (error) {
    console.error("Failed to delete file:", error);
    showToastNotification("Failed to delete file");
    showConfirmModal.value = false;
  }
};

const confirmAction = () => {
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
