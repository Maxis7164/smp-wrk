<script lang="ts" setup>
import {
  db,
  exists,
  fromUser,
  LoadFirebaseError,
  Profile,
  HourAggregation,
  getSummaryOf,
} from "src/fire";
import { useCollection, useCurrentUser, useFirebaseAuth } from "vuefire";
import { collection, query } from "firebase/firestore";
import { currency, round } from "src/utils";
import { ref } from "vue";

import PageLayout from "@layouts/PageLayout.vue";
import Loading from "@components/Loading.vue";
import Icon from "@components/Icon.vue";

const user = useCurrentUser();
const auth = useFirebaseAuth();

if (!auth) throw new LoadFirebaseError("auth/none");

const profiles = useCollection<Profile>(
  query(collection(db, "profiles"), fromUser(user.value!)),
  { ssrKey: "profiles" }
);

const ready = ref<boolean>(true);

const hasCheckedIn = ref<boolean>(false);
const totals = ref<HourAggregation>({ total: 0, pay: 0, month: 0 });

setTimeout(() => {
  exists(collection(db, "checkin"), user.value!.uid).then(
    (isCheckedIn) => (hasCheckedIn.value = isCheckedIn)
  );
}, 2000);

getSummaryOf(user.value!).then((res) => (totals.value = res));
</script>

<template>
  <PageLayout :name="user ? `Hallo ${user.displayName!}` : 'loading...'">
    <section class="current">
      <ul>
        <li>
          <h2>{{ round(totals.month).toLocaleString() }} Stunden</h2>
          <p>hast du diesen Monat gearbeitet</p>
        </li>
        <li>
          <p>damit verdienst du</p>
          <h2>{{ currency(round(totals.pay)) }}€</h2>
        </li>
      </ul>
    </section>
    <section class="hours">
      <h2>Deine Stunden</h2>
      <ul>
        <li>
          <button @click="$router.push('/hours')">
            <h3>Gesamt:</h3>
            <p>{{ round(totals.total).toLocaleString() }} Stunden</p>
          </button>
        </li>
        <li v-for="prof in profiles">
          <button @click="$router.push(`/hours/${prof.id}`)">
            <h3>{{ prof.name }}:</h3>
            <p>{{ round(totals[prof.name] ?? 0).toLocaleString() }} Stunden</p>
          </button>
        </li>
      </ul>
    </section>
    <section class="useful">
      <h2>Nützliches</h2>
      <ul>
        <li>
          <button @click="$router.push('/check-in')" class="icon">
            <Icon :name="hasCheckedIn ? 'checkout' : 'checkin'" />
            Check {{ hasCheckedIn ? "Out" : "In" }}
          </button>
        </li>
        <li>
          <button @click="$router.push('/settings')" class="icon">
            <Icon name="settings" />
            Einstellungen
          </button>
        </li>
      </ul>
    </section>
    <footer>
      <button @click="$router.push('/editHours')" class="icon high add">
        <Icon name="add" :size="2.25" />
      </button>
    </footer>
    <Loading back :load="!ready" />
  </PageLayout>
</template>

<style lang="scss" scoped>
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
  height: 3rem;

  button {
    transition: left var(--anim-speed) ease-out, background-color 250ms;
    box-shadow: 0 0 4px 4px #0004;
    padding: 1rem 0.25rem 1rem 1rem;
    position: fixed;
    bottom: 1rem;
    right: 1rem;
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
