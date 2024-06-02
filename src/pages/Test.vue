<script lang="ts" setup>
import { collection, query, where } from "firebase/firestore";
import { useCollection } from "vuefire";
import { db } from "../fire";

import Calendar from "../components/Calendar.vue";
import { watch } from "vue";

const a = useCollection(
  query(collection(db, "hours"), where("test", "==", true))
);

watch(a, console.log);
</script>

<template>
  <div class="wrap">
    test page
    <p>{{ JSON.stringify(a) }}</p>
  </div>
</template>

<style lang="scss" scoped></style>
