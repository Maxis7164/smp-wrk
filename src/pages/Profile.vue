<script lang="ts" setup>
import { deleteDoc, doc, where } from "firebase/firestore";
import { db, getHoursOf, getProfilesOf } from "../fire";
import { useCollection, useCurrentUser } from "vuefire";
import { getEuroDate, round } from "../utils";
import { confirm } from "../components/modal";
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";

import PageLayout from "../layouts/PageLayout.vue";

const route = useRoute();
const profile = computed(() => route.params.profile as string);

const user = useCurrentUser();

const profiles = useCollection<NewProfile>(
  getProfilesOf(user.value!, where("name", "==", profile.value)),
  { ssrKey: "profiles" }
);
const hours = useCollection<NewHour>(
  getHoursOf(user.value!, where("profile", "==", profile.value)),
  {
    ssrKey: "hours",
  }
);

const totalHours = ref<number>(0);
const totalPay = ref<number>(0);

watch(hours, (nxt) => {
  totalHours.value = 0;
  totalPay.value = 0;

  if (!profiles.value) return;

  if (nxt) {
    let tot: number = 0;

    nxt.forEach((hour) => {
      tot += hour.total;
    });

    totalPay.value += tot * profiles.value[0].pph;
    totalHours.value += tot;
  }
});

async function del(h: NewHour & { id: string }): Promise<void> {
  const doDel = await confirm(
    "Möchtest du diese Stunden wirklich löschen?",
    "Arbeitszeit löschen"
  );

  if (doDel) deleteDoc(doc(db, "hours", h.id));
}
</script>

<template>
  <PageLayout :name="`Deine Stunden - ${profile}`">
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
      <h4>Erstaunlich, nicht wahr?</h4>
    </section>
    <section class="hours">
      <ul class="hours">
        <li v-for="h in hours" :key="h.start + '@' + h.date.join('.')">
          <h4>{{ h.profile }}</h4>
          <h4>{{ round(h.total * (profiles?.[0]?.pph ?? -1)) }}€</h4>
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
