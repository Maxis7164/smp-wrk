<script lang="ts" setup>
import { useCurrentUser, useFirebaseAuth } from "vuefire";
import { doc, getDoc } from "firebase/firestore";
import { db, LoadFirebaseError } from "../fire";
import { useRouter } from "vue-router";
import { ref, watch } from "vue";

import Loading from "../components/Loading.vue";

const cur = localStorage.getItem("smp-wrk/curCheckInStart");
const curUser = useCurrentUser();
const auth = useFirebaseAuth();
const r = useRouter();

if (!auth) throw new LoadFirebaseError("auth/none");

const profi = ref<Typed<Profile>>({});
const hour = ref<Typed<Hour[]>>({});
const ready = ref<boolean>(false);

const currentHours = ref<number>(0);
const currentPay = ref<number>(0);
const allHours = ref<number>(0);

const D = new Date();

auth.onAuthStateChanged(async (user) => {
  if (!user) return r.push("/load");

  const [p, h] = await Promise.all([
    getDoc(doc(db, "profiles", user.uid)),
    getDoc(doc(db, "hours", user.uid)),
  ]);

  hour.value = h.data() as Typed<Hour[]>;
  profi.value = p.data() as Typed<Profile>;

  ready.value = true;
});

watch(hour, (hours) => {
  allHours.value = 0;
  currentHours.value = 0;
  currentPay.value = 0;

  if (profi.value && hours) {
    Object.keys(hours).forEach((p: string) => {
      if (p === "id") return;

      const tot = hours[p].map((h) => h.total);
      if (tot.length === 0) return;
      allHours.value += tot.reduce((acc, cur) => acc + cur);

      const cur = hours[p]
        .filter((h) => parseInt(h.date[1]) === D.getMonth() + 1)
        .map((h) => h.total);

      if (cur.length === 0) return;

      const h = cur.reduce((acc, cur) => acc + cur);

      currentHours.value += h;
      currentPay.value += h * profi.value![p].pph;
    });
  }
});

function getTotal(hours: Hour[]) {
  const nxt = hours.map((h) => h.total);

  return nxt.length === 0 ? 0 : nxt.reduce((acc, cur) => acc + cur);
}

function round(val: number): number {
  return Math.round(val * 100) / 100;
}
</script>

<template>
  <div class="wrap">
    <header>
      <h1>Hallo {{ curUser?.displayName ?? "ERR" }}!</h1>
    </header>
    <section class="current">
      <ul>
        <li>
          <h2>{{ round(currentHours) }} Stunden</h2>
          <p>hast du diesen Monat gearbeitet</p>
        </li>
        <li>
          <p>damit verdienst du</p>
          <h2>{{ round(currentPay) }}€</h2>
        </li>
      </ul>
    </section>
    <section class="hours">
      <h2>Deine Stunden</h2>
      <ul>
        <li>
          <button @click="$router.push('/hours')">
            <h3>Gesamt:</h3>
            <p>{{ round(allHours) }} Stunden</p>
          </button>
        </li>
        <li v-for="(h, prof) in hour">
          <button>
            <h3>{{ prof }}</h3>
            <p>{{ round(getTotal(h)) }} Stunden</p>
          </button>
        </li>
      </ul>
    </section>
    <section class="useful">
      <h2>Nützliches</h2>
      <ul>
        <li>
          <button @click="$router.push('/check-in')" class="icon">
            <svg
              v-if="cur"
              width="128"
              height="128"
              viewBox="0 0 128 128"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M95 37V23C95 17.4772 90.5228 13 85 13H42C36.4772 13 32 17.4772 32 23V105C32 110.523 36.4772 115 42 115H85C90.5228 115 95 110.523 95 105V91"
                stroke="black"
                stroke-width="10"
                stroke-linecap="round"
              />
              <path
                d="M80 64H109.5M109.5 64L101 51.5M109.5 64L101 76.5"
                stroke="black"
                stroke-width="10"
                stroke-linecap="round"
              />
            </svg>
            <svg
              v-if="!cur"
              width="128"
              height="128"
              viewBox="0 0 128 128"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M95 37V23C95 17.4772 90.5228 13 85 13H42C36.4772 13 32 17.4772 32 23V105C32 110.523 36.4772 115 42 115H85C90.5228 115 95 110.523 95 105V91M109.5 64H80M80 64L88.5 51.5M80 64L88.5 76.5"
                stroke="black"
                stroke-width="10"
                stroke-linecap="round"
              />
            </svg>
            Check {{ cur ? "Out" : "In" }}
          </button>
        </li>
        <li>
          <button @click="$router.push('/settings')" class="icon">
            <svg
              width="118"
              height="118"
              viewBox="0 0 118 118"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M50 5C50 2.23858 52.2386 0 55 0H63C65.7614 0 68 2.23858 68 5V18.4596C73.4269 19.659 78.455 21.9203 82.855 25.0144L92.3154 15.5541C94.268 13.6014 97.4338 13.6014 99.3864 15.5541L104.677 20.8443C106.629 22.7969 106.629 25.9627 104.677 27.9153L94.7377 37.8542C96.9405 41.569 98.5805 45.6568 99.5404 50H113C115.761 50 118 52.2386 118 55V63C118 65.7614 115.761 68 113 68H99.5404C98.4603 72.8869 96.5192 77.4503 93.8843 81.523L103.584 91.2228C105.537 93.1754 105.537 96.3412 103.584 98.2938L98.2938 103.584C96.3412 105.537 93.1754 105.537 91.2228 103.584L81.523 93.8843C77.4503 96.5192 72.8869 98.4604 68 99.5404V113C68 115.761 65.7614 118 63 118H55C52.2386 118 50 115.761 50 113V99.5404C45.39 98.5215 41.0678 96.7364 37.1739 94.3254L26.8227 104.677C24.8701 106.629 21.7043 106.629 19.7517 104.677L14.4615 99.3864C12.5088 97.4338 12.5088 94.268 14.4615 92.3153L24.5686 82.2082C21.7027 77.9647 19.6006 73.1628 18.4596 68H5C2.23858 68 0 65.7614 0 63V55C0 52.2386 2.23858 50 5 50H18.4596C19.5396 45.1131 21.4808 40.5497 24.1157 36.477L14.4615 26.8227C12.5088 24.8701 12.5088 21.7043 14.4615 19.7517L19.7517 14.4615C21.7043 12.5088 24.8701 12.5088 26.8227 14.4615L36.477 24.1157C40.5497 21.4808 45.1131 19.5396 50 18.4596V5ZM59 39.6891C48.3349 39.6891 39.6891 48.3349 39.6891 59C39.6891 69.6651 48.3349 78.3109 59 78.3109C69.6651 78.3109 78.3109 69.6651 78.3109 59C78.3109 48.3349 69.6651 39.6891 59 39.6891Z"
                fill="#C4C4C4"
              />
            </svg>
            Einstellungen
          </button>
        </li>
      </ul>
    </section>
    <footer>
      <button @click="$router.push('/editHours')" class="icon high add">
        <svg
          width="100"
          height="100"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M42 89C42 95.0249 43.9751 99.9091 50 99.9091C56.025 99.9091 58 95.0249 58 89V58H89.0908C95.1157 58 99.9999 56.0249 99.9999 50C99.9999 43.9751 95.1157 42 89.0908 42H58V11C58 4.97508 56.025 0.090909 50 0.090909C43.9751 0.090909 42 4.97508 42 11V42H11C4.97505 42 0.0908813 43.9751 0.0908813 50C0.0908813 56.0249 4.97505 58 11 58H42V89Z"
            fill="#C4C4C4"
          />
        </svg>
      </button>
    </footer>
    <Loading back :load="!ready" />
  </div>
</template>

<style lang="scss" scoped>
div.wrap {
  overflow-y: auto;
  padding-bottom: 2rem;
}

header {
  background: var(--bg);
  padding: 1.25rem 0;
  position: sticky;
  z-index: 2;
  top: -1rem;
}
section {
  margin-bottom: 1.25rem;

  &.current {
    text-align: center;

    ul li {
      padding: 1.5rem 1.25rem;

      :first-child {
        margin-bottom: 0.25rem;
      }
      p {
        font-size: 0.875rem;
      }
    }
  }
  &.hours {
    ul li {
      padding: 0;

      button {
        justify-content: space-between;
        padding: 1.25rem;
        display: flex;
        width: 100%;

        p {
          font-weight: 400;
        }
      }
    }
  }
  &.useful ul li {
    padding: 0;

    button {
      text-align: left;
      padding: 1rem;
      width: 100%;
    }
  }

  > h2 {
    margin: 0 0.125rem 0.625rem 0;
  }

  ul {
    background: var(--srf);
    border-radius: 1rem;

    li {
      position: relative;
      display: block;
      padding: 1rem;

      &:not(:last-child)::after {
        content: "";

        background: var(--brd);
        position: absolute;
        display: block;
        height: 1px;
        width: 95%;
        left: 2.5%;
        bottom: 0;
      }
    }
  }
}
footer {
  height: 50px;

  button {
    --size: 2.25rem;

    transition: right var(--anim-speed) ease-out, background-color 250ms;
    height: calc(var(--size) + 24px);
    width: calc(var(--size) + 24px);
    box-shadow: 0 0 4px 4px #0004;
    position: fixed;
    bottom: 1rem;
    right: 1rem;

    svg {
      margin-right: 0;
    }
  }
}
.wrap.slide-left-enter-from button.add {
  right: calc(100% + 1rem);
}
.wrap.slide-left-enter-to button.add {
  right: 1rem;
}
.wrap.slide-right-leave-from button.add {
  right: 1rem;
}
.wrap.slide-right-leave-to button.add {
  right: calc(100% + 1rem);
}
</style>
