<script lang="ts" setup>
import { ref } from "vue";

const currentHours = ref<number>(0);
const currentPay = ref<number>(0);
const hours = ref<number>(0);
</script>

<template>
  <div id="wrap">
    <header>
      <h1>Hallo Max!</h1>
    </header>
    <section class="current">
      <ul>
        <li>
          <h2>{{ currentHours }} Stunden</h2>
          <p>hast du diesen Monat gearbeitet</p>
        </li>
        <li>
          <p>damit verdienst du</p>
          <h2>{{ currentPay }}€</h2>
        </li>
      </ul>
    </section>
    <section class="hours">
      <h2>Deine Stunden</h2>
      <ul>
        <li>
          <h3>Gesamt:</h3>
          <p>{{ hours }} Stunden</p>
        </li>
        <li v-for="_ in [1]">
          <h3>Subway:</h3>
          <p>72,54 Stunden</p>
        </li>
      </ul>
    </section>
    <section class="useful">
      <h2>Nützliches</h2>
      <button @click="$router.push('/settings')" class="icon">
        Einstellungen
      </button>
    </section>
    <footer>
      <button class="icon high add">+</button>
    </footer>
  </div>
</template>

<style lang="scss" scoped>
header {
  margin: 1rem 0 1.25rem 0;
}
section {
  margin-bottom: 1.25rem;

  &.current {
    text-align: center;

    p {
      font-size: 0.75rem;
    }
  }
  &.hours {
    ul li {
      justify-content: space-between;
      display: flex;
    }
  }
  &.useful button {
    text-align: left;
    width: 100%;
  }

  > h2 {
    margin: 0 2px;
  }

  ul {
    background: var(--srf);
    border-radius: 1rem;

    li {
      position: relative;
      display: block;
      padding: 1rem;

      &:not(:last-child)::after {
        content: "";

        background: var(--brd);
        position: absolute;
        display: block;
        height: 1px;
        width: 95%;
        left: 2.5%;
        bottom: 0;
      }
    }
  }
}
footer {
  height: 50px;

  button {
    box-shadow: 0 0 4px 4px #0004;
    position: fixed;
    bottom: 1rem;
    right: 1rem;
  }
}
</style>
