<script lang="ts" setup>
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useRoute, useRouter } from "vue-router";
import { getDocs } from "firebase/firestore";
import { banner } from "@composables/banner";
import { useFirebaseAuth } from "vuefire";
import { getProfilesOf } from "src/fire";
import { ref } from "vue";

import Loading from "@components/Loading.vue";

const auth = useFirebaseAuth();
const route = useRoute();
const r = useRouter();

auth!.authStateReady().then(() => {
  auth!.currentUser ? r.push("/") : (load.value = true);
});

const load = ref<boolean>(false);

async function loginGoogle(): Promise<void> {
  if (!auth)
    return console.error(
      "[!] <Load.vue> Cannot sign in with popup due to auth not being defined!"
    );

  const google = new GoogleAuthProvider();

  load.value = false;
  try {
    const cred = await signInWithPopup(auth, google);

    const profiles = await getDocs(getProfilesOf(cred.user));

    if (profiles.empty)
      r.push({ path: "/settings/editProfile", query: { setup: 1 } });
    else r.push(route.query["redir"] ? (route.query.redir as string) : "/");
  } catch (err) {
    console.error(
      `[!] <Load.vue::loginGoogle()> Login failed: ${(err as any).message}`
    );
    banner("error", "Login failed, please try again.");
  }
  load.value = true;
}
</script>

<template>
  <div :class="{ load }" class="wrap">
    <header>
      <h1>Willkommen!</h1>
      <h3>Bitte melde dich an</h3>
    </header>
    <Loading icon :load="!load" />
    <footer>
      <button @click="loginGoogle">Anmelden mit Google</button>
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
div.wrap.load header h3,
div.wrap.load footer {
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
