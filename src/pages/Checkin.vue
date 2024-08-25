<script lang="ts" setup>
import { addHours, getCheckInOf, getProfilesOf, CheckIn } from "src/fire";
import { useCollection, useCurrentUser, useDocument } from "vuefire";
import { deleteDoc, setDoc } from "firebase/firestore";
import { banner } from "@composables/banner";
import { useRouter } from "vue-router";
import { ref, watch } from "vue";

import DialogLayout from "@layouts/DialogLayout.vue";

const user = useCurrentUser();
const r = useRouter();

const NOPROF = "- auswählen -";
const D = new Date();

const check = useDocument(getCheckInOf(user.value!));
const profiles = useCollection(getProfilesOf(user.value!), {
  ssrKey: "profiles",
});

const start = ref<string>(D.toTimeString().slice(0, 5));
const end = ref<string>(D.toTimeString().slice(0, 5));
const profile = ref<string>(NOPROF);
const loading = ref<boolean>(false);

watch(
  check,
  (nxt) => {
    if (nxt) {
      profile.value = nxt.profile;
      start.value = nxt.begin;
    }

    loading.value = false;
  },
  { once: true }
);

async function save(): Promise<void> {
  if (profile.value === NOPROF)
    return banner("error", "Bitte gib ein Profil an");

  loading.value = true;

  if (check.value) {
    const done = await addHours(
      profile.value,
      check.value.date,
      start.value,
      end.value
    );

    await deleteDoc(getCheckInOf(user.value!));

    if (!done)
      return banner(
        "error",
        "Deine Arbeitszeit kann nicht bei 0 Stunden liegen!"
      );
    r.push("/");
  } else {
    const check: CheckIn = {
      date: D.toISOString().slice(0, 10).split("-"),
      profile: profile.value,
      begin: start.value,
    };

    await setDoc(getCheckInOf(user.value!), check);

    r.push("/");
  }
  loading.value = false;
}
</script>

<template>
  <DialogLayout
    @commit="save"
    :name="check ? 'Check Out' : 'Check In'"
    :loading
  >
    <label for="profile">
      <h3>Profil:</h3>
      <select :disabled="!!check" v-model="profile">
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
    <div class="hours">
      <label for="start">
        <h3>Start:</h3>
        <input
          :disabled="!!check"
          v-model="start"
          type="time"
          name="start"
          id="start"
        />
      </label>
      <label v-if="check" for="end">
        <h3>Ende:</h3>
        <input v-model="end" type="time" name="end" id="end" />
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
