<script lang="ts" setup></script>

<template>
  <footer>
    <button @click="$router.back()" class="icon back">
      <svg
        width="106"
        height="82"
        viewBox="0 0 106 82"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M100 46.5C103.038 46.5 105.5 44.0376 105.5 41C105.5 37.9624 103.038 35.5 100 35.5V46.5ZM2.11092 37.1109C-0.036972 39.2588 -0.036972 42.7412 2.11092 44.8891L37.1127 79.8909C39.2606 82.0388 42.743 82.0388 44.8909 79.8909C47.0388 77.743 47.0388 74.2606 44.8909 72.1127L13.7782 41L44.8909 9.8873C47.0388 7.73942 47.0388 4.25701 44.8909 2.10913C42.743 -0.0387573 39.2606 -0.0387573 37.1127 2.10913L2.11092 37.1109ZM100 35.5L6 35.5V46.5L100 46.5V35.5Z"
          fill="#C4C4C4"
        />
      </svg>
    </button>
  </footer>
</template>

<style lang="scss" scoped>
footer {
  height: 50px;

  button {
    --size: 2.25rem;

    transition: left var(--anim-speed) ease-out, background-color 250ms;
    height: calc(var(--size) + 24px);
    box-shadow: 0 0 4px 4px #0004;
    width: calc(var(--size) + 24px);
    position: fixed;
    bottom: 1rem;
    left: 1rem;

    svg {
      margin-right: 0;
    }
  }
}
</style>
