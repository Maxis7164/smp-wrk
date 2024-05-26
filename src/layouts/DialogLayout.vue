<script lang="ts" setup>
import Loading from "../components/Loading.vue";

defineProps<{ name: string; loading: boolean }>();
defineEmits<{ (e: "commit"): void }>();
</script>

<template>
  <div class="wrap">
    <header>
      <h1>{{ name }}</h1>
    </header>
    <main>
      <slot />
    </main>
    <footer>
      <button @click="$router.back()">Zurück</button>
      <button @click="$emit('commit')" class="high">Speichern</button>
    </footer>
    <Loading back :load="loading" />
  </div>
</template>

<style lang="scss" scoped>
header {
  transform: translate(-50%, -20%);
  text-align: center;
  position: absolute;
  left: 50%;
  top: 20%;

  h3 {
    transition: opacity 500ms;
  }
}
main {
  transform: translate(-50%, -55%);
  width: clamp(230px, 50%, 330px);
  position: absolute;
  left: 50%;
  top: 55%;
}
footer {
  transform: translate(-50%, 20%);
  justify-content: space-between;
  transition: opacity 500ms;
  position: absolute;
  display: flex;
  gap: 0.75rem;
  bottom: 15%;
  left: 50%;

  button {
    white-space: nowrap;
    margin-bottom: 10px;
    width: 100%;
  }
}
</style>
