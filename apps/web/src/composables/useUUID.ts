import { v4 as uuidv4 } from "uuid";
import { useUserStore } from "../stores/user";

export const useUUID = () => {
  const userStore = useUserStore();

  const initializeUserId = (): string => {
    // Check localStorage first
    let userId = localStorage.getItem("user_id");

    // If no userId exists, generate a new one
    if (!userId) {
      userId = uuidv4();
      localStorage.setItem("user_id", userId);
    }

    // Set in store
    userStore.setUserId(userId);
    return userId;
  };

  return {
    initializeUserId,
  };
};
