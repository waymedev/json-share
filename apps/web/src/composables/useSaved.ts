import { ref } from "vue";
import { savedService, type SavedItem } from "../services/saved";
import type { Pagination } from "../services/types";

export const useSaved = () => {
  const saved = ref<SavedItem[]>([]);
  const pagination = ref<Pagination>({
    page: 1,
    page_size: 20,
    total: 0,
    total_pages: 0,
  });

  const fetchSaved = async (
    page: number,
    size: number,
    expiredOnly: boolean,
    sharedOnly: boolean
  ) => {
    try {
      const response = await savedService.getSavedFiles(
        page,
        size,
        expiredOnly,
        sharedOnly
      );

      console.log("response", response);

      if (response?.data) {
        saved.value = response.data.list || [];
        pagination.value = response.data.pagination || pagination.value;
      } else {
        saved.value = [];
        // Keep existing pagination values
      }
    } catch (error) {
      console.error("Error fetching saved files:", error);
      saved.value = [];
      // Keep existing pagination values
    }
  };

  return {
    saved,
    pagination,
    fetchSaved,
  };
};
