<script lang="ts" setup>
import { onUnmounted, ref } from "vue";
import { Banner, BannerType, listen } from "./banner";

const translate = ref<Record<string, unknown> | unknown[]>([]);
const type = ref<BannerType>("info");
const message = ref<string>("asd");

const display = ref<boolean>(false);
const show = ref<boolean>(false);

let active: boolean = false;
const quene: Banner[] = [];

function buildBanner(banner: Banner) {
  if (active) return quene.push(banner);
  active = true;

  type.value = banner.type;
  message.value = banner.message;
  translate.value = banner.translate;

  display.value = true;
  setTimeout(() => (show.value = true), 100);

  setTimeout(close, banner.duration + 800);
}

onUnmounted(listen(buildBanner, close));

function close(): void {
  show.value = false;

  setTimeout(() => {
    display.value = false;
    active = false;

    if (quene.length > 0) buildBanner(quene.shift()!);
  }, 800);
}

const $t: (...args: any[]) => void = () => null; //? placeholder for vue-i18n
</script>

<template>
  <section
    @click="close"
    :hidden="!display"
    :class="{ show, [type]: true }"
    class="banner"
  >
    <p>
      {{ message.at(0) === "@" ? $t(message.slice(1), translate) : message }}
    </p>
  </section>
</template>

<style lang="scss" scoped>
section.banner {
  transform: translateY(-100%);
  transition: transform 800ms;
  background: #009;
  padding: 0.75rem;
  position: fixed;
  cursor: pointer;
  width: 100vw;
  z-index: 10;
  left: 0;
  top: 0;

  &.error {
    background: #900;
  }

  &.show {
    transform: translateY(0);
  }

  p {
    text-align: center;
    user-select: none;
    color: #fff;
  }
}
</style>
