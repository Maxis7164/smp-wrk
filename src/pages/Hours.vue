<script lang="ts" setup>
import { doc, updateDoc, arrayRemove } from "firebase/firestore";
import { useDocument, getCurrentUser } from "vuefire";
import { computed, ref, watch } from "vue";
import { db } from "../fire";

import BackButton from "../components/BackButton.vue";
import { confirm } from "../components/modal";

const user = await getCurrentUser();
const hRef = doc(db, "hours", user!.uid);

const hoursMap = useDocument<Typed<Hour[]>>(hRef);
const profiles = useDocument<Typed<Profile>>(doc(db, "profiles", user!.uid));
const hours = computed<Hour[]>(() =>
  hoursMap.value
    ? ([] as Hour[])
        .concat(
          ...Object.keys(hoursMap.value).map((key) => hoursMap.value![key])
        )
        .reverse()
    : []
);

const totalHours = ref<number>(0);
const totalPay = ref<number>(0);

watch(hoursMap, (hours) => {
  totalHours.value = 0;
  totalPay.value = 0;

  if (profiles?.value && hours) {
    Object.keys(hours).forEach((p: string) => {
      if (p === "id") return;

      const tot = hours[p].map((h) => h.total);
      if (tot.length === 0) return;

      const cur = hours[p].map((h) => h.total);

      if (cur.length === 0) return;

      const h = cur.reduce((acc, cur) => acc + cur);

      totalHours.value += h;
      totalPay.value += h * profiles.value![p].pph;
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
  <div class="wrap">
    <header>
      <h1>Deine Stunden</h1>
    </header>
    <section class="overview">
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
    <section class="impressive">
      <p>Erstaunlich, nicht wahr?</p>
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
      </ul>
    </section>
    <BackButton />
  </div>
</template>

<style lang="scss" scoped>
div.wrap {
  overflow-y: auto;
}

header {
  margin: 1rem 0 1.25rem 0;
}
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
    margin: 2rem 0;
  }
  &.hours {
    ul {
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

        :nth-child(even) {
          text-align: end;
        }
        button {
          grid-column: 1 / 3;
        }
      }
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
