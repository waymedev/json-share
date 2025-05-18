<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Navigation Bar -->
    <header class="bg-white shadow sticky top-0 z-10">
      <div
        class="container mx-auto px-4 py-4 flex items-center justify-between"
      >
        <div class="flex items-center">
          <div class="text-2xl font-bold text-emerald-600 flex items-center">
            <FileText class="mr-2" />
            <span>TextPreview</span>
          </div>
        </div>
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
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8 flex-1 max-w-4xl">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-800 mb-2">Text Preview</h1>
      </div>

      <!-- Preview Area -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="p-4 bg-gray-100 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <span class="font-medium text-gray-700">Content</span>
            <span class="text-sm text-gray-500"
              >{{ text.length }} characters</span
            >
          </div>
        </div>
        <textarea
          v-model="text"
          class="w-full min-h-[400px] p-4 border-0 focus:outline-none focus:ring-0 rounded-none resize-none"
          placeholder="Enter your text here for preview..."
        ></textarea>
      </div>
    </main>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import { Download, FileText, Save } from "lucide-vue-next";
import { ref } from "vue";
import Footer from "./Footer.vue";

// State
const text = ref<string>(
  "This is a sample text that you can edit. The content will be displayed here for preview."
);

// Methods
const handleSave = (): void => {
  // Save functionality would go here
  alert("Text saved successfully!");
};

const handleDownload = (): void => {
  // Create a blob with the text content
  const blob = new Blob([text.value], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  // Create a temporary anchor element to trigger the download
  const a = document.createElement("a");
  a.href = url;
  a.download = "text-preview.txt";
  document.body.appendChild(a);
  a.click();

  // Clean up
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
</script>

<style scoped>
/* Additional custom styles can be added here if needed */
textarea:focus {
  outline: none;
  box-shadow: none;
}
</style>
