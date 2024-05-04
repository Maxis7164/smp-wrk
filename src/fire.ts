import { initializeApp } from "firebase/app";
import { User, getAuth } from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  deleteDoc,
  getDoc,
  setDoc,
  doc,
  DocumentReference,
  arrayUnion,
} from "firebase/firestore";
import { requestFile, saveFile } from "./files";
import { confirm } from "./components/modal";
import { updateDoc } from "firebase/firestore";
import { call } from "./components/banner";

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

export function getUser(): User | null {
  const auth = getAuth();
  const user = auth.currentUser;

  return user;
}

export async function expDb(): Promise<boolean> {
  const user = getUser();
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
  const user = getUser();
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
    "Daten löschen",
    ["Ja", "Nein"]
  );

  const actDel = !doDel
    ? false
    : await confirm(
        "Bist du dir sicher? Wenn du alle Daten löschst, sind sie, ohne Backup, für immer verloren!",
        "Daten löschen",
        ["Ja", "Nein"]
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

function calcTotal(start: string, end: string): number {
  const s = new Date(`2004-04-22T${start}:00Z`).getTime();
  const e = new Date(`2004-04-22T${end}:00Z`).getTime();

  const total = (e - s) / 1000 / 60 / 60;

  return Math.floor(total * 100) / 100;
}

const NOPROF = "- auswählen -";
export async function addHours(
  profile: string,
  date: string[],
  start: string,
  end: string
): Promise<void> {
  const user = getUser();
  if (!user)
    return console.error(
      "[!] <fire.ts::addHours> Cannot add hours while not being logged in!"
    );

  if (profile === NOPROF || date.length === 0 || start === "" || end === "")
    return call(
      "error",
      "Bitte wähle ein Profil aus und gib den Tag, sowie Anfangs- und Endzeit an"
    );

  const hours = doc(db, "hours", user.uid) as DocumentReference<Hours>;

  const hour: Hour = {
    total: calcTotal(start, end),
    profile: profile,
    begin: start,
    end: end,
    date,
  };

  console.log(profile, hour);

  try {
    await updateDoc(hours, { [hour.profile]: arrayUnion(hour) });
  } catch (err) {
    if ((err as any).code === "not-found")
      await setDoc(hours, { [profile]: [hour] });

    console.log(err);
  }
}
