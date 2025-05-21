<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- 头部导航 -->
    <Header>
      <template #right>
        <div
          @click="goToLibrary"
          class="cursor-pointer text-lg font-medium text-gray-700"
        >
          My Library
        </div>
      </template>
    </Header>

    <!-- 主要内容 -->
    <main class="container mx-auto px-4 py-8 max-w-3xl">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-800 mb-3">
          一键分享你的JSON文件
        </h1>
      </div>

      <!-- 上传文件区域 -->
      <FileUploader
        :max-file-size="MAX_FILE_SIZE"
        @file-selected="handleFileSelected"
        @validation-error="handleValidationError"
        ref="fileUploaderRef"
      />

      <!-- 过期时间选择 -->
      <ExpirationSelector
        :initial-value="expirationDays"
        @change="handleExpirationChange"
      />

      <!-- 分享按钮 -->
      <div class="text-center">
        <button
          class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors focus:outline-none focus:ring-4 focus:ring-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
          :disabled="!selectedFile || isLoading"
          @click="handleFileShare"
        >
          <Loader2 v-if="isLoading" class="animate-spin h-5 w-5 mr-2" />
          {{ isLoading ? "上传中..." : "开始分享" }}
        </button>
      </div>
    </main>
    <Footer></Footer>

    <!-- Toast -->
    <Toast
      :show="showToast"
      :title="toastTitle"
      :message="toastMessage"
      :type="toastType"
      @close="hideToast"
    />

    <!-- Success Modal -->
    <Modal
      :show="showModal"
      title="分享成功"
      message="文件已成功上传并分享，您可以复制以下链接分享给他人："
      :share-link="shareLink"
      @close="handleModalClose"
    />
  </div>
</template>

<script setup lang="ts">
import { Loader2 } from "lucide-vue-next";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import ExpirationSelector from "../components/ExpirationSelector.vue";
import type { FileInfo } from "../components/FileUploader.vue";
import FileUploader from "../components/FileUploader.vue";
import Footer from "../components/Footer.vue";
import Header from "../components/Header.vue";
import Modal from "../components/Modal.vue";
import Toast from "../components/Toast.vue";
import { useFileShare } from "../composables/useFileShare";
import { useToast } from "../composables/useToast";
import type { ShareRequest } from "../services/shares";

const router = useRouter();
const { shareFile, isLoading, error } = useFileShare();
const toastState = useToast();

// Create computed properties for Toast component
const showToast = computed(() => toastState.showToast.value);
const toastTitle = computed(() => toastState.toastMessage.value);
const toastMessage = computed(() => toastState.toastMessage.value);
const toastType = computed<"success" | "error">(() =>
  toastState.toastMessage.value === "warning" ||
  toastState.toastMessage.value === "info"
    ? "error"
    : "success"
);
const hideToast = () => toastState.hideToast();

// Constants
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 10MB limit

// File state
const fileUploaderRef = ref<InstanceType<typeof FileUploader> | null>(null);
const selectedFile = ref<FileInfo | null>(null);
const rawFile = ref<File | null>(null);
const expirationDays = ref("7");

// Modal state
const showModal = ref(false);
const shareLink = ref("");

const handleFileSelected = (file: File, fileInfo: FileInfo) => {
  rawFile.value = file;
  selectedFile.value = fileInfo;
};

const handleValidationError = (title: string, message: string) => {
  toastState.errorToast(title, message);
};

const handleExpirationChange = (value: string) => {
  expirationDays.value = value;
};

const handleModalClose = () => {
  showModal.value = false;
  // Reset form
  selectedFile.value = null;
  rawFile.value = null;
  fileUploaderRef.value?.clearSelection();
};

const handleFileShare = async () => {
  if (!selectedFile.value || !rawFile.value) {
    console.warn("File sharing cancelled: No file selected", {
      selectedFile: selectedFile.value,
      rawFile: rawFile.value,
    });
    return;
  }

  const req: ShareRequest = {
    file: rawFile.value,
    filename: selectedFile.value.name,
    expirationDays:
      expirationDays.value === "unlimited"
        ? undefined
        : parseInt(expirationDays.value),
  };

  try {
    const result = await shareFile(req);

    if (!result) {
      throw new Error("Failed to get share result");
    }

    // Show success modal with formatted share link
    const shareId = result.share_id;
    shareLink.value = shareId
      ? `${window.location.origin}/share/${shareId}`
      : "";
    showModal.value = true;
  } catch (e) {
    console.error("File sharing failed", {
      error: error.value,
      errorDetails: e,
      requestData: {
        filename: selectedFile.value.name,
        expirationDays: expirationDays.value,
      },
    });

    // Show error toast
    toastState.errorToast(
      "分享失败",
      error.value || "文件上传失败，请稍后重试"
    );
  }
};

const goToLibrary = () => {
  router.push("/library");
};
</script>
