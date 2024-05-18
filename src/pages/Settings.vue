<script lang="ts" setup>
import {
  useFirebaseAuth,
  useCurrentUser,
  useDocument,
  getCurrentUser,
} from "vuefire";
import { doc, updateDoc, deleteField } from "firebase/firestore";
import { setTheme, getTheme, type Theme } from "../theme";
import { db, expDb, impDb, delDb } from "../fire";
import { confirm } from "../components/modal";
import { call } from "../components/banner";
import { useRouter } from "vue-router";

import SlideButton from "../components/SlideButton.vue";
import BackButton from "../components/BackButton.vue";

const theme = parseInt(localStorage.getItem("theme") ?? "2");
const auth = useFirebaseAuth();
const user = useCurrentUser();
const r = useRouter();

await getCurrentUser();

const APP_V = import.meta.env.VITE_APP_VERSION;
const APP_S = import.meta.env.VITE_APP_STATE;

const { data: profiles, error } = useDocument<Typed<Profile>>(
  doc(db, `profiles/${user.value!.uid}`)
);

async function deleteProfile(profile: Profile): Promise<void> {
  const doDel = await confirm(
    "Möchtest du wirklich dieses Arbeitsprofil löschen? Alle Arbeitszeiten, die zu diesem Profil gehören, werden ebenfalls gelöscht. Diese Aktion lässt sich nicht rückgängig machen!",
    "Arbeitsprofil löschen",
    ["Ja", "Nein"]
  );

  if (doDel) {
    const profs = doc(db, `profiles/${user.value!.uid}`);
    const hours = doc(db, `hours/${user.value!.uid}`);

    try {
      updateDoc(profs, { [profile.name]: deleteField() });
      updateDoc(hours, { [profile.name]: deleteField() });
    } catch (err) {
      call("error", "Ein Fehler ist passiert - versuche es erneut");
    }
  }
}

function signOut(): void {
  if (!auth)
    call("error", "Ein unerwarteter Fehler kam auf - bitte versuche es erneut");

  auth!.signOut();
  r.push("/load");
}

async function deleteDatabase(): Promise<void> {
  const isDel = await delDb();

  if (isDel) r.push("/settings/editProfile?setup=1");
}
</script>

<template>
  <div class="wrap">
    <header>
      <h1>Einstellungen</h1>
    </header>
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
          <p>{{ prof.pph }}€/h</p>
          <button
            @click="
              $router.push({
                path: '/settings/editProfile',
                query: { profile: prof.name },
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
      <SlideButton :default="theme" @update="(v) => setTheme(v as Theme)" />
    </section>
    <section class="data">
      <div>
        <button @click="impDb">Daten importieren</button>
        <button @click="expDb">Daten exportieren</button>
      </div>
      <button class="risk" @click="deleteDatabase">Daten löschen</button>
    </section>
    <section class="appversion">
      <p>Version{{ APP_S !== "FINAL" ? " " + APP_S : "" }} {{ APP_V }}</p>
    </section>
    <BackButton />
  </div>
</template>

<style lang="scss" scoped>
div.wrap {
  overflow-y: auto;
  height: 100dvh;
  width: 100dvw;
}
header {
  background: var(--bg);
  padding: 1.25rem 0;
  position: sticky;
  z-index: 2;
  top: -1rem;
}
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
  &.data div {
    margin-bottom: 0.5rem;
    display: flex;
    gap: 0.5rem;
  }

  &.appversion {
    font-size: 0.875rem;
    text-align: center;
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
