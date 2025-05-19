<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Navigation Bar -->
    <Header>
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

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8 flex-1 max-w-4xl">
      <!-- Preview Area -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="p-4 bg-gray-100 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <span class="font-medium text-gray-700">JSON Preview</span>
          </div>
        </div>

        <div v-if="isLoading" class="p-8 text-center text-gray-600">
          Loading JSON data...
        </div>

        <div v-else-if="error" class="p-8 text-center text-red-600">
          {{ error }}
        </div>

        <json-viewer
          v-else
          :value="jsonData"
          :expand-depth="5"
          :expanded="true"
        ></json-viewer>
      </div>
    </main>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import { Download, FileText, Save } from "lucide-vue-next";
import { ref, onMounted } from "vue";
import Footer from "./Footer.vue";
import Header from "./Header.vue";
import JsonViewer from "vue-json-viewer";

const jsonData = ref<any>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);

const loadJsonFile = async () => {
  try {
    const response = await fetch("/10mb-sample.json");
    if (!response.ok) {
      throw new Error(`Failed to load JSON file: ${response.statusText}`);
    }
    jsonData.value = await response.json();
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Failed to load JSON file";
    console.error("Error loading JSON file:", e);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  loadJsonFile();
});

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
</style>
