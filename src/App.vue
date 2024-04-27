<script setup lang="ts">
import { LoadFirebaseError } from "./fire";
import { useFirebaseAuth } from "vuefire";
import { loadTheme } from "./theme";
import { ref } from "vue";

import Modal from "./components/Modal.vue";
import Banner from "./components/Banner.vue";

const auth = useFirebaseAuth();

const err = ref<LoadFirebaseError>();

loadTheme();

if (auth)
  auth.onAuthStateChanged((user) => {
    if (user)
      localStorage.setItem("smp-wrk/isLoggedIn", "This is a filler text :)");
    else localStorage.removeItem("smp-wrk/isLoggedIn");
  });
else console.error((err.value = new LoadFirebaseError("auth/none")));

const reload = () => location.reload();
</script>

<template>
  <suspense v-if="auth">
    <router-view v-slot="{ Component, route }">
      <transition :name="route.meta.transition as string ?? 'slide-left'">
        <component :is="Component" />
      </transition>
    </router-view>
  </suspense>
  <div class="no-firebase" v-if="!auth">
    <h1>Oops...</h1>
    <p>
      Something unexpected happened while loading the page - we're sorry for the
      inconveiniance.
    </p>
    <p>
      Error Code: <code>{{ err?.code }}</code>
    </p>
    <button @click="reload">Reload page</button>
  </div>
  <Modal />
  <Banner />
</template>

<style lang="scss" scoped>
div.wrap {
  --anim-speed: 0.3s;

  transition: background-color 250ms;
  background: var(--bg);
  position: absolute;
  min-height: 100dvh;
  min-width: 100dvw;
  padding: 1rem;
  top: 0;
}

div.no-firebase {
  transform: translate(-50%, -55%);
  width: clamp(300px, 80%, 900px);
  position: absolute;
  left: 50%;
  top: 55%;

  h1 {
    margin-bottom: 1rem;
  }
  p {
    margin-bottom: 0.5rem;

    code {
      margin-left: 0.5rem;
      font-size: 1rem;
    }
  }
  button {
    margin: 10rem auto 0 auto;
    display: block;
  }
}

div.wrap.slide-left-enter-active,
div.wrap.slide-left-leave-active,
div.wrap.slide-right-enter-active,
div.wrap.slide-right-leave-active {
  transition: left var(--anim-speed) ease-out, right var(--anim-speed) ease-out,
    filter var(--anim-speed) ease-out;
}

.slide-right-leave-active {
  z-index: 200;
  opacity: 1;
}
.slide-right-enter-active {
  z-index: 1;
}

.slide-left-enter-from {
  position: absolute;
  right: -100%;
}
.slide-left-enter-to {
  position: absolute;
  right: 0;
}
.slide-left-leave-from {
  filter: brightness(100%);
  position: absolute;
  right: 0;
}
.slide-left-leave-to {
  filter: brightness(50%);
  position: absolute;
  right: 30%;
}

.slide-right-enter-from {
  filter: brightness(50%);
  position: absolute;
  left: -30%;
}
.slide-right-enter-to {
  filter: brightness(100%);
  position: absolute;
  left: 0;
}
.slide-right-leave-from {
  position: absolute;
  left: 0;
}
.slide-right-leave-to {
  position: absolute;
  left: 100%;
}
</style>
