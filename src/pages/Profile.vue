<script lang="ts" setup>
import { deleteDoc, doc, where } from "firebase/firestore";
import { db, getHoursOf, getProfilesOf } from "../fire";
import { useCollection, useCurrentUser } from "vuefire";
import { getEuroDate, round } from "../utils";
import { confirm } from "../components/modal";
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";

import PageLayout from "../layouts/PageLayout.vue";
import HourPanel from "../components/HourPanel.vue";

const route = useRoute();
const profile = computed(() => route.params.profile as string);

const user = useCurrentUser();

const profiles = useCollection<Profile>(
  getProfilesOf(user.value!, where("name", "==", profile.value)),
  { ssrKey: "profiles" }
);
const hours = useCollection<Hour>(
  getHoursOf(user.value!, where("profile", "==", profile.value)),
  {
    ssrKey: "hours",
  }
);

const display = computed<Hour[]>(() => sort(hours.value));
const totalHours = ref<number>(0);
const totalPay = ref<number>(0);

type A = typeof hours.value;

function sort(arr: A): A {
  return arr.sort((a, b) =>
    new Date(a.date.join("-")).getTime() > new Date(b.date.join("-")).getTime()
      ? -1
      : 1
  );
}

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

async function del(h: Hour & { id: string }): Promise<void> {
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
      <h3>Erstaunlich, nicht wahr?</h3>
    </section>
    <section class="hours">
      <ul class="hours">
        <HourPanel :hours :profiles :user />
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
