<script lang="ts" setup>
import { getProfile, updateProfile } from "src/fire";
import { useRoute, useRouter } from "vue-router";
import { banner } from "@composables/banner";
import { useCurrentUser } from "vuefire";
import { ref, watch } from "vue";

import DialogLayout from "@layouts/DialogLayout.vue";

type LocationQueryType = typeof route.query.a;

const user = useCurrentUser();
const route = useRoute();
const r = useRouter();

const setup: boolean = "setup" in route.query;

const pay = ref<number>(12.41);
const loading = ref<boolean>(false);
const name = ref<string>("");
const id = ref<string>("");

watch(
  () => route.params.profile,
  (nxt) => load(nxt)
);

async function load(prof: LocationQueryType) {
  if (typeof prof !== "string") return;

  if (prof.length === 0) return;

  const doc = await getProfile(prof);

  if (doc.exists()) {
    const profile = doc.data()!;

    name.value = profile.name;
    pay.value = profile.pph;
    id.value = doc.id;
  }
}

async function save() {
  if (name.value.length === 0)
    return banner("error", "Gib bitte einen Namen an");
  if (pay.value <= 0)
    return banner(
      "error",
      "Dein Arbeitsprofil kann keinen Stundenlohn kleiner oder gleich 0 haben!"
    );

  loading.value = true;
  await updateProfile(
    {
      owner: user.value!.uid,
      name: name.value,
      pph: pay.value,
    },
    id.value
  );

  if (setup) return r.push("/");

  r.back();
}

load(route.query.profile ?? "");
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
