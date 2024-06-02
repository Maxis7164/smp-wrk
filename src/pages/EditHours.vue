<script lang="ts" setup>
import { useDocument, getCurrentUser, useCollection } from "vuefire";
import { call } from "../components/banner";
import { collection, doc, query, where } from "firebase/firestore";
import { useRouter } from "vue-router";
import { addHours } from "../fire";
import { db } from "../fire";
import { ref } from "vue";

import DialogLayout from "../layouts/DialogLayout.vue";

const r = useRouter();

const D = new Date();
const NOPROF = "- auswählen -";

const date = ref<string>(D.toISOString().slice(0, 10));
const end = ref<string>(D.toTimeString().slice(0, 5));
const profile = ref<string>(NOPROF);
const loading = ref<boolean>(false);
const start = ref<string>("");

const user = await getCurrentUser();

const profiles = useCollection(
  query(collection(db, "profiles"), where("owner", "==", user!.uid)),
  { ssrKey: "prof" }
);

setTimeout(async () => {
  if (profiles.value.length === 0) await r.push("/settings/editProfile");
}, 5000);

async function save(): Promise<void> {
  if (
    profile.value === NOPROF ||
    date.value === "" ||
    start.value === "" ||
    end.value === ""
  )
    return call(
      "error",
      "Bitte wähle ein Profil aus und gib den Tag, sowie Anfangs- und Endzeit an"
    );

  const done = await addHours(
    profile.value,
    date.value.split("-"),
    start.value,
    end.value
  );

  if (!done)
    return call("error", "Deine Arbeitszeit kann nicht bei 0 Stunden liegen!");
  r.push("/");
}
</script>

<template>
  <DialogLayout @commit="save" name="Arbeitszeit hinzufügen" :loading>
    <label for="profile">
      <h3>Profil:</h3>
      <select v-model="profile">
        <option>- auswählen -</option>
        <option v-for="prof in profiles" :key="prof.name">
          {{ prof.name }}
        </option>
      </select>
    </label>
    <label for="date">
      <h4>Tag:</h4>
      <input
        v-model="date"
        type="date"
        name="date"
        id="date"
        placeholder="TT.MM.YYYY"
      />
    </label>
    <div class="hours">
      <label for="start">
        <h3>Von:</h3>
        <input
          v-model="start"
          type="time"
          name="start"
          id="start"
          placeholder="--:--"
        />
      </label>
      <label for="end">
        <h4>Bis:</h4>
        <input
          v-model="end"
          type="time"
          name="end"
          id="end"
          placeholder="--:--"
        />
      </label>
    </div>
  </DialogLayout>
</template>

<style lang="scss" scoped>
label {
  margin-bottom: 1rem;
  display: block;
  width: 100%;

  &[for="date"] {
    margin-bottom: 0.325rem;
  }

  h4 {
    margin: 0.125rem 0.125rem;
  }
  input,
  select {
    text-align: center;
    max-width: 100%;
    width: 100%;
  }
}

div.hours {
  display: flex;
  gap: 0.5rem;
}
</style>
