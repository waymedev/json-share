<template>
  <Transition
    enter-active-class="ease-out duration-300"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="ease-in duration-200"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="show"
      class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity z-40"
    ></div>
  </Transition>

  <Transition
    enter-active-class="ease-out duration-300"
    enter-from-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
    enter-to-class="opacity-100 translate-y-0 sm:scale-100"
    leave-active-class="ease-in duration-200"
    leave-from-class="opacity-100 translate-y-0 sm:scale-100"
    leave-to-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
  >
    <div
      v-if="show"
      class="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div
        class="flex min-h-screen items-end justify-center p-4 text-center sm:items-center sm:p-0"
      >
        <div
          class="relative w-full transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:max-w-lg sm:p-6"
        >
          <div class="flex items-start">
            <div
              class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 sm:h-10 sm:w-10"
            >
              <CheckCircle
                class="h-6 w-6 text-emerald-600"
                aria-hidden="true"
              />
            </div>
            <div class="ml-4 flex-1">
              <h3
                class="text-base font-semibold leading-6 text-gray-900"
                id="modal-title"
              >
                {{ title }}
              </h3>
              <div class="mt-2">
                <p class="text-sm text-gray-500">
                  {{ message }}
                </p>
                <div v-if="shareLink" class="mt-4">
                  <div
                    class="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-2"
                  >
                    <div class="min-w-0 flex-1">
                      <span
                        class="block text-sm font-medium text-gray-600"
                        :title="shareLink"
                        >{{ truncatedLink }}</span
                      >
                    </div>
                    <button
                      type="button"
                      class="flex-shrink-0 rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                      @click="handleCopy"
                      aria-label="Copy link"
                    >
                      <Copy class="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              class="inline-flex w-full justify-center rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 sm:ml-3 sm:w-auto"
              @click="handleClose"
            >
              确定
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { CheckCircle, Copy } from "lucide-vue-next";
import { computed } from "vue";

interface Props {
  show: boolean;
  title: string;
  message: string;
  shareLink?: string;
}

interface Emits {
  (e: "close"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// TODO 截断分享链接
const truncatedLink = computed(() => {
  if (!props.shareLink) return "";

  return props.shareLink;

  //   const url = props.shareLink;
  //   if (url.length <= 50) return url;

  //   const start = url.slice(0, 25);
  //   const end = url.slice(-25);
  //   return `${start}...${end}`;
});

const handleClose = () => {
  emit("close");
};

const handleCopy = async () => {
  if (props.shareLink) {
    try {
      await navigator.clipboard.writeText(props.shareLink);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  }
};
</script>
