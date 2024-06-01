<script lang="ts" setup>
import BackButton from "../components/BackButton.vue";

defineProps<{ name: string; isHome?: boolean }>();
</script>

<template>
  <div class="wrap">
    <header>
      <h1>{{ name }}</h1>
    </header>
    <main class="content">
      <slot />
    </main>
    <BackButton v-if="!isHome" />
  </div>
</template>

<style lang="scss" scoped>
div.wrap {
  padding-bottom: 2rem;
  overflow-y: auto;
}

header {
  background: var(--bg);
  padding: 1.25rem 0;
  max-width: 500px;
  position: sticky;
  margin: 0 auto;
  z-index: 2;
  top: -1rem;
}

main.content {
  max-width: 500px;
  margin: 0 auto;
  width: 100%;
}

//? min-width: 680px -> footer buttons don't sit in front of ui - no extra scroll space needed
@media screen and (min-width: 680px) {
  div.wrap {
    padding-bottom: 0;
  }
}
</style>
