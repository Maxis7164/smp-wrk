<script lang="ts" setup>
import { currency, getEuroDate, round } from "src/utils";
import type { VueFirestoreQueryData } from "vuefire";
import { deleteHours, Hour, Profile } from "src/fire";
import { User } from "firebase/auth";

type _Nullable<T> = T | null | undefined;

defineProps<{
  user: _Nullable<User>;
  hours: Hour[];
  profiles: VueFirestoreQueryData<Profile>;
}>();
</script>

<template>
  <li v-for="h in hours" :key="h.start + '@' + Object.values(h.date).join('-')">
    <h4>{{ getEuroDate(h.date).join(".") }}</h4>
    <p class="time">{{ h.start }} - {{ h.end }}</p>
    <p>{{ h.total.toLocaleString() }} Stunden</p>
    <p>{{ currency(round(h.total * (profiles?.[0]?.pph ?? -1))) }}€</p>
    <button @click="" class="text">Bearbeiten</button>
    <button @click="deleteHours((h as any).id)" class="text risk">
      Löschen
    </button>
  </li>
</template>

<style lang="scss" scoped>
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

  h4,
  p.time {
    grid-column: 1 / 3;
    text-align: center;
  }

  h4 {
    margin-bottom: -0.5rem;
  }

  :nth-child(even):not(p.time):not(button) {
    text-align: end;
  }
  // button {
  //   grid-column: 1 / 3;
  // }
}
</style>
