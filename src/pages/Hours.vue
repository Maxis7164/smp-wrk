<script lang="ts" setup>
import {
  getNewHoursOf,
  getProfilesOf,
  MONTHS,
  type Profile,
  type Hour,
} from "src/fire";
import { useCurrentUser, useCollection } from "vuefire";
import { ref, watch } from "vue";

import PageLayout from "@layouts/PageLayout.vue";
import Calendar from "@components/Calendar.vue";
import { Datestamp, DatestampData, round } from "src/utils";

const user = useCurrentUser();

const profiles = useCollection<Profile>(getProfilesOf(user.value!), {
  ssrKey: "profiles",
});
const hours = useCollection<Hour>(getNewHoursOf(user.value!), {
  ssrKey: "hours",
});

const total = ref<{ hours: number; pay: number }>({ hours: 0, pay: 0 });
const d = ref<Datestamp>(Datestamp.fromData(Datestamp.PLACEHOLDER));
const cur = ref<{ [key: string]: Hour[] }>({});
const dates = ref<Datestamp[]>([]);

watch(
  hours,
  () => {
    const D = new Date();

    dates.value = hours.value.map((h) => Datestamp.fromData(h.date));

    onSelect(new Datestamp(D));
  },
  { once: true }
);

function onSelect(date: DatestampData): void {
  if (!hours.value) return;

  d.value = Datestamp.fromData(date);

  profiles.value.forEach((prof) => {
    total.value = { hours: 0, pay: 0 };
    cur.value[prof.id] = [];
  });

  hours.value.forEach(async (hour) => {
    if (!(hour.profile in cur.value)) return;

    const prof = profiles.value.find((p) => p.id === hour.profile);

    if (!prof) return;

    if (!Datestamp.fromData(hour.date).isEqual(d.value)) return;

    total.value.hours += hour.total;
    total.value.pay += round(hour.total * prof.pph);
    cur.value[hour.profile].push(hour);
  });
}
</script>

<template>
  <PageLayout name="Deine Stunden">
    <section class="calendar">
      <Calendar :dates @select="onSelect" />
    </section>
    <section class="day">
      <h2>So hast du gearbeitet:</h2>
      <ul>
        <h3>{{ d.toEuroDate() }}</h3>
        <li v-for="prof in profiles">
          <div v-if="prof.id in cur && cur[prof.id].length > 0">
            <h3>{{ prof.name }}</h3>
            <ul>
              <li v-for="h in cur[prof.id]">
                <p>{{ h.start }} - {{ h.end }}</p>
                <p>{{ round(h.total * prof.pph) }}€</p>
              </li>
            </ul>
          </div>
        </li>
        <li v-if="total.hours > 0" class="total">
          <p>{{ round(total.hours) }} Stunden</p>
          <p>{{ total.pay }}€</p>
        </li>
        <li v-else class="none">
          <p>Für den Tag wurden keine Stunden eingetragen</p>
        </li>
      </ul>
    </section>
  </PageLayout>
</template>

<style lang="scss" scoped>
section {
  margin-bottom: 1.25rem;

  > h2 {
    margin-bottom: 0.75rem;
  }
  > p {
    margin-bottom: 0.5rem;
    text-align: center;
  }

  > ul {
    background: var(--srf);
    border-radius: 1rem;
    padding: 1.25rem;

    > h3 {
      margin-bottom: 0.75rem;
      text-align: center;
    }

    li {
      margin-bottom: 0.5rem;
      margin-left: 0.125rem;
      display: block;

      h3 {
        margin-bottom: 0.25rem;
      }
      ul li {
        justify-content: space-between;
        display: flex;
      }

      &.total {
        justify-content: space-between;
        padding-top: 0.5rem;
        position: relative;
        display: flex;
        margin: 0;

        &::before {
          content: "";

          background: var(--brd);
          position: absolute;
          display: block;
          height: 1px;
          width: 95%;
          left: 2.5%;
          top: 0;
        }
      }

      &.none {
        text-align: center;
        margin: 0 auto;
        width: 50%;
      }
    }
  }

  &:last-child {
    margin-bottom: 3.5rem;
  }
}
</style>
