<script setup lang="ts">
import { useTheme } from "@composables/theme";
import { LoadFirebaseError } from "src/fire";
import { useFirebaseAuth } from "vuefire";
import { ref } from "vue";

import Banner from "@components/Banner.vue";
import Modal from "@components/Modal.vue";

if (import.meta.env.DEV) document.title = "Simpler Work (DEV)";

const auth = useFirebaseAuth();

useTheme();

const err = ref<LoadFirebaseError>();

// loadTheme();

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
      <transition :name="route.meta.transition as string ?? 'slide-in'">
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
  --anim-speed: 0.4s;

  transition: background-color 250ms;
  background: var(--bg);
  position: absolute;
  height: 100dvh;
  padding: 1rem;
  width: 100dvw;
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

div.wrap.slide-in-enter-active,
div.wrap.slide-in-leave-active,
div.wrap.slide-out-enter-active,
div.wrap.slide-out-leave-active {
  transition: transform var(--anim-speed) ease-out,
    filter var(--anim-speed) ease-out;
}

.slide-in-enter-active,
.slide-out-leave-active {
  z-index: 20;
}

.slide-in-enter-from {
  transform: translate(100%);
}
.slide-in-enter-to {
  transform: translate(0);
}
.slide-in-leave-from {
  transform: translate(0);
  filter: blur(0) brightness(100%);
}
.slide-left-leave-to {
  transform: translate(-30%);
  filter: blur(0.5rem) brightness(50%);
}

.slide-out-enter-from {
  transform: translate(-30%);
  filter: blur(0.5rem) brightness(50%);
}
.slide-out-enter-to {
  transform: translate(0);
  filter: blur(0) brightness(100%);
}
.slide-out-leave-from {
  transform: translate(0);
}
.slide-out-leave-to {
  transform: translate(100%);
}
</style>
