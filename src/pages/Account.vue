<script lang="ts" setup>
import { useCurrentUser, useFirebaseAuth } from "vuefire";
import { confirm, prompt } from "../components/modal";
import { call } from "../components/banner";
import { delCurrentUser } from "../fire";
import { useRouter } from "vue-router";

import PageLayout from "../layouts/PageLayout.vue";
import { updateProfile } from "firebase/auth";
import { ref } from "vue";

const auth = useFirebaseAuth();
const user = useCurrentUser();
const r = useRouter();

function signOut(): void {
  if (!auth)
    return call(
      "error",
      "Ein unerwarteter Fehler kam auf - bitte versuche es erneut"
    );

  auth!.signOut();
  r.push("/load");
}

async function changeUsername(): Promise<void> {
  if (!auth)
    return call(
      "error",
      "Ein unerwarteter Fehler kam auf - bitte versuche es erneut"
    );

  const nxt = await prompt(
    "Wie möchtest du genannt werden?",
    "Nutzernamen ändern",
    {
      checkup: (usr) =>
        usr.length > 0
          ? usr.split("").includes(" ")
            ? "Dein Nutzername darf keine Leerzeichen beinhalten!"
            : ""
          : "Bitte gib einen Nutzernamen an",
    }
  );

  await updateProfile(user.value!, { displayName: nxt });
}

async function delAcc(): Promise<void> {
  if (!auth)
    return call(
      "error",
      "Ein unerwarteter Fehler kam auf - lade die Seite neu und versuche es erneut"
    );

  if (!auth.currentUser)
    return call(
      "error",
      "Account kann nicht gelöscht werden, da kein Account angemeldet ist!"
    );

  const doDel = await confirm(
    "Möchtest du wirklich deinen Account löschen?",
    "Account löschen",
    ["Ja", "Nein"]
  );

  const isSure = !doDel
    ? false
    : await confirm(
        "Bist du dir sicher? Alle deine Daten gehen verloren, solange du sie nicht gesichert hast!",
        "Account löschen"
      );

  if (isSure) await delCurrentUser();
}
</script>

<template>
  <PageLayout name="Dein Account">
    <section class="user">
      <p>Angemeldet als</p>
      <h2 v-if="user?.displayName">{{ user?.displayName ?? "" }}</h2>
      <p>{{ user?.email ?? "NO-MAIL" }}</p>
    </section>
    <section class="edit">
      <ul>
        <li>
          <button @click="changeUsername">Nutzernamen Bearbeiten</button>
        </li>
      </ul>
    </section>
    <section class="manage">
      <ul>
        <li>
          <button @click="signOut" class="risk">Abmelden</button>
        </li>
        <li>
          <button @click="delAcc" class="risk">Account Löschen</button>
        </li>
      </ul>
    </section>
  </PageLayout>
</template>

<style lang="scss" scoped>
section {
  margin-bottom: 1.25rem;

  &.user {
    background: var(--srf);
    border-radius: 1rem;
    text-align: center;
    padding: 1.25rem;

    :not(:last-child) {
      margin-bottom: 0.5rem;
    }
    p {
      font-size: 0.875rem;
    }
  }

  ul {
    background: var(--srf);
    border-radius: 1rem;

    li {
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

      button {
        padding: 1.25rem;
        width: 100%;
      }
    }
  }
}
</style>
