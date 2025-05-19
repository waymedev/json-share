<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Navigation Bar -->
    <Header />

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8 flex-1 max-w-3xl flex flex-col items-center justify-center">
      <div class="bg-white rounded-lg shadow-md w-full p-8 text-center">
        <!-- Error Icon -->
        <div class="flex justify-center mb-6">
          <div class="bg-red-50 p-4 rounded-full">
            <XCircle class="h-20 w-20 text-red-500" />
          </div>
        </div>

        <!-- Error Message -->
        <h1 class="text-3xl font-bold text-gray-800 mb-4">Link Expired or Invalid</h1>
        <p class="text-gray-600 mb-6 text-lg">
          The link you're trying to access is no longer available or may have been removed.
        </p>

        <!-- Possible Reasons -->
        <div class="bg-gray-50 rounded-lg p-6 mb-6 text-left">
          <h2 class="text-lg font-semibold text-gray-700 mb-3">This could be because:</h2>
          <ul class="space-y-2 text-gray-600">
            <li class="flex items-start">
              <Clock class="h-5 w-5 text-gray-500 mr-2 flex-shrink-0 mt-0.5" />
              <span>The shared link has expired</span>
            </li>
            <li class="flex items-start">
              <Trash2 class="h-5 w-5 text-gray-500 mr-2 flex-shrink-0 mt-0.5" />
              <span>The file has been deleted by the owner</span>
            </li>
            <li class="flex items-start">
              <Link class="h-5 w-5 text-gray-500 mr-2 flex-shrink-0 mt-0.5" />
              <span>The link URL is incorrect or incomplete</span>
            </li>
          </ul>
        </div>

        <!-- Actions -->
        <div class="flex flex-col sm:flex-row justify-center gap-4">
          <button
              @click="goToHomePage"
              class="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-6 rounded-md flex items-center justify-center"
          >
            <Home class="h-5 w-5 mr-2" />
            Go to Homepage
          </button>
        </div>
      </div>

      <!-- Additional Help -->
      <div class="mt-8 text-center text-gray-500">
        <p>Need help? <button @click="getSupport" class="text-emerald-600 hover:underline">Contact Support</button></p>
      </div>
    </main>

    <!-- Footer -->
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Share, Home, XCircle, Clock, Trash2, Link, Mail } from 'lucide-vue-next';
import Header from './Header.vue';
import Footer from './Footer.vue';

// State
const errorCode = ref<string>('ERR-404');
const linkId = ref<string>('abc123');

// Methods
const goToHomePage = (): void => {
  // In a real app, you would use Vue Router
  window.location.href = '/';
};

const contactOwner = (): void => {
  // In a real app, this would open a contact form or email client
  alert('Contact form would open here');
};

const getSupport = (): void => {
  // In a real app, this would navigate to support page
  alert('Support page would open here');
};

// You could also add a method to check if the link is actually expired or invalid
const checkLinkStatus = async (id: string): Promise<void> => {
  try {
    // In a real app, you would make an API call to check the link status
    // const response = await fetch(`/api/links/${id}`);
    // const data = await response.json();
    // Update UI based on the response
  } catch (error) {
    console.error('Error checking link status:', error);
  }
};

// For demonstration purposes, we could call this on component mount
// onMounted(() => {
//   checkLinkStatus(linkId.value);
// });
</script>

<style scoped>
/* Additional custom styles can be added here if needed */
</style>