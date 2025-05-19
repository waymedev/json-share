<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Navigation Bar -->
    <Header>
      <template #right>
        <div class="flex space-x-3">
          <button
              @click="createNewShare"
              class="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded flex items-center"
          >
            <Plus class="h-4 w-4 mr-2" />
            New File
          </button>
        </div>
      </template>
    </Header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8 flex-1 max-w-6xl">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-800 mb-6">My Files</h1>

        <!-- Filter Buttons -->
        <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div class="flex space-x-2">
            <button
                @click="activeFilter = 'all'"
                class="px-4 py-2 rounded-md transition-colors"
                :class="activeFilter === 'all' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
            >
              All
            </button>
            <button
                @click="activeFilter = 'shared'"
                class="px-4 py-2 rounded-md transition-colors"
                :class="activeFilter === 'shared' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
            >
              Shared
            </button>
          </div>
        </div>

        <!-- Files List -->
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-100">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  File Name
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expires
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="file in filteredFiles" :key="file.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <FileText class="flex-shrink-0 h-5 w-5 text-gray-500 mr-3" />
                    <div class="text-sm font-medium text-gray-900">{{ file.name }}</div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(file.createdAt) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(file.expiresAt) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex space-x-2">
                    <button
                        @click="copyShareLink(file)"
                        class="text-emerald-600 hover:text-emerald-900"
                        title="Copy Share Link"
                    >
                      <Link class="h-5 w-5" />
                    </button>
                    <button
                        @click="extendExpiration(file)"
                        class="text-blue-600 hover:text-blue-900"
                        title="Extend Expiration"
                    >
                      <Clock class="h-5 w-5" />
                    </button>
                    <button
                        @click="deleteFile(file)"
                        class="text-red-600 hover:text-red-900"
                        title="Delete"
                    >
                      <Trash2 class="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>

              <!-- Empty state -->
              <tr v-if="filteredFiles.length === 0">
                <td colspan="4" class="px-6 py-10 text-center text-gray-500">
                  <div class="flex flex-col items-center">
                    <FileQuestion class="h-12 w-12 text-gray-400 mb-3" />
                    <p class="text-lg font-medium">No files found</p>
                    <p class="text-sm mt-1">
                      {{ activeFilter === 'all' ? 'You haven\'t uploaded any files yet.' : 'You haven\'t shared any files yet.' }}
                    </p>
                  </div>
                </td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
   <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { FileText, Share, Plus, RefreshCw, Link, Clock, Trash2, FileQuestion } from 'lucide-vue-next';
import Header from './Header.vue';
import Footer from './Footer.vue';

// Types
interface SharedFile {
  id: string;
  name: string;
  createdAt: Date;
  expiresAt: Date;
  isShared: boolean;
  shareLink?: string;
}

// State
const activeFilter = ref<'all' | 'shared'>('all');
const files = ref<SharedFile[]>([
  {
    id: '1',
    name: 'project-proposal.txt',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    isShared: true,
    shareLink: 'https://sharefiles.example/s/abc123'
  },
  {
    id: '2',
    name: 'meeting-notes.txt',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    expiresAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
    isShared: true,
    shareLink: 'https://sharefiles.example/s/def456'
  },
  {
    id: '3',
    name: 'ideas.txt',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    isShared: false
  },
  {
    id: '4',
    name: 'feedback.txt',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    expiresAt: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // 25 days from now
    isShared: true,
    shareLink: 'https://sharefiles.example/s/ghi789'
  }
]);

// Computed
const filteredFiles = computed(() => {
  if (activeFilter.value === 'all') {
    return files.value;
  } else {
    return files.value.filter(file => file.isShared);
  }
});

// Methods
const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
};

const createNewShare = (): void => {
  alert('Navigate to create new share page');
};

const refreshList = (): void => {
  alert('Refreshing file list...');
  // In a real app, you would fetch the latest data here
};

const copyShareLink = (file: SharedFile): void => {
  if (file.shareLink) {
    navigator.clipboard.writeText(file.shareLink)
        .then(() => {
          alert(`Share link for "${file.name}" copied to clipboard!`);
        })
        .catch(err => {
          console.error('Failed to copy link: ', err);
          alert('Failed to copy link to clipboard');
        });
  } else {
    alert(`File "${file.name}" is not shared yet.`);
  }
};

const extendExpiration = (file: SharedFile): void => {
  alert(`Extend expiration for "${file.name}"`);
  // In a real app, you would open a modal or navigate to extend expiration
};

const deleteFile = (file: SharedFile): void => {
  if (confirm(`Are you sure you want to delete "${file.name}"?`)) {
    // In a real app, you would call an API to delete the file
    files.value = files.value.filter(f => f.id !== file.id);
    alert(`File "${file.name}" deleted successfully!`);
  }
};
</script>

<style scoped>
/* Additional custom styles can be added here if needed */
@media (max-width: 640px) {
  table {
    display: block;
    overflow-x: auto;
  }
}
</style>