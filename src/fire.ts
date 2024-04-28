import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  deleteDoc,
  getDoc,
  setDoc,
  doc,
  DocumentReference,
} from "firebase/firestore";
import { requestFile, saveFile } from "./files";
import { confirm } from "./components/modal";

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
        "[!] <fire.ts::expDb> Cannot access user data while not being signed in!"
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
    console.error(`[!] <fire.ts::expDb> Could not save file: ${err}`);
    return false;
  }
}

export async function impDb(): Promise<void> {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) return;

  const h = doc(db, "hours", user.uid);
  const p = doc(db, "profiles", user.uid);

  try {
    const file = await requestFile();

    const raw = await file.text();
    const data: DatabaseExport = JSON.parse(raw);

    if (import.meta.env.DB_VERSION < data.version)
      return console.error(
        "[!] <fire.ts::impDb> Database is newer than client!"
      );

    const doMerge = await confirm(
      "Soll die aktuelle und die angegebene Datenbank vereint werden? (Empfohlen: Ja)",
      "Datenbanken vereinen"
    );

    await setDoc(h, data.hours, { merge: doMerge });
    await setDoc(p, data.profiles, { merge: doMerge });
  } catch (err) {
    console.error(`[!] <fire.ts::impDb> ${err}`);
  }
}

export async function delDb(): Promise<boolean> {
  const doDel = await confirm(
    "Möchtest du wirklich alle Daten von dir löschen? Das beinhaltet alle deine Stunden und alle deine Arbeitsprofile",
    "Daten löschen"
  );

  const actDel = !doDel
    ? false
    : await confirm(
        "Bist du dir sicher? Wenn du alle Daten löschst, sind sie, ohne Backup, für immer verloren!",
        "Daten löschen",
        true
      );

  if (!actDel) return false;

  const auth = getAuth();
  const user = auth.currentUser;

  if (!user)
    return (
      false &&
      console.error(
        "[!] <fire.ts::delDb> Cannot delete user data while not being signed in!"
      )
    );

  const h = doc(db, "hours", user.uid);
  const p = doc(db, "profiles", user.uid);

  await deleteDoc(h);
  await deleteDoc(p);

  return true;
}
