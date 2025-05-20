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
      <div
        class="border-2 border-dashed border-emerald-300 rounded-lg p-8 mb-6 bg-white text-center cursor-pointer hover:border-emerald-500 transition-colors"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="onFileDrop"
        @click="triggerFileInput"
        :class="{ 'border-emerald-500 bg-emerald-50': isDragging }"
      >
        <input
          type="file"
          ref="fileInput"
          class="hidden"
          @change="onFileSelected"
          accept=".json"
        />
        <Upload class="h-16 w-16 text-emerald-500 mx-auto mb-4" />
        <p class="text-lg font-medium text-gray-700 mb-2">上传文件区域</p>
        <ul class="text-gray-600 space-y-1">
          <li>• 拖拽或点击选择文件</li>
        </ul>
        <p v-if="selectedFile" class="mt-4 text-emerald-600 font-medium">
          已选择: {{ selectedFile.name }}
        </p>
      </div>

      <!-- 过期时间选择 -->
      <div class="bg-white rounded-lg shadow p-4 mb-6">
        <div class="flex items-center justify-between">
          <span class="text-gray-700 font-medium">过期时间：</span>
          <div class="relative">
            <select
              v-model="expirationDays"
              class="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="1">1 天</option>
              <option value="7">7 天</option>
              <option value="unlimited">永久</option>
            </select>
            <div
              class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700"
            >
              <ChevronDown class="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>

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
      @close="showToast = false"
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
import { ChevronDown, Loader2, Upload } from "lucide-vue-next";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useFileShare } from "../composables/useFileShare";
import type { ShareRequest } from "../services/shares";
import Footer from "./Footer.vue";
import Header from "./Header.vue";
import Modal from "./Modal.vue";
import Toast from "./Toast.vue";

const router = useRouter();
const { shareFile, isLoading, error, shareResult } = useFileShare();

interface FileInfo {
  name: string;
  size: number;
  type: string;
}

const isDragging = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const selectedFile = ref<FileInfo | null>(null);
const expirationDays = ref("7");
const rawFile = ref<File | null>(null);

// Toast state
const showToast = ref(false);
const toastTitle = ref("");
const toastMessage = ref("");
const toastType = ref<"success" | "error">("success");

// Modal state
const showModal = ref(false);
const shareLink = ref("");

const triggerFileInput = () => {
  fileInput.value?.click();
};

const onFileSelected = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    const file = input.files[0];
    rawFile.value = file;
    selectedFile.value = {
      name: file.name,
      size: file.size,
      type: file.type,
    };
  }
};

const onFileDrop = (event: DragEvent) => {
  isDragging.value = false;
  if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
    const file = event.dataTransfer.files[0];
    rawFile.value = file;
    selectedFile.value = {
      name: file.name,
      size: file.size,
      type: file.type,
    };
  }
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
    toastTitle.value = "分享失败";
    toastMessage.value = error.value || "文件上传失败，请稍后重试";
    toastType.value = "error";
    showToast.value = true;
  }
};

const handleModalClose = () => {
  showModal.value = false;
  // Reset form
  selectedFile.value = null;
  rawFile.value = null;
  if (fileInput.value) {
    fileInput.value.value = "";
  }
};

const goToLibrary = () => {
  router.push("/library");
};
</script>
