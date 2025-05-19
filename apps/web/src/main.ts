import { createApp } from "vue";
import { createPinia } from "pinia";
import "./style.css";
import App from "./App.vue";
import router from "./router";
import uuidPlugin from "./plugins/uuid";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia).use(router).use(uuidPlugin).mount("#app");
