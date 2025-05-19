import type { App } from 'vue'
import { useUUID } from '../composables/useUUID'

export default {
  install: (app: App) => {
    const { initializeUserId } = useUUID()
    initializeUserId()
  }
} 