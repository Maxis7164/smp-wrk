<script lang="ts" setup>
import { doc, updateDoc, arrayRemove } from "firebase/firestore";
import { useDocument, useCurrentUser } from "vuefire";
import { confirm } from "../components/modal";
import { computed, ref, watch } from "vue";
import { db } from "../fire";

import PageLayout from "../layouts/PageLayout.vue";

const user = useCurrentUser();

// if (!user.value)

const hRef = doc(db, "hours", user.value!.uid);

const profiles = useDocument<Profiles>(doc(db, "profiles", user.value!.uid));
const hoursMap = useDocument<Hours>(hRef);

const totalHours = ref<number>(0);
const totalPay = ref<number>(0);
const hours = ref<Hour[]>([]);

watch(hoursMap, (nxt) => {
  totalHours.value = 0;
  totalPay.value = 0;
  hours.value = [];

  if (nxt) {
    Object.keys(nxt).forEach((profile) => {
      if (!profiles.value) return;

      let tot: number = 0;

      nxt[profile].forEach((hour) => {
        hours.value.push(hour);
        tot += hour.total;
      });

      totalPay.value += tot * profiles.value[profile].pph;
      totalHours.value += tot;
    });
  }
});

async function del(h: Hour): Promise<void> {
  const doDel = await confirm(
    "Möchtest du diese Stunden wirklich löschen?",
    "Arbeitszeit löschen"
  );

  if (doDel) updateDoc(hRef, { [h.profile]: arrayRemove(h) });
}

function getEuroDate(date: string[]): string[] {
  return [date[2], date[1], date[0]];
}
function round(val: number): number {
  return Math.floor(val * 100) / 100;
}
</script>

<template>
  <PageLayout name="Deine Stunden">
    <section v-if="hours.length > 0" class="overview">
      <ul>
        <li>
          <h2>{{ round(totalHours) }} Stunden</h2>
          <p>hast du bisher gearbeitet</p>
        </li>
        <li>
          <p>damit hast du so viel verdient:</p>
          <h2>{{ round(totalPay) }}€</h2>
        </li>
      </ul>
    </section>
    <section v-if="hours.length > 0" class="impressive">
      <h3>Erstaunlich, nicht wahr?</h3>
    </section>
    <section class="hours">
      <ul class="hours">
        <li v-for="h in hours" :key="h.begin + '@' + h.date.join('.')">
          <h3>{{ h.profile }}</h3>
          <h3>{{ round(h.total * (profiles?.[h.profile]?.pph ?? -1)) }}€</h3>
          <p>{{ getEuroDate(h.date).join(".") }}</p>
          <p>{{ h.total }} Stunden</p>
          <button @click="del(h)" class="text risk">Löschen</button>
        </li>
        <li v-if="hours.length === 0" class="noHours">
          <p>Du hast keine Stunden eingetragen.</p>
        </li>
      </ul>
    </section>
  </PageLayout>
</template>

<style lang="scss" scoped>
section {
  margin-bottom: 1.25rem;

  &.overview {
    text-align: center;

    ul {
      background: var(--srf);
      border-radius: 1rem;

      li {
        padding: 1.5rem 1.25rem;
        position: relative;
        display: block;

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

        :first-child {
          margin-bottom: 0.25rem;
        }
        p {
          font-size: 0.875rem;
        }
      }
    }
  }
  &.impressive {
    text-align: center;
    margin: 3rem 0;
  }
  &.hours {
    ul {
      overflow-y: auto;

      li:not(.noHours) {
        grid-template-rows: auto auto auto;
        grid-template-columns: 1fr 1fr;
        margin-bottom: 0.75rem;
        background: var(--srf);
        border-radius: 1rem;
        align-items: center;
        row-gap: 0.75rem;
        display: grid;
        padding: 1rem;

        :nth-child(even) {
          text-align: end;
        }
        button {
          grid-column: 1 / 3;
        }
      }

      li.noHours {
        transform: translate(-50%, -50%);
        position: absolute;
        display: inline;
        left: 50%;
        top: 50%;
      }
    }
  }
}
</style>
