<script lang="ts" setup>
import { useBanner, type Banner, type BannerType } from "../composables/banner";
import { ref } from "vue";

const type = ref<BannerType>("info");
const message = ref<string>("hallo");
const show = ref<boolean>(false);

let to: ReturnType<typeof setTimeout>;

const quene: Banner[] = [];

function load(b: Banner): void {
  quene.push(b);

  //? check if banner is currently active
  if (quene.at(1)) return;

  message.value = b.message;
  type.value = b.type;
  show.value = true;

  to = setTimeout(() => close(), b.timeout);
}

function close() {
  if (show.value === false) return;

  show.value = false;
  clearTimeout(to);
  quene.shift();

  if (quene.length > 0) setTimeout(() => load(quene.shift()!), 800);
}

useBanner(load);
</script>

<template>
  <transition>
    <section v-if="show" @click="close()" :class="[type]" class="banner">
      <p>{{ message }}</p>
    </section>
  </transition>
</template>

<style lang="scss" scoped>
section.banner {
  justify-content: center;
  background: var(--srf);
  align-items: center;
  cursor: pointer;
  position: fixed;
  display: flex;
  padding: 1rem;
  z-index: 10;
  width: 100%;
  left: 0;
  top: 0;

  &.info {
    background: var(--p1);
    color: #fff;
  }
  &.error {
    background: #900;
    color: #fff;
  }

  &.v-enter-from,
  &.v-leave-to {
    transform: translateY(-100%);
  }
  &.v-enter-to,
  &.v-leave-from {
    transform: translateY(0);
  }
  &.v-enter-active,
  &.v-leave-active {
    transition: transform 800ms;
  }

  p {
    text-align: center;
  }
}
</style>
