<script lang="ts" setup>
import { doc, updateDoc, arrayRemove } from "firebase/firestore";
import { useDocument, useCurrentUser } from "vuefire";
import { getEuroDate, round } from "../utils";
import { confirm } from "../components/modal";
import { computed, ref, watch } from "vue";
import { db } from "../fire";

import PageLayout from "../layouts/PageLayout.vue";
import Calendar from "../components/Calendar.vue";

const user = useCurrentUser();

const hRef = doc(db, "hours", user.value!.uid);

const profiles = useDocument<Profiles>(doc(db, "profiles", user.value!.uid));
const hoursMap = useDocument<Hours>(hRef);

const total = ref<{ [key: string]: number }>({});
const cur = ref<Hours>({});

watch(
  hoursMap,
  () => {
    const D = new Date();
    onSelect([D.getFullYear(), D.getMonth(), D.getDate()]);
  },
  { once: true }
);

function onSelect(date: ISODate): void {
  if (!hoursMap.value) return;

  const ISO = new Date(...date, 2, 0, 0, 0).toISOString();

  Object.keys(hoursMap.value ?? {}).forEach((profile) => {
    total.value[profile] = 0;

    cur.value[profile] = (hoursMap.value![profile] ?? []).filter((h) => {
      if (
        new Date(
          `${h.date[0]}-${h.date[1]}-${h.date[2]}T00:00:00.000Z`
        ).toISOString() === ISO
      ) {
        total.value[profile] += h.total;
        return true;
      }

      return false;
    });
  });
}
</script>

<template>
  <PageLayout name="Deine Stunden">
    <section class="calendar">
      <Calendar @select="onSelect" />
    </section>
    <section class="day">
      <h2>So hast du gearbeitet:</h2>
      <ul>
        <li v-for="(prof, name) in profiles" :key="name">
          <h3>{{ name }}</h3>
          <ul>
            <li v-for="(h, i) in cur[name]">
              <p>{{ h.begin }} - {{ h.end }}</p>
              <p>{{ i > 0 ? "+" : "" }}{{ round(h.total * prof.pph) }}€</p>
            </li>
            <li v-if="total[name] > 0" class="total">
              <p>{{ total[name] }} Stunden</p>
              <p>{{ round(total[name] * prof.pph) }}€</p>
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
    margin: 0 0.125rem 0.625rem 0;
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
