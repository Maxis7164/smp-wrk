<script lang="ts" setup>
import {
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
} from "firebase/auth";
import { call } from "../components/banner";
import { useFirebaseAuth } from "vuefire";
import { ref } from "vue";

import Loading from "../components/Loading.vue";
import { useRouter } from "vue-router";

const auth = useFirebaseAuth();
const r = useRouter();

const load = ref<boolean>(false);

// onAuthStateChanged(auth!, (user) =>
//   user && !load ? setTimeout(() => r.push("/"), 1000) : null
// );

async function loginGoogle(): Promise<void> {
  if (!auth)
    return console.error(
      "[!] <Load.vue> Cannot sign in with popup due to auth not being defined!"
    );

  const google = new GoogleAuthProvider();
  let isValid: boolean = false;

  load.value = false;
  try {
    await signInWithPopup(auth, google);
    isValid = true;
  } catch (err) {
    console.error(
      `[!] <Load.vue::loginGoogle()> Login failed: ${(err as any).message}`
    );
    call("error", "Login failed, please try again.");
  }

  if (isValid) r.push("/");
  else load.value = true;
}

setTimeout(() => (load.value = true), 3000);
</script>

<template>
  <div :class="{ load }" id="wrap">
    <header>
      <h1>Willkommen!</h1>
      <h3>Bitte melde dich an</h3>
    </header>
    <Loading icon :load="!load" />
    <footer>
      <button @click="loginGoogle">Anmelden mit Google</button>
      <button @click="$router.push('/login')">Anmelden per Email</button>
    </footer>
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
    opacity: 0;
  }
}
footer {
  transform: translate(-50%, -80%);
  transition: opacity 500ms;
  position: absolute;
  opacity: 0;
  left: 50%;
  top: 80%;

  button {
    white-space: nowrap;
    margin-bottom: 10px;
    width: 100%;
  }
}
div#wrap.load header h3,
div#wrap.load footer {
  opacity: 1;
}

@keyframes loading {
  5% {
    left: -5px;
  }
  95% {
    left: 119px;
  }
}
</style>
