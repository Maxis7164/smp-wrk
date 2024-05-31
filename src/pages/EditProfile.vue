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
import DialogLayout from "../layouts/DialogLayout.vue";

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
  <DialogLayout @commit="save" name="Profil hinzufügen" :loading>
    <label for="name">
      <h4>Name:</h4>
      <input
        v-model="name"
        placeholder="z. B. Freelance"
        type="text"
        name="name"
        id="name"
      />
    </label>
    <label for="pay">
      <h4>Stundenlohn:</h4>
      <input
        v-model="pay"
        step="0.25"
        min="0"
        type="number"
        name="pay"
        id="pay"
      />
    </label>
  </DialogLayout>
</template>

<style lang="scss" scoped>
label {
  margin-bottom: 1rem;
  display: block;

  h4 {
    margin: 0.125rem 0.125rem;
  }
  input {
    text-align: center;
    max-width: 100%;
    width: 100%;
  }
}
</style>
