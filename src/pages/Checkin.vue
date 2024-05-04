<script lang="ts" setup>
import { doc, getDoc } from "firebase/firestore";
import { useFirebaseAuth } from "vuefire";
import { db, addHours } from "../fire";
import { useRouter } from "vue-router";
import { ref } from "vue";

import Loading from "../components/Loading.vue";
import { call } from "../components/banner";

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
  <div class="wrap">
    <header>
      <h1>Check In</h1>
    </header>
    <main>
      <label for="profile">
        <h3>Profil:</h3>
        <select :disabled="!!cur" v-model="profile">
          <option>- auswählen -</option>
          <option v-for="prof in profiles" :key="prof.name">
            {{ prof.name }}
          </option>
        </select>
      </label>
      <div class="hours">
        <label for="start">
          <h3>Start:</h3>
          <input
            :disabled="!!cur"
            v-model="start"
            type="time"
            name="start"
            id="start"
          />
        </label>
        <label v-if="cur" for="end">
          <h3>Ende:</h3>
          <input v-model="end" type="time" name="end" id="end" />
        </label>
      </div>
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
  width: clamp(200px, 50%, 800px);
  position: absolute;
  left: 50%;
  top: 55%;

  label {
    margin-bottom: 1rem;
    display: block;
    width: 100%;

    &[for="date"] {
      margin-bottom: 0.325rem;
    }

    h3 {
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
