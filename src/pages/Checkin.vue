<script lang="ts" setup>
import { doc, getDoc } from "firebase/firestore";
import { call } from "../components/banner";
import { useFirebaseAuth } from "vuefire";
import { db, addHours } from "../fire";
import { useRouter } from "vue-router";
import { ref } from "vue";

import DialogLayout from "../layouts/DialogLayout.vue";

const auth = useFirebaseAuth();
const r = useRouter();

const PATH = "smp-wrk/curCheckInStart";
const NOPROF = "- auswählen -";
const D = new Date();

let cur: CheckIn | null = JSON.parse(localStorage.getItem(PATH) ?? "null");

if (cur?.profile === NOPROF) {
  localStorage.removeItem(PATH);
  cur = null;
}

const start = ref<string>(cur?.begin ?? D.toTimeString().slice(0, 5));
const end = ref<string>(D.toTimeString().slice(0, 5));
const profile = ref<string>(cur?.profile ?? NOPROF);
const loading = ref<boolean>(true);
const profiles = ref<Profiles>({});

auth?.onAuthStateChanged(async (user) => {
  profiles.value = user
    ? (await getDoc(doc(db, "profiles", user.uid))).data() ?? {}
    : {};

  loading.value = false;
});

async function save(): Promise<void> {
  if (profile.value === NOPROF) return call("error", "Bitte gib ein Profil an");

  if (cur) {
    await addHours(profile.value, cur.date, start.value, end.value);
    localStorage.removeItem(PATH);
    r.push("/");
  } else {
    const check: CheckIn = {
      date: D.toISOString().slice(0, 10).split("-"),
      profile: profile.value,
      begin: start.value,
    };

    localStorage.setItem(PATH, JSON.stringify(check));
    r.push("/");
  }
}
</script>

<template>
  <DialogLayout @commit="save" :name="cur ? 'Check In' : 'Check Out'" :loading>
    <label for="profile">
      <h4>Profil:</h4>
      <select :disabled="!!cur" v-model="profile">
        <option>- auswählen -</option>
        <option v-for="prof in profiles" :key="prof.name">
          {{ prof.name }}
        </option>
      </select>
    </label>
    <div class="hours">
      <label for="start">
        <h4>Start:</h4>
        <input
          :disabled="!!cur"
          v-model="start"
          type="time"
          name="start"
          id="start"
        />
      </label>
      <label v-if="cur" for="end">
        <h4>Ende:</h4>
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
