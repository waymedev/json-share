import { defineStore } from "pinia";
import { ref } from "vue";

export const useUserStore = defineStore("user", () => {
  const userId = ref<string | null>(null);

  const setUserId = (id: string) => {
    userId.value = id;
    localStorage.setItem("user_id", id);
  };

  const getUserId = (): string | null => {
    return userId.value;
  };

  return {
    userId,
    setUserId,
    getUserId,
  };
});
