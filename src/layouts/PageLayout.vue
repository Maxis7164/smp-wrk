<script lang="ts" setup>
import BackButton from "../components/BackButton.vue";

defineProps<{ name: string; isHome?: boolean }>();
</script>

<template>
  <div class="wrap">
    <header>
      <h1>{{ name }}</h1>
    </header>
    <slot />
    <BackButton v-if="!isHome" />
  </div>
</template>

<style lang="scss" scoped>
div.wrap {
  overflow-y: auto;
  padding-bottom: 2rem;
}

header {
  background: var(--bg);
  padding: 1.25rem 0;
  position: sticky;
  z-index: 2;
  top: -1rem;
}

// footer {
//   height: 50px;

//   button {
//     --size: 2.25rem;

//     transition: right var(--anim-speed) ease-out, background-color 250ms;
//     height: calc(var(--size) + 24px);
//     width: calc(var(--size) + 24px);
//     box-shadow: 0 0 4px 4px #0004;
//     position: fixed;
//     bottom: 1rem;
//     right: 1rem;

//     svg {
//       margin-right: 0;
//     }
//   }
// }

.wrap.slide-left-enter-from button.add {
  right: calc(100% + 1rem);
}
.wrap.slide-left-enter-to button.add {
  right: 1rem;
}
.wrap.slide-right-leave-from button.add {
  right: 1rem;
}
.wrap.slide-right-leave-to button.add {
  right: calc(100% + 1rem);
}
</style>
