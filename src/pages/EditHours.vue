<script lang="ts" setup>
import {
  addHours,
  db,
  getProfilesOf,
  Hour,
  PROFSSR,
  updateHours,
} from "src/fire";
import { getCurrentUser, useCollection } from "vuefire";
import { useRoute, useRouter } from "vue-router";
import { doc, getDoc } from "firebase/firestore";
import { banner } from "@composables/banner";
import { Datestamp } from "src/utils";
import { computed, ref } from "vue";

import DialogLayout from "@layouts/DialogLayout.vue";
import Icon from "@components/Icon.vue";

const r = useRouter();
const route = useRoute();
const id = computed(() => route.query.id);

const D = new Date();
const NOPROF = "NONE";

const date = ref<string>(D.toISOString().slice(0, 10));
const end = ref<string>(D.toTimeString().slice(0, 5));
const profile = ref<string>(NOPROF);
const loading = ref<boolean>(false);
const start = ref<string>("");

const user = await getCurrentUser();

const profiles = useCollection(getProfilesOf(user!), PROFSSR);

setTimeout(async () => {
  if (profiles.value.length === 0) await r.push("/settings/editProfile");
}, 5000);

function dateUpdated() {
  const cur = new Date(`${date.value}T${start.value}`);

  if (cur.getTime() > D.getTime()) console.log("future");
}

async function load() {
  if (id.value) {
    if (typeof id.value !== "string") return;

    const [p, h] = id.value.split("/");

    const snap = await getDoc(doc(db, "profiles", p, "hours", h));

    if (!snap.exists()) return;

    const data = snap.data() as Hour;

    profile.value = data.profile;
    date.value = Datestamp.fromData(data.date).toISOFormat();
    start.value = data.start;
    end.value = data.end;
  }
}

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

  if (!id.value) {
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
  } else {
    await updateHours(id.value as string, start.value, end.value);
    loading.value = false;
    r.back();
  }
}

const isFuture = () => new Date(date.value).getTime() > D.getTime();

load();
</script>

<template>
  <DialogLayout @commit="save" name="Arbeitszeit hinzufügen" :loading>
    <label for="profile">
      <h3>Profil:</h3>
      <select :disabled="!!id" v-model="profile">
        <option :value="NOPROF" disabled>- auswählen -</option>
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
        :disabled="!!id"
        @change="dateUpdated"
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
          @change="dateUpdated"
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
    <div v-if="isFuture()" class="info">
      <Icon name="info" :size="1" />
      <p>Diese Arbeitszeit liegt in der Zukunft</p>
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
div.info {
  align-items: center;
  display: flex;
  gap: 0.5rem;
}

div.hours {
  display: flex;
  gap: 0.5rem;
}
</style>
