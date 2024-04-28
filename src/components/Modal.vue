<script lang="ts" setup>
import { onUnmounted, ref } from "vue";
import { listen, Modal, ModalType } from "./modal";

const type = ref<ModalType>("alert");

const inp = ref<string>("");

const inpEl = ref<HTMLElement | null>(null);
const display = ref<boolean>(false);
const reverse = ref<boolean>(false);
const showBox = ref<boolean>(false);
const show = ref<boolean>(false);
const msg = ref<string[]>([]);

let exit: number = -1;
let cur = ref<Modal<any> | null>(null);
const quene: Modal<any>[] = [];

function buildModal(modal: Modal<any>) {
  if (exit > -1) {
    clearTimeout(exit);
    exit = -1;
    setTimeout(() => continueInQuene());
  }

  if (cur.value) return quene.push(modal);
  cur.value = modal;

  msg.value = modal.message.split("\n");
  inp.value = "";
  type.value = modal.type;
  reverse.value = modal.switchControls;

  display.value = true;

  setTimeout(() => {
    show.value = showBox.value = true;
    inpEl.value?.focus();
  }, 1);
}

onUnmounted(listen(buildModal));

function resolve(val: number): void {
  if (!cur.value) return;

  switch (type.value) {
    case "alert":
      cur.value.fns[0](undefined);
      break;
    case "prompt":
      if (val === -2) cur.value.fns[0](inp.value);
      else if (val === -1) cur.value.fns[0](null);
      else
        cur.value.fns[1](`Invalid response value "${val}" for prompt modal!`);
      break;
    case "confirm":
      if (val < 0) cur.value.fns[0](!!(val + 1));
      else
        cur.value.fns[1](`Invalid response value "${val}" for confirm modal!`);
      break;
    case "choose":
      if (val === -1) cur.value.fns[0](null);
      else if (val >= 0) cur.value.fns[0](val ?? null);
      else
        cur.value.fns[1](`Invalid response value "${val}" for choose modal!`);
      break;
  }

  continueInQuene();
}

function continueInQuene(): void {
  showBox.value = false;

  if (quene.length > 0) {
    setTimeout(() => {
      cur.value = null;
      const nxt = quene.shift();

      if (nxt) buildModal(nxt);
    }, 400);
  } else {
    show.value = false;

    exit = setTimeout(() => {
      display.value = !!(cur.value = null);
      exit = -1;
    }, 800) as unknown as number;
  }
}
</script>

<template>
  <div v-if="display" :class="{ show }" class="back">
    <section :class="{ show: showBox }" class="box">
      <header>
        <h2>{{ cur?.title ?? "" }}</h2>
        <p :class="{ space: txt.startsWith('\\') }" v-for="txt in msg">
          {{ txt.split("\\").join("") }}
        </p>
      </header>
      <main>
        <input
          ref="inpEl"
          v-if="type === 'prompt'"
          @keydown.enter="resolve(-2)"
          v-model="inp"
          :placeholder="cur?.placeholder ?? ''"
          type="text"
        />
      </main>
      <footer :class="{ reverse }">
        <button v-if="type !== 'alert'" @click="resolve(-1)">
          <!-- {{ $t('cancel') }} -->
          {{ type === "confirm" ? "No" : "Cancel" }}
        </button>
        <button @click="resolve(i)" v-for="(b, i) in cur?.buttons ?? []">
          {{ b }}
        </button>
        <button v-if="type !== 'choose'" @click="resolve(-2)" class="high">
          {{ type === "confirm" ? "Yes" : "Ok" }}
        </button>
      </footer>
    </section>
  </div>
</template>

<style lang="scss" scoped>
div.back {
  transition: opacity 800ms, backdrop-filter 800ms;
  backdrop-filter: blur(6px);
  background: #0002;
  position: fixed;
  height: 100vh;
  width: 100vw;
  opacity: 0;
  z-index: 9;
  left: 0;
  top: 0;

  &.show {
    opacity: 1;
  }

  section.box {
    transform: translate(-50%, -40%);
    width: clamp(190px, 35%, 500px);
    transition: opacity 400ms;
    flex-direction: column;
    text-align: center;
    position: absolute;
    display: flex;
    opacity: 0;
    left: 50%;
    gap: 20px;
    top: 40%;

    &.show {
      opacity: 1;
    }

    header {
      h2 {
        margin-bottom: 10px;
      }

      p.space {
        margin-top: 5px;
      }
    }

    main input {
      width: 80%;
    }

    footer {
      justify-content: center;
      display: inline-flex;
      gap: 5px;

      &.reverse {
        flex-direction: row-reverse;
      }
    }
  }
}
</style>
