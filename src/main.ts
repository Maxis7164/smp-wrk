import {
  NavigationGuardWithThis,
  RouteLocationNormalized,
  createRouter,
  createWebHashHistory,
  type RouteRecordRaw,
} from "vue-router";
import { VueFire, VueFireAuth, getCurrentUser } from "vuefire";
import { firebaseApp } from "src/fire";
import { createPinia } from "pinia";
import { createApp } from "vue";
import "./style.scss";

import App from "./App.vue";
import Home from "@pages/index.vue";
import Settings from "@pages/settings/index.vue";
import Load from "@pages/Load.vue";
import EditProfile from "@pages/settings/EditProfile.vue";
import EditHours from "@pages/EditHours.vue";
import Hours from "@pages/Hours.vue";
import Checkin from "@pages/Checkin.vue";
import Account from "@pages/settings/Account.vue";
import Profile from "@pages/profiles/[id].vue";

const app = createApp(App);

//? prevent service worker from working in localhost to prevent stale app
if (location.hostname !== "localhost" || import.meta.env.VITE_SW_DEV === "1")
  a: {
    break a;

    if ("serviceWorker" in navigator)
      navigator.serviceWorker.register("./sw.js");
  } //! sw malfunctioning

const testGuard: NavigationGuardWithThis<undefined> = () =>
  import.meta.env.DEV ? true : "/";

//#region VueRouter
const routes: RouteRecordRaw[] = [
  { path: "/", component: Home },
  { path: "/settings", component: Settings },
  { path: "/settings/editProfile", component: EditProfile },
  { path: "/settings/editProfile/:profile", component: EditProfile },
  { path: "/settings/account", component: Account },
  { path: "/load", component: Load, meta: { anonymous: true } },
  { path: "/editHours", component: EditHours },
  { path: "/hours", component: Hours },
  { path: "/hours/:profile", component: Profile },
  { path: "/check-in", component: Checkin },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

// page transition
const DIALOG = ["/settings/editProfile", "/checkin", "/editHours"];

const isDeeper = (to: number, from: number) => to < from;
const isHome = (to: RouteLocationNormalized) => to.fullPath === "/";
const isDialog = (r: RouteLocationNormalized) =>
  DIALOG.reduce((prev, curr) => prev || r.fullPath.includes(curr), false);

// page transition
router.afterEach((to, from) => {
  const toDepth = to.fullPath.split("/").length;
  const fromDepth = from.fullPath.split("/").length;

  to.meta.transition = isDialog(from)
    ? "slide-out"
    : isDeeper(toDepth, fromDepth) || isHome(to)
    ? "slide-out"
    : "slide-in";
});

// auth guard
// auth guard
// auth guard
// auth guard
router.beforeEach(async (to) => {
  if (to.meta.anonymous === true || (await getCurrentUser())) return true;
  else return { path: "/load", query: { redir: to.path } };
});

app.use(router);
//#endregion

//#region pinia
const pinia = createPinia();
app.use(pinia);
//#endregion

//#region VueFire

app.use(VueFire, {
  firebaseApp,
  modules: [VueFireAuth()],
});

//#endregion

app.mount("#app");
