<script lang="ts" setup>
import Calendar from "../components/Calendar.vue";
</script>

<template>
  <div class="wrap">
    test page
    <Calendar @select="console.log" />
  </div>
</template>

<style lang="scss" scoped></style>
