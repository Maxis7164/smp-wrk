<script lang="ts" setup>
import {
  useFirebaseAuth,
  useCurrentUser,
  getCurrentUser,
  useCollection,
} from "vuefire";
import { db, getProfilesOf, getHoursOf, Profile } from "src/fire";
import { doc, where, deleteDoc, getDocs } from "firebase/firestore";
import { useTheme, Theme } from "@composables/theme";
import { banner } from "@composables/banner";
import { confirm } from "@components/modal";
import { currency } from "src/utils";
import { useRouter } from "vue-router";

import SlideButton from "@components/SlideButton.vue";
import PageLayout from "@layouts/PageLayout.vue";

const auth = useFirebaseAuth();
const user = useCurrentUser();
const t = useTheme();
const r = useRouter();

let debug: number = 0;
let to: number = 0;

await getCurrentUser();

const APP_V = import.meta.env.VITE_APP_VERSION;
const APP_S = import.meta.env.VITE_APP_STATE;

const profiles = useCollection<Profile>(getProfilesOf(user.value!), {
  ssrKey: "profiles",
});

async function deleteProfile(profile: Profile & { id: string }): Promise<void> {
  const doDel = await confirm(
    "Möchtest du wirklich dieses Arbeitsprofil löschen? Alle Arbeitszeiten, die zu diesem Profil gehören, werden ebenfalls gelöscht. Diese Aktion lässt sich nicht rückgängig machen!",
    "Arbeitsprofil löschen",
    ["Ja", "Nein"]
  );

  if (doDel) {
    const del = getHoursOf(user.value!, where("profile", "==", profile.name));

    getDocs(del).then((docs) => docs.forEach((doc) => deleteDoc(doc.ref)));
    deleteDoc(doc(db, "profiles", profile.id));
  }
}

function signOut(): void {
  if (!auth)
    banner(
      "error",
      "Ein unerwarteter Fehler kam auf - bitte versuche es erneut"
    );

  auth!.signOut();
  r.push("/load");
}

function toDebug() {
  clearTimeout(to);
  debug++;

  if (debug === 6) r.push("/test");
  else to = setTimeout(() => (debug = 0), 5000) as any;
}
</script>

<template>
  <PageLayout name="Einstellungen">
    <section class="account">
      <p>Angemeldet als:</p>
      <h2>{{ user?.displayName ?? "loading..." }}</h2>
      <div>
        <button @click="$router.push('/settings/account')" class="text">
          bearbeiten
        </button>
        <button @click="signOut" class="text risk">abmelden</button>
      </div>
    </section>
    <section class="profiles">
      <h2>Arbeitsprofile</h2>
      <ul>
        <li v-if="user" v-for="prof in profiles" :key="prof.name">
          <h3>{{ prof.name }}</h3>
          <p>{{ currency(prof.pph) }}€/h</p>
          <button
            @click="
              $router.push({
                path: '/settings/editProfile',
                query: { profile: prof.id },
              })
            "
            class="text"
          >
            Bearbeiten
          </button>
          <button @click="deleteProfile(prof)" class="text risk">
            Löschen
          </button>
        </li>
        <li class="add">
          <button @click="$router.push('/settings/editProfile')">
            Profil hinzufügen
          </button>
        </li>
      </ul>
    </section>
    <section class="theme">
      <h2>Appthema</h2>
      <SlideButton :default="t.theme" @update="(v) => t.setTheme(v as Theme)" />
    </section>
    <section class="appversion">
      <p @click="toDebug">
        Version{{ APP_S !== "FINAL" ? ` ${APP_S}` : "" }} {{ APP_V }}
      </p>
    </section>
  </PageLayout>
</template>

<style lang="scss" scoped>
section {
  margin-bottom: 1.25rem;

  &.account {
    background: var(--srf);
    border-radius: 1rem;
    padding: 1rem;

    p {
      text-align: center;
      font-size: 0.75rem;
    }
    h2 {
      margin-bottom: -5px;
      text-align: center;
    }
    button {
      font-weight: 400;
      font-size: 0.875rem;
    }

    div {
      justify-content: space-around;
      margin-top: 0.5rem;
      display: flex;
    }
  }
  &.profiles ul {
    li:not(.add) {
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 1fr 1fr;
      display: grid;

      p {
        text-align: end;
      }

      button {
        font-size: 0.875rem;
        font-weight: 400;
      }
    }

    li.add {
      padding: 0;

      button {
        width: 100%;
      }
    }
  }
  &.data {
    display: flex;
    gap: 0.5rem;

    button {
      width: 100%;
    }
  }

  &.appversion {
    font-size: 0.875rem;
    text-align: center;
    user-select: none;
  }

  > button {
    width: 100%;
  }
  > h2 {
    margin: 0.625rem 0.125rem;
  }

  ul {
    background: var(--srf);
    border-radius: 1rem;

    li {
      position: relative;
      display: block;
      padding: 1rem;

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
    }
  }
}
</style>
