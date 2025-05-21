import { createRouter, createWebHistory } from "vue-router";
import HomePage from "./layout/HomePage.vue";
import LibraryPage from "./layout/LibraryPage.vue";
import PreviewPage from "./layout/PreviewPage.vue";

const routes = [
  { path: "/", component: HomePage },
  { path: "/preview/:fileId", component: PreviewPage },
  { path: "/share/:shareId", component: PreviewPage },
  { path: "/library", component: LibraryPage },
];

export default createRouter({
  history: createWebHistory(), // HTML5 History 模式
  routes,
});
