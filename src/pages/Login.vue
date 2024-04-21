<script lang="ts" setup>
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { useFirebaseAuth } from "vuefire";
import { ref } from "vue";
import { call } from "../components/banner";

import Loading from "../components/Loading.vue";
import { useRouter } from "vue-router";

const auth = useFirebaseAuth();
const r = useRouter();

const load = ref<boolean>(false);
const email = ref<string>("");
const pswrd = ref<string>("");

async function loginEmail(): Promise<void> {
  if (!auth)
    return console.error(
      "[!] <Load.vue> Cannot sign in with popup due to auth not being defined!"
    );

  let isValid: boolean = false;

  if (email.value.length === 0 || pswrd.value.length === 0)
    return call("error", "Gib bitte eine Email und ein Passwort ein");

  load.value = true;

  try {
    await createUserWithEmailAndPassword(auth, email.value, pswrd.value);
    isValid = true;
  } catch (err) {
    if ((err as any).code === "auth/email-already-in-use") {
      try {
        await signInWithEmailAndPassword(auth, email.value, pswrd.value);
        isValid = true;
      } catch (err) {
        call(
          "error",
          "Ein unerwarteter Fehler kam auf - bitte versuche es erneut"
        );
      }
    } else
      call(
        "error",
        "Ein unerwarteter Fehler kam auf - bitte versuche es erneut"
      );
  }

  load.value = false;

  if (isValid) r.push({ path: "/editProfile", query: { setup: 1 } });
}
</script>

<template>
  <header>
    <h1>Willkommen!</h1>
    <h3>per Email anmelden</h3>
  </header>
  <main>
    <label for="email">
      <h3>Email:</h3>
      <input v-model="email" type="email" name="email" id="email" />
    </label>
    <label for="pswrd">
      <h3>Password:</h3>
      <input v-model="pswrd" type="password" name="pswrd" id="pswrd" />
    </label>
  </main>
  <footer>
    <button @click="$router.back()">Zurück</button>
    <button @click="loginEmail" class="high">Weiter</button>
  </footer>
  <Loading back :load />
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
  position: absolute;
  left: 50%;
  top: 55%;

  label {
    margin-bottom: 1rem;
    display: block;

    h3 {
      margin: 0.125rem 0.125rem;
    }
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
