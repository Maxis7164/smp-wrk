<script lang="ts" setup>
import {
  useFirebaseAuth,
  useCurrentUser,
  useCollection,
  getCurrentUser,
} from "vuefire";
import { collection, query, where } from "firebase/firestore";
import { setTheme, getTheme, type Theme } from "../theme";
import { call } from "../components/banner";
import { useRouter } from "vue-router";
import { db } from "../fire";
import { ref } from "vue";

import SlideButton from "../components/SlideButton.vue";

const auth = useFirebaseAuth();
const user = useCurrentUser();
const r = useRouter();

await getCurrentUser();

const a = query(
  collection(db, "profiles"),
  where("owner", "==", user.value?.uid ?? "ERR")
);

const b = useCollection<Profile>(a);

function signOut(): void {
  if (!auth)
    call("error", "Ein unerwarteter Fehler kam auf - bitte versuche es erneut");

  auth!.signOut();
  r.push("/load");
}
</script>

<template>
  <div id="wrap">
    <header>
      <h1>Einstellungen</h1>
    </header>
    <section class="account">
      <p>Angemeldet als:</p>
      <h2>{{ user?.displayName ?? "loading..." }}</h2>
      <button @click="signOut" class="text risk">abmelden</button>
    </section>
    <section class="profiles">
      <h2>Arbeitsprofile</h2>
      <ul>
        <li v-if="user" v-for="d in b" :key="d.id">
          <h3>{{ d.name }}</h3>
          <p>{{ d.pph }}€/h</p>
          <button class="text">Bearbeiten</button>
          <button class="text risk">Löschen</button>
        </li>
        <li class="add">
          <button>Profil hinzufügen</button>
        </li>
      </ul>
    </section>
    <section class="theme">
      <h2>Appthema</h2>
      <SlideButton
        :default="getTheme()"
        @update="(v) => setTheme(v as Theme)"
      />
    </section>
    <section class="data">
      <button>Daten exportieren</button>
    </section>
    <footer>
      <button @click="$router.back()" class="icon">&lt;</button>
    </footer>
  </div>
</template>

<style lang="scss" scoped>
header {
  background: var(--bg);
  padding: 0.625rem 0;
  margin: 0.625rem 0;
  position: sticky;
  z-index: 2;
  top: 0;
}
section {
  margin-bottom: 1.25rem;

  &.account {
    background: var(--srf);
    border-radius: 1rem;
    padding: 1rem;

    p {
      font-size: 0.75rem;
    }
    h2 {
      margin-bottom: -5px;
      text-align: center;
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
footer {
  height: 50px;

  button {
    box-shadow: 0 0 4px 4px #0004;
    position: fixed;
    bottom: 1rem;
    left: 1rem;
  }
}
</style>