import {
  createRouter,
  createWebHashHistory,
  type RouteRecordRaw,
} from "vue-router";
import { createApp } from "vue";
import "./style.scss";
import { VueFire, VueFireAuth } from "vuefire";
import { firebaseApp } from "./fire";

import App from "./App.vue";
import Home from "./pages/Home.vue";
import Settings from "./pages/Settings.vue";
import Load from "./pages/Load.vue";
import Login from "./pages/Login.vue";

const app = createApp(App);

//#region VueRouter
const routes: RouteRecordRaw[] = [
  { path: "/", component: Home },
  { path: "/settings", component: Settings },
  { path: "/load", component: Load },
  { path: "/login", component: Login },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

app.use(router);
//#endregion

//#region VueFire

app.use(VueFire, {
  firebaseApp,
  modules: [VueFireAuth()],
});

//#endregion

app.mount("#app");
