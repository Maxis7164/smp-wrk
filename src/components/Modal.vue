<script lang="ts" setup>
import { call } from "./banner";
import {
  CheckupFunction,
  __awnserModal__,
  listen,
  type Modal,
  type ModalResults,
} from "./modal";
import { ref, shallowRef, onUnmounted } from "vue";

const DUMMY: CheckupFunction = (_: string) => "";

const mod = shallowRef<Modal<keyof ModalResults>>({
  buttons: ["Ok", "Cancel"],
  type: "alert",
  message: "",
  title: "",
});

const trans = ref<boolean>(false);
const show = ref<boolean>(false);
const inp = ref<string>("");

const unsub = listen((modal) =>
  setTimeout(
    () => {
      mod.value = modal;
      inp.value = "";
      show.value = trans.value = true;

      console.log(modal);
    },
    show.value ? 400 : 0
  )
);

function close(exit: number): void {
  switch (mod.value.type) {
    case "alert":
      show.value = __awnserModal__(undefined);
      break;
    case "prompt":
      const invalid = (mod.value.checkup ?? DUMMY)(inp.value);

      if (invalid.length > 0) return call("info", invalid);
      else show.value = __awnserModal__(exit ? inp.value : "");
      break;
    case "confirm":
      show.value = __awnserModal__(!!exit);
      break;
  }

  trans.value = false;
}

onUnmounted(() => unsub());
</script>

<template>
  <Transition>
    <div v-if="show" class="back">
      <Transition>
        <section v-if="trans" class="modal">
          <h2>{{ mod.title }}</h2>
          <main>
            <p>{{ mod.message }}</p>
            <input v-if="mod.type === 'prompt'" v-model="inp" type="text" />
          </main>
          <footer>
            <button @click="close(0)" v-if="mod.type !== 'alert'">
              {{ mod.buttons[1] }}
            </button>
            <button @click="close(1)">{{ mod.buttons[0] }}</button>
          </footer>
        </section>
      </Transition>
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
div.back {
  backdrop-filter: blur(4px) brightness(50%);
  position: fixed;
  height: 100dvh;
  width: 100dvw;
  z-index: 10;
  left: 0;
  top: 0;

  &.v-enter-active,
  &.v-leave-active {
    transition: opacity 800ms ease;
  }

  &.v-enter-from,
  &.v-leave-to {
    opacity: 0;
  }

  section {
    transform: translate(-50%, -40%);
    width: clamp(275px, 50%, 800px);
    flex-direction: column;
    border-radius: 1.25rem;
    background: var(--bg);
    position: absolute;
    display: flex;
    padding: 1rem;
    gap: 1rem;
    left: 50%;
    top: 40%;

    &.v-enter-active,
    &.v-leave-active {
      transition: opacity 400ms ease;
    }

    &.v-enter-from,
    &.v-leave-to {
      opacity: 0;
    }

    main input {
      margin-top: 0.5rem;
      width: 100%;
    }
    footer {
      display: inline-flex;
      align-self: end;
      gap: 0.25rem;
    }
  }
}
</style>
