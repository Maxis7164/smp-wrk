<script lang="ts" setup>
import {
  getHoursOf,
  getProfilesOf,
  Profile,
  Hour,
  deleteProfile,
} from "src/fire";
import { useCollection, useCurrentUser } from "vuefire";
import { documentId, where } from "firebase/firestore";
import { currency, round } from "src/utils";
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";

import HourPanel from "@components/HourPanel.vue";
import PageLayout from "@layouts/PageLayout.vue";
import { confirm } from "@composables/modal";

const route = useRoute();
const id = computed(() => route.params.profile as string);

const user = useCurrentUser();

const profiles = useCollection<Profile>(
  getProfilesOf(user.value!, where(documentId(), "==", id.value)),
  { ssrKey: "profiles" }
);
const hours = useCollection<Hour>(
  getHoursOf(user.value!, where("profile", "==", id.value ?? "")),
  {
    ssrKey: "hours",
  }
);

const display = ref<Hour[]>(sort(hours.value));
const totalHours = ref<number>(0);
const totalPay = ref<number>(0);

const profile = computed(() => profiles.value.at(0));

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
    display.value = sort(hours.value);

    let tot: number = 0;

    nxt.forEach((hour) => {
      tot += hour.total;
    });

    totalPay.value += tot * profiles.value[0].pph;
    totalHours.value += tot;
  }
});

async function delProf() {
  if (!profile.value)
    return console.error("Cannot delete non-existing profile!");

  const doDel = await confirm(
    `Möchtest du wirklich dein "${profile.value.name}" Profil löschen?`,
    "Profil löschen",
    ["Ja", "Nein"]
  );

  if (doDel) {
    await deleteProfile(profile.value.id);
  }
}
</script>

<template>
  <PageLayout :name="`${profiles.at(0)?.name ?? 'Profil'}`">
    <section v-if="hours.length > 0" class="overview">
      <ul>
        <li>
          <h2>{{ round(totalHours).toLocaleString() }} Stunden</h2>
          <p>hast du bisher gearbeitet</p>
        </li>
        <li>
          <p>damit hast du so viel verdient:</p>
          <h2>{{ currency(round(totalPay)) }}€</h2>
        </li>
      </ul>
    </section>
    <section v-if="hours.length > 0" class="impressive">
      <button
        @click="
          $router.push(`/settings/editProfile?profile=${profiles.at(0)!.id}`)
        "
        class="text"
      >
        Bearbeiten
      </button>
      <button @click="delProf" class="text risk">Löschen</button>
    </section>
    <section class="hours">
      <ul class="hours">
        <HourPanel :hours="display" :profiles :user />
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
    justify-content: space-around;
    margin: 2.5rem 0;
    display: flex;

    button {
      font-weight: 600;
    }
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
