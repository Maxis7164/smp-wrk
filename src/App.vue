<script setup lang="ts">
import { loadTheme } from "./theme";

import Modal from "./components/Modal.vue";
import Banner from "./components/Banner.vue";

loadTheme();
</script>

<template>
  <suspense>
    <router-view v-slot="{ Component, route }">
      <transition :name="route.meta.transition as string ?? 'slide-left'">
        <component :is="Component" />
      </transition>
    </router-view>
  </suspense>
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
