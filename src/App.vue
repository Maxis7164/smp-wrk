<script setup lang="ts">
import { loadTheme } from "./theme";

import Modal from "./components/Modal.vue";
import Banner from "./components/Banner.vue";

loadTheme();
</script>

<template>
  <suspense>
    <router-view />
  </suspense>
  <Modal />
  <Banner />
</template>

<style scoped></style>
