<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Navigation Bar -->
    <Header v-if="!isFullscreen">
      <template #right>
        <div class="flex space-x-3">
          <button
            v-if="isSharePage"
            @click="handleSave"
            class="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded flex items-center"
          >
            <Save class="h-4 w-4 mr-2" />
            Save
          </button>
          <button
            @click="handleDownload"
            class="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded flex items-center"
          >
            <Download class="h-4 w-4 mr-2" />
            Download
          </button>
        </div>
      </template>
    </Header>

    <!-- Main Content - Using flex-1 to take available space -->
    <main
      class="container mx-auto px-4 py-6 flex-1 max-w-4xl flex flex-col"
      :class="{ 'px-0 py-0 max-w-none': isFullscreen }"
    >
      <!-- Preview Area - Using flex-1 to expand and fill available space -->
      <div
        class="bg-white rounded-lg shadow-md overflow-hidden flex flex-col flex-1"
        :class="{ 'rounded-none shadow-none': isFullscreen }"
      >
        <div class="p-4 bg-gray-100 border-b border-gray-200 flex-shrink-0">
          <div class="flex items-center justify-between">
            <span class="font-medium text-gray-700">JSON Preview</span>
            <button
              @click="toggleFullscreen"
              class="p-1 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              aria-label="Toggle fullscreen"
            >
              <Maximize2 v-if="!isFullscreen" class="h-5 w-5 text-gray-600" />
              <Minimize2 v-else class="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        <!-- Content area - Using flex-1 to take remaining space -->
        <div
          v-if="isLoading"
          class="p-8 text-center text-gray-600 flex-1 flex items-center justify-center"
        >
          Loading JSON data...
        </div>

        <ErrorDisplay
          v-else-if="error"
          :error-message="error"
          @go-home="goToHomePage"
        />

        <div
          v-else
          class="json-viewer-container flex-1 flex overflow-hidden p-4"
        >
          <json-viewer
            :value="jsonData"
            :expand-depth="5"
            :expanded="true"
            class="json-viewer-custom w-full"
          ></json-viewer>
        </div>
      </div>
    </main>

    <Footer v-if="!isFullscreen" />

    <!-- Save File Modal -->
    <div
      v-if="showSaveModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="closeSaveModal"
    >
      <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Save JSON File</h3>
        <div
          v-if="saveError"
          class="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm"
        >
          {{ saveError }}
        </div>
        <div class="mb-4">
          <label
            for="filename"
            class="block text-sm font-medium text-gray-700 mb-1"
            >File name</label
          >
          <input
            type="text"
            id="filename"
            v-model="fileName"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Enter file name"
            @keydown.enter="saveFile"
            :disabled="isSaving"
          />
        </div>
        <div class="flex justify-end space-x-3">
          <button
            @click="closeSaveModal"
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            :disabled="isSaving"
          >
            Cancel
          </button>
          <button
            @click="saveFile"
            class="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 flex items-center"
            :disabled="isSaving"
          >
            <span
              v-if="isSaving"
              class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"
            ></span>
            {{ isSaving ? "Saving..." : "Save" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Download, Maximize2, Minimize2, Save } from "lucide-vue-next";
import { computed, onMounted, ref } from "vue";
import JsonViewer from "vue-json-viewer";
import { useRoute, useRouter } from "vue-router";
import { savedService, sharesService } from "../services";
import ErrorDisplay from "../components/ErrorDisplay.vue";
import Footer from "../components/Footer.vue";
import Header from "../components/Header.vue";

const router = useRouter();
const route = useRoute();
const jsonData = ref<any>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);
const isFullscreen = ref(false);
const showSaveModal = ref(false);
const fileName = ref("json-preview.json");
const isSaving = ref(false);
const saveError = ref<string | null>(null);

// Keep track of the current share_id
const currentShareId = ref<string | null>(null);

// Determine if we're on a share page (to show/hide the save button)
const isSharePage = computed(() => {
  return route.path.startsWith("/share/");
});

const toggleFullscreen = (): void => {
  isFullscreen.value = !isFullscreen.value;
};

const loadJsonFile = async () => {
  try {
    isLoading.value = true;
    error.value = null;

    const routePath = route.path;
    const routeParams = route.params;

    // Check if we're on the preview route or share route
    if (routePath.startsWith("/preview") && routeParams.fileId) {
      // This is a saved file preview, use savedService
      const fileId = Number(routeParams.fileId);

      if (isNaN(fileId)) {
        throw new Error("Invalid file ID");
      }

      try {
        const response = await savedService.getSavedFileDetail(fileId);
        if (response && response.data) {
          jsonData.value = response.data.json_content;
        } else {
          throw new Error("Failed to load JSON data");
        }
      } catch (apiError: any) {
        // Show error in the current page instead of redirecting
        if (apiError.message) {
          error.value = apiError.message;
        } else {
          error.value =
            "This file is no longer available or may have been removed";
        }
        return;
      }
    } else if (routePath.startsWith("/share") && routeParams.shareId) {
      // This is a shared link preview, use sharesService
      const shareId = routeParams.shareId as string;
      currentShareId.value = shareId;

      try {
        const response = await sharesService.getShareDetail(shareId);
        if (response && response.data && response.data.json_content) {
          jsonData.value = response.data.json_content;
        } else {
          throw new Error("Failed to load JSON data");
        }
      } catch (apiError: any) {
        // Show error in the current page instead of redirecting
        if (apiError.message) {
          error.value = apiError.message;
        } else {
          error.value =
            "This shared link is no longer available or may have been removed";
        }
        return;
      }
    } else {
      throw new Error("Invalid route");
    }
  } catch (e) {
    // Set the error to display in the current page
    error.value = e instanceof Error ? e.message : "Failed to load JSON data";
    console.error("Error loading JSON data:", e);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  loadJsonFile();
});

const goToHomePage = (): void => {
  router.push("/");
};

const handleSave = (): void => {
  // Open the modal to set the filename
  showSaveModal.value = true;
  // Reset error message when opening modal
  saveError.value = null;
};

const closeSaveModal = (): void => {
  showSaveModal.value = false;
  saveError.value = null;
};

const saveFile = async (): Promise<void> => {
  try {
    // Validate file name
    if (!fileName.value.trim()) {
      fileName.value = "json-preview.json";
    }

    // Add .json extension if not present
    if (!fileName.value.toLowerCase().endsWith(".json")) {
      fileName.value += ".json";
    }

    // Ensure we have a share_id
    if (!currentShareId.value) {
      throw new Error("No share ID available for saving");
    }

    isSaving.value = true;
    saveError.value = null;

    // Call savedService.saveFile to save the file on the server
    const response = await savedService.saveFile({
      share_id: currentShareId.value,
      file_name: fileName.value,
    });

    if (response && response.data && response.data.id) {
      // Success - redirect to the saved file preview
      router.push("/library");
      closeSaveModal();
    } else {
      throw new Error("Failed to save file");
    }
  } catch (e) {
    console.error("Error saving JSON:", e);
    saveError.value = e instanceof Error ? e.message : "Failed to save file";
  } finally {
    isSaving.value = false;
  }
};

const handleDownload = (): void => {
  // Convert JSON data to a properly formatted string
  const jsonString = JSON.stringify(jsonData.value, null, 2);

  // Create a blob with the JSON content
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  // Create a temporary anchor element to trigger the download
  const a = document.createElement("a");
  a.href = url;
  a.download = "json-preview.json";
  document.body.appendChild(a);
  a.click();

  // Clean up
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
</script>

<style scoped>
@import "vue-json-viewer/style.css";

.json-viewer-custom {
  height: 100%;
  overflow: auto !important;
  max-height: v-bind(
    'isFullscreen ? "calc(100vh - 60px)" : "calc(100vh - 300px)"'
  );
}

/* Target the internal container of the JSON viewer */
.json-viewer-custom .jv-container {
  height: 100%;
  max-height: 100%;
  overflow: visible;
}
</style>
