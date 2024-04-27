import { initializeApp } from "firebase/app";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBdzNlSAVqMLq7JIWwonzJztS1eMROCJyY",
  authDomain: "smp-sdl.firebaseapp.com",
  projectId: "smp-sdl",
  storageBucket: "smp-sdl.appspot.com",
  messagingSenderId: "1054742679816",
  appId: "1:1054742679816:web:388a0c329927f9b7515cbd",
};

export const firebaseApp = initializeApp(firebaseConfig);

export const db = initializeFirestore(firebaseApp, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

export const MONTHS = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
] as const;

const ERR: Typed<string> = {
  "auth/none": "Auth instance is not defined!",
};

export class LoadFirebaseError extends Error {
  code: string;

  constructor(code: string, loc?: string) {
    super(`${loc ? `<${loc}> ` : ""}${ERR[code]}`);

    this.code = code;
    this.name = "[!] Loading Firestore Failed";
  }
}
