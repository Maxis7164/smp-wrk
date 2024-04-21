<script lang="ts" setup>
import {
  doc,
  setDoc,
  addDoc,
  limit,
  query,
  where,
  collection,
  getDocs,
} from "firebase/firestore";
import { useCollection, useFirebaseAuth } from "vuefire";
import { call } from "../components/banner";
import { useRoute, useRouter } from "vue-router";
import { db } from "../fire";
import { ref } from "vue";

import Loading from "../components/Loading.vue";

const auth = useFirebaseAuth();
const route = useRoute();
const r = useRouter();

const loading = ref<boolean>(false);
const pay = ref<string>("12.41");
const name = ref<string>("");

async function load(): Promise<void> {
  const profile = route.query["profile"];
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

  if (name.value.length === 0 || pay.value.length === 0)
    return call("error", "Gib bitte einen Namen und einen Stundenlohn an");

  const uid = auth.currentUser.uid;

  try {
    loading.value = true;

    const profs = collection(db, "profiles");

    const q = query(
      profs,
      where("owner", "==", uid),
      where("name", "==", name.value),
      limit(1)
    );

    const pph =
      typeof pay.value === "string"
        ? parseFloat(pay.value.split(",").join("."))
        : pay.value;

    const profile: Profile = {
      name: name.value,
      owner: uid,
      pph,
    };

    const snap = await getDocs(q);

    if (snap.docs.length > 0) {
      setDoc(snap.docs[0].ref, profile);
    } else {
      addDoc(profs, profile);
    }
  } catch (err) {
    console.error(err);
  }

  if ("setup" in route.query) return r.push("/");

  r.back();
}
</script>

<template>
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
  <Loading :load="loading" />
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
