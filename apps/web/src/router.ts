import { createRouter, createWebHistory } from 'vue-router';
import HomePage from "./components/HomePage.vue";
import PreviewPage from "./components/PreviewPage.vue";
import UserLibrary from "./components/UserLibrary.vue";

const routes = [
    { path: '/', component: HomePage },
    { path: '/preview/:fileId', component: PreviewPage },
    { path: '/share/:shareId', component: PreviewPage },
    { path: '/library', component: UserLibrary },
]

export default createRouter({
    history: createWebHistory(), // HTML5 History 模式
    routes
})