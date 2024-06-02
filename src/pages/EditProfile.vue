<script lang="ts" setup>
import { addDoc, collection } from "firebase/firestore";
import { useRoute, useRouter } from "vue-router";
import { call } from "../components/banner";
import { useCurrentUser } from "vuefire";
import { db } from "../fire";
import { ref } from "vue";

import DialogLayout from "../layouts/DialogLayout.vue";

const profiles = collection(db, "profiles");

const user = useCurrentUser();
const route = useRoute();
const r = useRouter();

const setup: boolean = "setup" in route.query;

const loading = ref<boolean>(false);
const pay = ref<string | number>(12.41);
const name = ref<string>("");

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

    addDoc(profiles, profile);
  } catch (err) {
    console.error(err);
  }

  if (setup) return r.push("/");

  r.back();
}
</script>

<template>
  <DialogLayout @commit="save" name="Profil hinzufügen" :setup :loading>
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
