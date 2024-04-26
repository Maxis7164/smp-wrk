<script lang="ts" setup>
import { useDocument, getCurrentUser } from "vuefire";
import { doc } from "firebase/firestore";
import { db } from "../fire";
import { computed, watch } from "vue";

const user = await getCurrentUser();

const hoursMap = useDocument<Typed<Hour[]>>(doc(db, "hours", user!.uid));
const hours = computed<Hour[]>(() =>
  hoursMap.value
    ? ([] as Hour[])
        .concat(
          ...Object.keys(hoursMap.value).map((key) => hoursMap.value![key])
        )
        .reverse()
    : []
);

function getEuroDate(date: string[]): string[] {
  return [date[2], date[1], date[0]];
}
</script>

<template>
  <div class="wrap">
    <header>
      <h1>Deine Stunden</h1>
    </header>
    <ul class="hours">
      <li v-for="h in hours" :key="h.begin + '@' + h.date.join('.')">
        <h3>{{ h.profile }}</h3>
        <h3>74,46€</h3>
        <p>{{ getEuroDate(h.date).join(".") }}</p>
        <p>{{ h.total }} Stunden</p>
        <button class="text risk">Löschen</button>
      </li>
    </ul>
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
  </div>
</template>

<style lang="scss" scoped>
header {
  margin: 1rem 0 1.25rem 0;
}
ul {
  height: calc(100dvh - 75px);
  padding-bottom: 5rem;
  overflow-y: auto;

  li {
    grid-template-rows: auto auto auto;
    grid-template-columns: 1fr 1fr;
    margin-bottom: 0.75rem;
    background: var(--srf);
    border-radius: 1rem;
    align-items: center;
    row-gap: 0.75rem;
    display: grid;
    padding: 1rem;

    button {
      grid-column: 1 / 3;
    }
  }
}

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
.wrap.slide-left-enter-from footer button {
  left: calc(100% + 1rem);
}
.wrap.slide-left-enter-to footer button {
  left: 1rem;
}
.wrap.slide-right-leave-from footer button {
  left: 1rem;
}
.wrap.slide-right-leave-to footer button {
  left: calc(100% + 1rem);
}
</style>
