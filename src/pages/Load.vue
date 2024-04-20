<script lang="ts" setup>
import { ref } from "vue";

const load = ref<boolean>(false);

setTimeout(() => (load.value = true), 3000);
</script>

<template>
  <div :class="{ load }" id="wrap">
    <header>
      <h1>Willkommen!</h1>
      <h3>Bitte melde dich an</h3>
    </header>
    <svg
      width="128"
      height="128"
      viewBox="0 0 128 128"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M43 35C43 32.2386 45.2386 30 48 30H80C82.7614 30 85 32.2386 85 35V48C85 49.1046 84.1046 50 83 50H54C52.8954 50 52 49.1046 52 48V47C52 45.8954 52.8954 45 54 45H79C79.5523 45 80 44.5523 80 44V37C80 35.3431 79.6569 35 78 35H50C48.3431 35 48 35.3431 48 37V48C48 49.1046 47.1046 50 46 50H25C20.5817 50 19 51.5817 19 56V94C19 98.4183 20.5817 100 25 100H103C107.418 100 109 98.4183 109 94V56C109 51.5817 107.418 50 103 50H91C89.8954 50 89 49.1046 89 48V47C89 45.8954 89.8954 45 91 45H105C110.523 45 114 48.4772 114 54V96C114 101.523 110.523 105 105 105H23C17.4772 105 14 101.523 14 96V54C14 48.4772 17.4772 45 23 45H42C42.5523 45 43 44.5523 43 44V35Z"
        fill="#D9D9D9"
      />
      <circle r="5" fill="#D9D9D9">
        <animateMotion
          v-if="!load"
          path="M55 48.5H82.5C83.0523 48.5 83.5 48.0523 83.5 47.5V34.5C83.5 33.9477 83.0523 33.5 82.5 33.5H47.5C46.9477 33.5 46.5 33.9477 46.5 34.5V47.5C46.5 48.0523 46.0523 48.5 45.5 48.5H23.5C20.1863 48.5 17.5 51.1863 17.5 54.5V97.5C17.5 100.814 20.1863 103.5 23.5 103.5H106.5C109.814 103.5 112.5 100.814 112.5 97.5V54.5C112.5 51.1863 109.814 48.5 106.5 48.5H92.5 M91.5 47.5H105.5C108.814 47.5 111.5 50.1863 111.5 53.5V96.5C111.5 99.8137 108.814 102.5 105.5 102.5H22.5C19.1863 102.5 16.5 99.8137 16.5 96.5V53.5C16.5 50.1863 19.1863 47.5 22.5 47.5H44.5C45.0523 47.5 45.5 47.0523 45.5 46.5V33.5C45.5 32.9477 45.9477 32.5 46.5 32.5H81.5C82.0523 32.5 82.5 32.9477 82.5 33.5V46.5C82.5 47.0523 82.0523 47.5 81.5 47.5H54.5"
          dur="5s"
          keySplines=".46 .01 .52 .99"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
    <footer>
      <button>Anmelden mit Google</button>
      <button>Anmelden per Email</button>
    </footer>
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
    opacity: 0;
  }
}
svg {
  transform: translate(-50%, -45%);
  position: absolute;
  left: 50%;
  top: 45%;

  path:not(.loading) {
    fill: var(--txt);
  }

  path.loading {
    animation: loading infinite 2s;
    position: absolute;
    left: -5px;
  }
}
footer {
  transform: translate(-50%, -80%);
  transition: opacity 500ms;
  position: absolute;
  opacity: 0;
  left: 50%;
  top: 80%;

  button {
    margin-bottom: 10px;
    width: 100%;
  }
}
div#wrap.load header h3,
div#wrap.load footer {
  opacity: 1;
}

@keyframes loading {
  5% {
    left: -5px;
  }
  95% {
    left: 119px;
  }
}
</style>
