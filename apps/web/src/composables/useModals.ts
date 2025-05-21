import { ref } from "vue";
import type { SavedItem } from "../services/saved";

export const useModals = () => {
  // Confirmation modal state
  const showConfirmModal = ref(false);
  const confirmModalTitle = ref("");
  const confirmModalMessage = ref("");
  const confirmCallback = ref<() => void>(() => {});

  // Edit modal state
  const showEditModal = ref(false);
  const selectedFile = ref<SavedItem | null>(null);
  const isUpdating = ref(false);
  const currentExpirationDays = ref<number | undefined>(7);

  // Success modal state
  const showSuccessModal = ref(false);
  const shareLink = ref("");

  // Setup confirmation modal
  const setupConfirmModal = (
    title: string,
    message: string,
    callback: () => void
  ): void => {
    confirmModalTitle.value = title;
    confirmModalMessage.value = message;
    confirmCallback.value = callback;
    showConfirmModal.value = true;
  };

  return {
    // Confirmation modal
    showConfirmModal,
    confirmModalTitle,
    confirmModalMessage,
    confirmCallback,
    setupConfirmModal,

    // Edit modal
    showEditModal,
    selectedFile,
    isUpdating,
    currentExpirationDays,

    // Success modal
    showSuccessModal,
    shareLink,
  };
};
