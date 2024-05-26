<script lang="ts" setup>
import { confirm } from "../components/modal";
import { call } from "../components/banner";
import { deleteUser } from "firebase/auth";
import { useFirebaseAuth } from "vuefire";
import { useRouter } from "vue-router";

import PageLayout from "../layouts/PageLayout.vue";

const auth = useFirebaseAuth();
const r = useRouter();

function signOut(): void {
  if (!auth)
    call("error", "Ein unerwarteter Fehler kam auf - bitte versuche es erneut");

  auth!.signOut();
  r.push("/load");
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

  if (isSure) await deleteUser(auth.currentUser);
}
</script>

<template>
  <PageLayout name="Dein Account">
    <section class="user">
      <p>Angemeldet als</p>
      <h2>Max</h2>
      <p>maxdopp.md@gmail.com</p>
    </section>
    <section class="edit">
      <ul>
        <li>
          <button>Nutzernamen Bearbeiten</button>
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
