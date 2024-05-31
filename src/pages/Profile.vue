<script lang="ts" setup>
import { arrayRemove, doc, updateDoc } from "firebase/firestore";
import { useCurrentUser, useDocument } from "vuefire";
import { useRoute, useRouter } from "vue-router";
import { getEuroDate, round } from "../utils";
import { confirm } from "../components/modal";
import { call } from "../components/banner";
import { computed, ref, watch } from "vue";
import { db } from "../fire";

import PageLayout from "../layouts/PageLayout.vue";

const router = useRouter();
const route = useRoute();

const user = useCurrentUser();
const hRef = doc(db, "hours", user.value!.uid);

const profiles = useDocument<Profiles>(doc(db, "profiles", user.value!.uid));
const hoursMap = useDocument<Hours>(hRef);

const profile = computed(() => route.params.profile as string);
const totalHours = ref<number>(0);
const totalPay = ref<number>(0);
const hours = ref<Hour[]>([]);

watch(hoursMap, (nxt) => {
  totalHours.value = 0;
  totalPay.value = 0;
  hours.value = [];

  if (!profiles.value) return;

  if (!(profile.value in (profiles.value ?? {}))) {
    call("error", `Profil "${profile}" existiert nicht!`);
    return router.push("/");
  }

  if (nxt) {
    let tot: number = 0;

    nxt[profile.value].forEach((hour) => {
      hours.value.push(hour);
      tot += hour.total;
    });

    totalPay.value += tot * profiles.value[profile.value].pph;
    totalHours.value += tot;
  }
});

async function del(h: Hour): Promise<void> {
  const doDel = await confirm(
    "Möchtest du diese Stunden wirklich löschen?",
    "Arbeitszeit löschen"
  );

  if (doDel) updateDoc(hRef, { [h.profile]: arrayRemove(h) });
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
        <li v-for="h in hours" :key="h.begin + '@' + h.date.join('.')">
          <h4>{{ h.profile }}</h4>
          <h4>{{ round(h.total * (profiles?.[h.profile]?.pph ?? -1)) }}€</h4>
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
