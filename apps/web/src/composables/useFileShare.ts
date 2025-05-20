import { ref } from "vue";
import {
  sharesService,
  type ShareRequest,
  type ShareResponseData,
} from "../services/shares";

export const useFileShare = () => {
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const shareResult = ref<ShareResponseData | null>(null);

  const shareFile = async (data: ShareRequest) => {
    try {
      isLoading.value = true;
      error.value = null;
      shareResult.value = await sharesService.shareFile(data);
      return shareResult.value;
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Failed to share file";
      throw e;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    shareFile,
    isLoading,
    error,
    shareResult,
  };
};
