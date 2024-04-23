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
import EditProfile from "./pages/EditProfile.vue";
import EditHours from "./pages/EditHours.vue";

const app = createApp(App);

//#region VueRouter
const routes: RouteRecordRaw[] = [
  { path: "/", component: Home, meta: { transition: "slide-right" } },
  { path: "/settings", component: Settings },
  { path: "/load", component: Load },
  { path: "/login", component: Login },
  { path: "/settings/editProfile", component: EditProfile },
  { path: "/editHours", component: EditHours },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.afterEach((to, from) => {
  const toDepth = to.path.split("/").length;
  const fromDepth = from.path.split("/").length;
  to.meta.transition =
    toDepth < fromDepth || to.path === "/" ? "slide-right" : "slide-left";
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
