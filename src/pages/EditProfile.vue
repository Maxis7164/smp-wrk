<script lang="ts" setup>
import {
  addDoc,
  collection,
  doc,
  getDocs,
  updateDoc,
  where,
} from "firebase/firestore";
import { useRoute, useRouter } from "vue-router";
import { call } from "../components/banner";
import { useCurrentUser } from "vuefire";
import { db, getProfilesOf } from "../fire";
import { ref, watch } from "vue";

import DialogLayout from "../layouts/DialogLayout.vue";

const profiles = collection(db, "profiles");

const user = useCurrentUser();
const route = useRoute();
const r = useRouter();

const setup: boolean = "setup" in route.query;

const pay = ref<string | number>(12.41);
const loading = ref<boolean>(false);
const name = ref<string>("");
const id = ref<string>("");

watch(
  () => route.params.profile,
  (nxt) => load(nxt)
);

async function load(prof: string | string[]) {
  if (typeof prof !== "string") return;

  const doc = (
    await getDocs(getProfilesOf(user.value!, where("name", "==", prof)))
  ).docs.at(0);

  if (!doc) return;

  const profile = doc.data();

  id.value = doc.id ?? "";

  name.value = prof;
  pay.value = profile.pph;
}

async function save() {
  if (name.value.length === 0) return call("error", "Gib bitte einen Namen an");

  try {
    loading.value = true;

    const pph =
      typeof pay.value === "string"
        ? parseFloat(pay.value.split(",").join("."))
        : pay.value;

    const profile: NewProfile = {
      owner: user.value!.uid,
      name: name.value,
      pph,
    };

    if (id.value.length > 0) updateDoc(doc(db, "profiles", id.value), profile);
    else addDoc(profiles, profile);
  } catch (err) {
    console.error(err);
  }

  if (setup) return r.push("/");

  r.back();
}

if ("profile" in route.params) load(route.params.profile);
</script>

<template>
  <DialogLayout @commit="save" name="Profil hinzufügen" :setup :loading>
    <label for="name">
      <h3>Wo arbeitest du?</h3>
      <input
        v-model="name"
        placeholder="z. B. Freelance"
        type="text"
        name="name"
        id="name"
      />
    </label>
    <label for="pay">
      <h3>Wie viel verdienst du da?</h3>
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

  h3 {
    margin: 0.25rem 0.125rem;
  }
  input {
    text-align: center;
    max-width: 100%;
    width: 100%;
  }
}
</style>
