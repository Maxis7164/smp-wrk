<script lang="ts" setup>
import {
  doc,
  updateDoc,
  setDoc,
  getDoc,
  DocumentReference,
} from "firebase/firestore";
import { useRoute, useRouter } from "vue-router";
import { call } from "../components/banner";
import { useFirebaseAuth } from "vuefire";
import { type User } from "firebase/auth";
import { db } from "../fire";
import { ref } from "vue";

import Loading from "../components/Loading.vue";

const auth = useFirebaseAuth();
const route = useRoute();
const r = useRouter();

const loading = ref<boolean>(false);
const pay = ref<string | number>(12.41);
const name = ref<string>("");

auth!.onAuthStateChanged((user) => (user ? load(user) : null));

async function load(user: User): Promise<any> {
  const profile = route.query["profile"];

  if (!profile || typeof profile !== "string") return;

  loading.value = true;

  const snap = await getDoc(
    doc(db, "profiles", user.uid) as DocumentReference<Typed<Profile>>
  );
  const data = snap.data();

  if (!data || !(profile in data)) {
    call("error", `Profil ${profile} nicht gefunden`);
    return r.push("/settings");
  }

  name.value = data[profile].name;
  pay.value = data[profile].pph;

  loading.value = false;
}

async function save() {
  if (!auth)
    return call(
      "error",
      "Etwas unerwartetes ist passiert - bitte lade die Seite neu"
    );

  if (!auth.currentUser)
    return call(
      "error",
      "Du bist nicht angemeldet - versuche, die Seite neu zu laden"
    );

  if (name.value.length === 0) return call("error", "Gib bitte einen Namen an");

  const uid = auth.currentUser.uid;

  try {
    loading.value = true;

    const pph =
      typeof pay.value === "string"
        ? parseFloat(pay.value.split(",").join("."))
        : pay.value;

    const profile: Profile = {
      name: name.value,
      pph,
    };

    const prof = doc(db, "profiles", uid);

    try {
      await updateDoc(prof, { [profile.name]: profile });
    } catch (err) {
      if ((err as any).code) setDoc(prof, { [profile.name]: profile });
    }
  } catch (err) {
    console.error(err);
  }

  if ("setup" in route.query) return r.push("/");

  r.back();
}
</script>

<template>
  <div class="wrap">
    <header>
      <h1>Profil bearbeiten</h1>
      <h3>Erstelle ein neues Arbeitsprofil</h3>
    </header>
    <main>
      <label for="name">
        <h3>Name:</h3>
        <input
          v-model="name"
          placeholder="z. B. Freelance"
          type="text"
          name="name"
          id="name"
        />
      </label>
      <label for="pay">
        <h3>Stundenlohn:</h3>
        <input
          v-model="pay"
          step="0.25"
          min="0"
          type="number"
          name="pay"
          id="pay"
        />
      </label>
    </main>
    <footer>
      <button @click="$router.back()">Zurück</button>
      <button @click="save" class="high">Speichern</button>
    </footer>
    <Loading back :load="loading" />
  </div>
</template>

<style lang="scss" scoped>
header {
  transform: translate(-50%, -20%);
  text-align: center;
  position: absolute;
  left: 50%;
  top: 20%;

  h3 {
    transition: opacity 500ms;
  }
}
main {
  transform: translate(-50%, -55%);
  position: absolute;
  width: 50%;
  left: 50%;
  top: 55%;

  label {
    margin-bottom: 1rem;
    display: block;

    h3 {
      margin: 0.125rem 0.125rem;
    }
    input {
      text-align: center;
      max-width: 100%;
      width: 100%;
    }
  }
}
footer {
  transform: translate(-50%, 20%);
  justify-content: space-between;
  transition: opacity 500ms;
  position: absolute;
  display: flex;
  gap: 0.75rem;
  bottom: 15%;
  left: 50%;

  button {
    white-space: nowrap;
    margin-bottom: 10px;
    width: 100%;
  }
}
</style>
