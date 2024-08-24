<script lang="ts" setup>
import {
  updateHours,
  getHoursOf,
  getProfilesOf,
  MONTHS,
  Profile,
  Hour,
} from "src/fire";
import { useCurrentUser, useCollection } from "vuefire";
import { round } from "src/utils";
import { ref, watch } from "vue";

import PageLayout from "@layouts/PageLayout.vue";
import Calendar from "@components/Calendar.vue";

const user = useCurrentUser();

const profiles = useCollection<Profile>(getProfilesOf(user.value!), {
  ssrKey: "profiles",
});
const hours = useCollection<Hour>(getHoursOf(user.value!), {
  ssrKey: "hours",
});

const total = ref<{ [key: string]: number }>({});
const cur = ref<{ [key: string]: Hour[] }>({});
const d = ref<ISODate>([0, 0, 0]);
const dates = ref<string[]>([]);

watch(
  hours,
  () => {
    const D = new Date();

    dates.value = hours.value.map((hour) => hour.date.join("-"));

    onSelect([D.getFullYear(), D.getMonth(), D.getDate()]);
  },
  { once: true }
);

function onSelect(date: ISODate): void {
  if (!hours.value) return;

  d.value = date;

  const ISO = new Date(...date, 2, 0, 0, 0).toISOString();

  hours.value.forEach((h) => {
    if (
      new Date(
        `${h.date[0]}-${h.date[1]}-${h.date[2]}T00:00:00.000Z`
      ).toISOString() === ISO
    ) {
      total.value[h.profile] += h.total;
      return true;
    }

    return false;
  });

  profiles.value.forEach((prof) => {
    total.value[prof.id] = 0;
    cur.value[prof.id] = [];
  });

  hours.value.forEach(async (hour) => {
    if (!("version" in (hours.value.at(0) ?? {}))) {
      await updateHours(user.value!);
      location.reload();
    }

    if (!(hour.profile in cur.value)) return;

    if (new Date(hour.date.join("-")).toISOString() !== ISO) return;

    total.value[hour.profile] += hour.total;
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
      <p>{{ d[2] }}.{{ MONTHS[d[1]] }}.{{ d[0] }}</p>
      <ul>
        <li v-for="prof in profiles" :key="prof.name">
          <h3>{{ prof.name }}</h3>
          <ul>
            <li v-for="(h, i) in cur[prof.name]">
              <p>{{ h.start }} - {{ h.end }}</p>
              <p>{{ i > 0 ? "+" : "" }}{{ round(h.total * prof.pph) }}€</p>
            </li>
            <li v-if="total[prof.id] > 0" class="total">
              <p>{{ total[prof.id] }} Stunden</p>
              <p>{{ round(total[prof.id] * prof.pph) }}€</p>
            </li>
            <li v-else class="noHours">
              <p>Hier hast du nicht gearbeitet</p>
            </li>
          </ul>
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
    > li {
      margin-bottom: 0.75rem;
      background: var(--srf);
      border-radius: 1rem;
    }

    li {
      position: relative;
      display: block;
      padding: 1rem;

      h3 {
        text-align: center;
      }

      ul li {
        justify-content: space-between;
        display: flex;

        &.total {
          font-weight: 600;

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

        &.noHours p {
          margin: 0 auto;
        }
      }
    }
  }
}
</style>
