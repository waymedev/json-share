<template>
  <header class="bg-white shadow sticky top-0 z-10">
    <div class="container mx-auto px-4 py-4 flex items-center justify-between">
      <div class="flex items-center">
        <div
          @click="goToHome"
          class="cursor-pointer text-2xl font-bold text-emerald-600 flex items-center"
        >
          <Share class="mr-2" />
          <span>JSON-Share</span>
        </div>
      </div>
      <div class="flex space-x-3">
        <slot name="right"></slot>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { Share } from "lucide-vue-next";
import { useRouter } from "vue-router";

const router = useRouter();

const goToHome = () => {
  router.push("/");
};
</script>
