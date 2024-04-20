import {
  createRouter,
  createWebHashHistory,
  type RouteRecordRaw,
} from "vue-router";
import { createApp } from "vue";
import "./style.scss";

import App from "./App.vue";
import Home from "./pages/Home.vue";
import Settings from "./pages/Settings.vue";
import Load from "./pages/Load.vue";

const routes: RouteRecordRaw[] = [
  { path: "/", component: Home },
  { path: "/settings", component: Settings },
  { path: "/load", component: Load },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

const app = createApp(App);

app.use(router);

app.mount("#app");
