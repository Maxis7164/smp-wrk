<script lang="ts" setup>
import { ref } from "vue";

const props = defineProps<{ default: number }>();
const emit = defineEmits<{ (e: "update" | "click", value: number): void }>();

const val = ref<number>(props.default ?? 0);

function click(nxt: number): void {
  if (val.value !== nxt) {
    val.value = nxt;
    emit("update", nxt);
  }

  emit("click", val.value);
}
</script>

<template>
  <div class="slider">
    <div class="slide" :class="{ mid: val === 2, end: val === 1 }" />
    <button @click="click(0)" class="text">Hell</button>
    <button @click="click(2)" class="text">System</button>
    <button @click="click(1)" class="text">Dunkel</button>
  </div>
</template>

<style lang="scss" scoped>
div.slider {
  justify-content: space-around;
  background: var(--srf);
  border-radius: 1rem;
  position: relative;
  display: flex;
  width: 100%;

  button {
    padding: 1rem;
    height: 100%;
    width: 33.3%;
    z-index: 2;
  }

  div.slide {
    transition: left 300ms;
    background: var(--p);
    border-radius: 1rem;
    position: absolute;
    opacity: 25%;
    height: 100%;
    width: 33.3%;
    left: 0;

    &.mid {
      left: 33.3%;
    }
    &.end {
      left: 66.6%;
    }
  }
}
</style>
