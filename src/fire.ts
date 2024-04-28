import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  getDoc,
  doc,
  DocumentReference,
} from "firebase/firestore";
import { saveFile } from "./files";

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

export async function expDb(): Promise<boolean> {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user)
    return (
      false &&
      console.error(
        "[!] <src/fire.ts> Cannot access user data while not being signed in!"
      )
    );

  const pd = doc(db, "profiles", user.uid) as DocumentReference<Profiles>;
  const hd = doc(db, "hours", user.uid) as DocumentReference<Hours>;

  const [profiles, hours] = await Promise.all([getDoc(pd), getDoc(hd)]);

  const data: DatabaseExport = {
    profiles: profiles.data() ?? {},
    hours: hours.data() ?? {},
    version: 0,
  };

  try {
    saveFile([JSON.stringify(data)], "Simpler-Work-Data.json", {
      type: "application/json",
    });
    return true;
  } catch (err) {
    console.error(`[!] <fire.ts> Could not save file: ${err}`);
    return false;
  }
}
