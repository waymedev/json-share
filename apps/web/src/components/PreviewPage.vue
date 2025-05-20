<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Navigation Bar -->
    <Header v-if="!isFullscreen">
      <template #right>
        <div class="flex space-x-3">
          <button
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

        <div
          v-else-if="error"
          class="p-8 text-center text-red-600 flex-1 flex items-center justify-center"
        >
          {{ error }}
        </div>

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
  </div>
</template>

<script setup lang="ts">
import { Download, Maximize2, Minimize2, Save } from "lucide-vue-next";
import { onMounted, ref } from "vue";
import JsonViewer from "vue-json-viewer";
import { useRouter } from "vue-router";
import { sharesService } from "../services";
import Footer from "./Footer.vue";
import Header from "./Header.vue";

const router = useRouter();
const jsonData = ref<any>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);
const isFullscreen = ref(false);

const toggleFullscreen = (): void => {
  isFullscreen.value = !isFullscreen.value;
};

const loadJsonFile = async () => {
  try {
    // Extract share ID from URL
    const pathParts = window.location.pathname.split("/");
    const shareId = pathParts[pathParts.length - 1];

    try {
      const response = await sharesService.getShareDetail(shareId);
      // Parse JSON content from the response
      jsonData.value = response.json_content
        ? JSON.parse(response.json_content)
        : null;
    } catch (apiError: any) {
      // Check for error code in the API response
      if (apiError.code) {
        router.push("/invalid");
        return;
      }
      throw apiError; // Rethrow to be caught by the outer catch
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Failed to load JSON data";
    console.error("Error loading JSON data:", e);
    // Redirect to InvalidPage on error
    router.push("/invalid");
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  loadJsonFile();
});

const handleSave = (): void => {
  try {
    // Create a JSON string with proper formatting
    const jsonString = JSON.stringify(jsonData.value, null, 2);

    // Create a Blob containing the JSON data
    const blob = new Blob([jsonString], { type: "application/json" });

    // Create a URL for the Blob
    const url = URL.createObjectURL(blob);

    // Open the JSON in a new tab
    window.open(url, "_blank");

    // Clean up the URL object
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);
  } catch (e) {
    console.error("Error saving JSON:", e);
    alert("Failed to save JSON data");
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
