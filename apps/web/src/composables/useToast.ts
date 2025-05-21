import { ref } from "vue";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastOptions {
  title: string;
  message: string;
  type?: ToastType;
  duration?: number;
}

export const useToast = () => {
  const showToast = ref(false);
  const toastMessage = ref("");
  let toastTimeout: number | null = null;

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

  const hideToast = () => {
    showToast.value = false;
    if (toastTimeout) {
      window.clearTimeout(toastTimeout);
      toastTimeout = null;
    }
  };

  const successToast = (title: string, message: string, duration?: number) => {
    showToastNotification(message);
  };

  const errorToast = (title: string, message: string, duration?: number) => {
    showToastNotification(message);
  };

  const infoToast = (title: string, message: string, duration?: number) => {
    showToastNotification(message);
  };

  const warningToast = (title: string, message: string, duration?: number) => {
    showToastNotification(message);
  };

  return {
    showToast,
    toastMessage,
    showToastNotification,
    hideToast,
    successToast,
    errorToast,
    infoToast,
    warningToast,
  };
};
