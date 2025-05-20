import { createRouter, createWebHistory } from "vue-router";
import HomePage from "./components/HomePage.vue";
import InvalidPage from "./components/InvalidPage.vue";
import PreviewPage from "./components/PreviewPage.vue";
import UserLibrary from "./components/UserLibrary.vue";

const routes = [
  { path: "/", component: HomePage },
  { path: "/preview/:fileId", component: PreviewPage },
  { path: "/share/:shareId", component: PreviewPage },
  { path: "/library", component: UserLibrary },
  { path: "/invalid", component: InvalidPage },
];

export default createRouter({
  history: createWebHistory(), // HTML5 History 模式
  routes,
});
