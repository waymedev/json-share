import { ref } from "vue";
import {
  sharesService,
  type ShareResponse,
  type ShareRequest,
} from "../services/shares";
import { useUserStore } from "../stores/user";

export const useFileShare = () => {
  const userStore = useUserStore();
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const shareResult = ref<ShareResponse | null>(null);

  const shareFile = async (data: ShareRequest) => {
    data.userId = userStore.getUserId();

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
