<script lang="ts" setup>
import { computed, ref } from "vue";
import { range } from "../utils";

const props = defineProps<{ initial?: boolean; dates: string[] }>();
const emit = defineEmits<{ (e: "select", i: ISODate): void }>();

const DAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"] as const;
const MONTHS = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
] as const;
const c = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;
const cur = new Date();

const year = ref<number>(cur.getFullYear());
const month = ref<number>(cur.getMonth());
const day = ref<number>(0);

const sel = ref<number[]>([cur.getDate(), cur.getMonth(), cur.getFullYear()]);
const dates = computed<string[]>(() => props.dates);

function getDate(i: number): number {
  const d = i + 1 - day.value;

  return d < 1
    ? c[month.value] + d
    : d > c[month.value]
    ? d - c[month.value]
    : d;
}

function loadMonth(month: number, year: number) {
  const first = new Date(year, month, 0);

  day.value = first.getDay();
}

function select(i: number): void {
  const nxt = getDate(i);
  const relMonth = isFiller(i);

  if (relMonth !== 0) goToMonth(relMonth);

  sel.value = [nxt, month.value, year.value];
  emit("select", [sel.value[2], sel.value[1], sel.value[0]]);
}

function goToMonth(to: number): void {
  if (to < -1 || to > 1) return;

  if (to < 0) {
    if (month.value - 1 < 0) {
      year.value--;
      month.value = 11;
    } else month.value--;
  } else if (to > 0) {
    if (month.value + to > 11) {
      year.value++;
      month.value = 0;
    } else month.value++;
  }

  loadMonth(month.value, year.value);
}

function toCurrent(): void {
  year.value = cur.getFullYear();
  month.value = cur.getMonth() - 1;
  goToMonth(1);
}

const isActive = (i: number) =>
  sel.value[0] + day.value === i + 1 &&
  sel.value[1] === month.value &&
  sel.value[2] === year.value;

const isCurrent = (i: number) =>
  cur.getDate() + day.value === i + 1 && month.value === cur.getMonth();

const isFiller = (i: number): number =>
  i < day.value ? -1 : i + 1 > c[month.value] + day.value ? 1 : 0;

const hasEvent = (i: number): boolean => {
  const date = new Date(`${year.value}-${month.value + 1}-${getDate(i + 1)}`)
    .toISOString()
    .slice(0, 10);

  const rel = i + 1 - day.value;

  return dates.value.includes(date) && rel >= 0 && rel <= c[month.value];
};

loadMonth(month.value, year.value);

if (props.initial) emit("select", [sel.value[2], sel.value[1], sel.value[0]]);
</script>

<template>
  <div class="calendar">
    <button @click="goToMonth(-1)">&lt;</button>
    <header>
      <button class="text" @click="toCurrent">
        {{ MONTHS[month] }} {{ year }}
      </button>
    </header>
    <button @click="goToMonth(1)">&gt;</button>
    <div class="head" v-for="d in DAYS">
      <h4>{{ d }}</h4>
    </div>
    <button
      @click="select(i)"
      :class="{
        active: isActive(i),
        current: isCurrent(i),
        filler: isFiller(i),
        event: hasEvent(i),
      }"
      v-for="(_, i) in range(c[month] + day > 35 ? 42 : 35)"
      :key="i"
    >
      {{ getDate(i) }}
    </button>
  </div>
</template>

<style lang="scss" scoped>
div.calendar {
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: repeat(7, 1fr);
  background: var(--srf);
  border-radius: 1rem;
  align-items: center;
  text-align: center;
  min-width: 300px;
  height: 350px;
  display: grid;

  header {
    grid-column: 2 / 7;
  }

  div.head:nth-child(10) {
    color: hsl(0, 100%, 50%);
  }

  button:not(.text) {
    padding: 0.75rem 0;
    font-weight: 400;

    &.active {
      background: var(--srf1);
    }
    &.filler {
      color: #bbb;
    }
    &.current {
      color: var(--p);
    }
    &.event {
      position: relative;

      &::after {
        content: "";

        transform: translateX(-50%);
        border-radius: 999px;
        background: var(--p);
        position: absolute;
        z-index: 310;
        bottom: 5px;
        height: 5px;
        width: 5px;
        left: 50%;
      }
    }
  }
}
</style>
