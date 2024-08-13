import {
  persistentMultipleTabManager,
  QueryFieldFilterConstraint,
  persistentLocalCache,
  initializeFirestore,
  collection,
  getDocs,
  addDoc,
  where,
  query,
  Query,
  deleteDoc,
  QueryConstraint,
  doc,
  DocumentReference,
  DocumentData,
  CollectionReference,
  writeBatch,
  getDoc,
} from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { confirm } from "./components/modal";
import { call } from "./components/banner";
import { getCurrentUser } from "vuefire";
import { User } from "firebase/auth";
import { saveFile } from "./files";
import { getTime } from "./utils";

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
  const user = await getCurrentUser();
  if (!user)
    return (
      false &&
      console.error(
        "[!] <fire.ts::expDb> Cannot access user data while not being signed in!"
      )
    );

  const pd = getProfilesOf(user);
  const hd = getHoursOf(user);

  const [profSnap, hoursSnap] = await Promise.all([getDocs(pd), getDocs(hd)]);

  const profiles = profSnap.docs.map((doc) => doc.data());
  const hours = hoursSnap.docs.map((doc) => doc.data());

  const data: DatabaseExport = {
    version: 0,
    profiles,
    hours,
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

  const user = await getCurrentUser();

  if (!user)
    return (
      false &&
      console.error(
        "[!] <fire.ts::delDb> Cannot delete user data while no user is being signed in!"
      )
    );

  const [profs, hours] = await Promise.all([
    getDocs(getProfilesOf(user)),
    getDocs(getHoursOf(user)),
  ]);

  let prom: Promise<void>[] = [];

  profs.docs.forEach((doc) => prom.push(deleteDoc(doc.ref)));
  hours.docs.forEach((doc) => prom.push(deleteDoc(doc.ref)));

  await Promise.all(prom);

  return true;
}

export async function delCurrentUser(): Promise<void> {
  const user = await getCurrentUser();

  if (!user) return;

  await delDb();
  user.delete();
}

function calcTotal(start: string, end: string): number {
  const s = getTime(start);
  const e = getTime(end);

  const total = (e < s ? s - e : e - s) / 60;

  return Math.floor(total * 100) / 100;
}

const NOPROF = "- auswählen -";
export async function addHours(
  profile: string,
  date: string[],
  start: string,
  end: string
): Promise<boolean> {
  const user = await getCurrentUser();

  if (!user) {
    console.error(
      "[!] <fire.ts::addHours> Cannot add hours while not being logged in!"
    );
    return false;
  }

  if (profile === NOPROF || date.length === 0 || start === "" || end === "") {
    call(
      "error",
      "Bitte wähle ein Profil aus und gib den Tag, sowie Anfangs- und Endzeit an"
    );
    return false;
  }

  const total = calcTotal(start, end);

  if (total <= 0) return false;

  const hour: Hour = {
    owner: user.uid,
    version: 1,
    profile,
    total,
    start,
    date,
    end,
  };

  try {
    await addDoc(collection(db, "hours"), hour);
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}

export async function exists(
  collection: CollectionReference<DocumentData, DocumentData>,
  id: string
): Promise<boolean> {
  try {
    const a = await getDoc(doc(collection, id));
    return a.exists();
  } catch (err) {
    console.error(err);
    return false;
  }
}

export async function updateHours(user: User) {
  const profs = (await getDocs(getProfilesOf(user))).docs;
  const docs = await getDocs(query(getHoursOf(user)));

  const batch = writeBatch(db);

  docs.forEach((doc) => {
    const data = doc.data();
    const prof = profs.find((p) => p.data().name === data.profile);

    if (prof?.id) batch.update(doc.ref, { profile: prof.id, version: 1 });
  });

  await batch.commit();
}

export function fromCurrentUser(user: User): QueryFieldFilterConstraint {
  return where("owner", "==", user.uid);
}

export function getCheckInOf(user: User): DocumentReference<CheckIn, CheckIn> {
  return doc(db, `checkin/${user.uid}`) as any;
}
export function getProfilesOf(
  user: User,
  ...constrains: QueryConstraint[]
): Query<Profile, Profile> {
  return query(
    collection(db, "profiles"),
    fromCurrentUser(user),
    ...constrains
  ) as any;
}
export function getHoursOf(
  user: User,
  ...constrains: QueryConstraint[]
): Query<Hour, Hour> {
  return query(
    collection(db, "hours"),
    fromCurrentUser(user),
    ...constrains
  ) as any;
}
