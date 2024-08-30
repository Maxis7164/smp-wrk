<script lang="ts" setup>
import { getCurrentUser, useCollection } from "vuefire";
import { addHours, getProfilesOf } from "src/fire";
import { banner } from "@composables/banner";
import { useRouter } from "vue-router";
import { ref } from "vue";

import DialogLayout from "@layouts/DialogLayout.vue";
import { Datestamp } from "src/utils";

const r = useRouter();

const D = new Date();
const NOPROF = "- auswählen -";

const date = ref<string>(D.toISOString().slice(0, 10));
const end = ref<string>(D.toTimeString().slice(0, 5));
const profile = ref<string>(NOPROF);
const loading = ref<boolean>(false);
const start = ref<string>("");

const user = await getCurrentUser();

const profiles = useCollection(getProfilesOf(user!), { ssrKey: "prof" });

setTimeout(async () => {
  if (profiles.value.length === 0) await r.push("/settings/editProfile");
}, 5000);

async function save(): Promise<void> {
  loading.value = true;

  if (
    profile.value === NOPROF ||
    date.value === "" ||
    start.value === "" ||
    end.value === ""
  ) {
    loading.value = false;
    return banner(
      "error",
      "Bitte wähle ein Profil aus und gib den Tag, sowie Anfangs- und Endzeit an"
    );
  }

  const done = await addHours(
    profile.value,
    Datestamp.fromIsoString(date.value),
    start.value,
    end.value
  );

  loading.value = false;
  if (!done)
    return banner(
      "error",
      "Deine Arbeitszeit kann nicht bei 0 Stunden liegen!"
    );
  r.push("/");
}
</script>

<template>
  <DialogLayout @commit="save" name="Arbeitszeit hinzufügen" :loading>
    <label for="profile">
      <h3>Profil:</h3>
      <select v-model="profile">
        <option>- auswählen -</option>
        <option
          v-for="prof in profiles"
          :value="(prof as any).id"
          :key="prof.name"
        >
          {{ prof.name }}
        </option>
      </select>
    </label>
    <label for="date">
      <h3>Tag:</h3>
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
        <h3>Bis:</h3>
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

  h3 {
    margin: 0.25rem 0.125rem;
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
