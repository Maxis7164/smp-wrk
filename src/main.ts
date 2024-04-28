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
import Hours from "./pages/Hours.vue";

const app = createApp(App);

//? prevent service worker from working in localhost to prevent stale app
if (location.hostname !== "localhost")
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("./sw.js");

//#region VueRouter
const routes: RouteRecordRaw[] = [
  { path: "/", component: Home },
  { path: "/settings", component: Settings },
  { path: "/load", component: Load, meta: { anonymous: true } },
  { path: "/login", component: Login, meta: { anonymous: true } },
  { path: "/settings/editProfile", component: EditProfile },
  { path: "/editHours", component: EditHours },
  { path: "/hours", component: Hours },
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

router.beforeEach((to) => {
  if (to.meta.anonymous === true || localStorage.getItem("smp-wrk/isLoggedIn"))
    return true;
  else return { path: "/load", query: { redir: to.path } };
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
