import { ref } from "vue";
import { savedService, type SavedItem } from "../services/saved";
import type { Pagination } from "../services/types";

export const useFilesManager = () => {
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

  // Fetch files with pagination and filters
  const fetchFiles = async (page: number): Promise<void> => {
    loading.value = true;

    try {
      let response;

      if (activeFilter.value === "all") {
        response = await savedService.getSavedFiles(
          page,
          pagination.value.page_size,
          false,
          false
        );
      } else if (activeFilter.value === "shared") {
        response = await savedService.getSavedFiles(
          page,
          pagination.value.page_size,
          false,
          true
        );
      } else if (activeFilter.value === "expired") {
        response = await savedService.getSavedFiles(
          page,
          pagination.value.page_size,
          true,
          false
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
    } catch (error) {
      console.error("Failed to fetch files:", error);
    } finally {
      loading.value = false;
    }
  };

  // Share a file
  const shareFile = async (file: SavedItem): Promise<void> => {
    loading.value = true;

    try {
      await savedService.updateSavedFile(file.id, {
        file_name: file.file_name,
        is_shared: true,
        expiration_days: 30, // Default 30 days
      });

      await fetchFiles(pagination.value.page);
    } catch (error) {
      console.error("Failed to share file:", error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // Unshare a file
  const unshareFile = async (file: SavedItem): Promise<void> => {
    loading.value = true;

    try {
      await savedService.updateSavedFile(file.id, {
        file_name: file.file_name,
        is_shared: false,
      });

      await fetchFiles(pagination.value.page);
    } catch (error) {
      console.error("Failed to unshare file:", error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // Delete a file
  const deleteFile = async (file: SavedItem): Promise<void> => {
    loading.value = true;

    try {
      await savedService.deleteSavedFile(file.id);
      await fetchFiles(pagination.value.page);
    } catch (error) {
      console.error("Failed to delete file:", error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // Update file settings
  const updateFileSettings = async (
    fileId: number,
    fileName: string,
    isShared: boolean,
    expirationDays?: number
  ): Promise<void> => {
    loading.value = true;

    try {
      await savedService.updateSavedFile(fileId, {
        file_name: fileName,
        is_shared: isShared,
        expiration_days: expirationDays,
      });

      await fetchFiles(pagination.value.page);
    } catch (error) {
      console.error("Failed to update file settings:", error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  return {
    // State
    files,
    loading,
    pagination,
    activeFilter,

    // Methods
    fetchFiles,
    shareFile,
    unshareFile,
    deleteFile,
    updateFileSettings,
  };
};
