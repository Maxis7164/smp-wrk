<script lang="ts" setup>
import { doc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { useDocument, getCurrentUser } from "vuefire";
import { call } from "../components/banner";
import { useRouter } from "vue-router";
import { db } from "../fire";
import { ref } from "vue";

import Loading from "../components/Loading.vue";

const r = useRouter();

const D = new Date();
const NOPROF = "- auswählen -";

const date = ref<string>(D.toISOString().slice(0, 10));
const end = ref<string>(D.toTimeString().slice(0, 5));
const profile = ref<string>(NOPROF);
const loading = ref<boolean>(false);
const start = ref<string>("");

const user = await getCurrentUser();

const { data: profiles, error } = useDocument<Typed<Profile>>(
  doc(db, `profiles/${user!.uid}`)
);

if (Object.keys(profiles.value ?? {}).length === 0)
  await r.push("/settings/editProfile");

function calcTotal(start: string, end: string): number {
  const s = new Date(`2004-04-22T${start}:00Z`).getTime();
  const e = new Date(`2004-04-22T${end}:00Z`).getTime();

  const total = (e - s) / 1000 / 60 / 60;

  return Math.floor(total * 100) / 100;
}

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

  const hours = doc(db, `hours/${user!.uid}`);

  const hour: Hour = {
    total: calcTotal(start.value, end.value),
    date: date.value.split("-"),
    profile: profile.value,
    begin: start.value,
    end: end.value,
  };

  try {
    await updateDoc(hours, { [profile.value]: arrayUnion(hour) });

    r.push("/");
  } catch (err) {
    if ((err as any).code === "not-found")
      await setDoc(hours, { [profile.value]: [hour] });
  }
}
</script>

<template>
  <div class="wrap">
    <header>
      <h1>Arbeitszeit hinzufügen</h1>
    </header>
    <main>
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
        <h3>Tag:</h3>
        <input v-model="date" type="date" name="date" id="date" />
      </label>
      <div class="hours">
        <label for="start">
          <h3>Von:</h3>
          <input v-model="start" type="time" name="start" id="start" />
        </label>
        <label for="end">
          <h3>Bis:</h3>
          <input v-model="end" type="time" name="end" id="end" />
        </label>
      </div>
    </main>
    <footer>
      <button @click="$router.back()">Zurück</button>
      <button @click="save" class="high">Speichern</button>
    </footer>
    <Loading :load="loading" />
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
