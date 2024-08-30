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
  DocumentSnapshot,
  updateDoc,
  getAggregateFromServer,
  sum,
  collectionGroup,
} from "firebase/firestore";
import { Datestamp, type DatestampData, getTime } from "src/utils";
import { initializeApp } from "firebase/app";
import { confirm } from "@composables/modal";
import { banner } from "@composables/banner";
import { getCurrentUser } from "vuefire";
import { User } from "firebase/auth";

export type CheckIn = {
  date: DatestampData;
  profile: string;
  begin: string;
};

export type Hour = {
  date: DatestampData;
  version: number;
  profile: string;
  total: number;
  owner: string;
  start: string;
  end: string;
};

export type Profile = {
  owner: string;
  name: string;
  pph: number;
};

export type HourAggregation = {
  [key: string]: number;
  total: number;
  month: number;
  pay: number;
};

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

//#region initialization
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
//#endregion

//#region deleters
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

  const done = await delDb();
  if (!done)
    return console.error(
      "[!] Could not delete User: DB was unable to delete user data!"
    );

  user.delete();
}
//#endregion

function calcTotal(start: string, end: string): number {
  const s = getTime(start);
  const e = getTime(end);

  const total = (e < s ? s - e : e - s) / 60;

  return Math.floor(total * 100) / 100;
}

const NOPROF = "- auswählen -";
export async function addHours(
  profile: string,
  date: Datestamp | DatestampData,
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

  if (
    profile === NOPROF ||
    false /*TODO add check for date */ ||
    start === "" ||
    end === ""
  ) {
    banner(
      "error",
      "Bitte wähle ein Profil aus und gib den Tag, sowie Anfangs- und Endzeit an"
    );
    return false;
  }

  const total = calcTotal(start, end);

  if (total <= 0) return false;

  const hour: Hour = {
    date: date instanceof Datestamp ? date.serialize() : date,
    owner: user.uid,
    version: 1,
    profile,
    total,
    start,
    end,
  };

  try {
    await addDoc(collection(db, "profiles", profile, "hours"), hour);
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

//#region getters
export function fromUser(user: User): QueryFieldFilterConstraint {
  return where("owner", "==", user.uid);
}

export function getProfile(
  id: string
): Promise<DocumentSnapshot<Profile, Profile>> {
  return getDoc(doc(db, "profiles", id)) as any;
}

export function getCheckInOf(user: User): DocumentReference<CheckIn, CheckIn> {
  return doc(db, `checkin/${user.uid}`) as any;
}

export function getProfilesOf(
  user: User,
  ...constraints: QueryConstraint[]
): Query<Profile, Profile> {
  return query(
    collection(db, "profiles"),
    fromUser(user),
    ...constraints
  ) as any;
}

export function getNewHoursOf(user: User, ...constraints: QueryConstraint[]) {
  return query(collectionGroup(db, "hours"), fromUser(user), ...constraints);
}

export function getHoursOf(
  user: User,
  ...constraints: QueryConstraint[]
): Query<Hour, Hour> {
  return query(collection(db, "hours"), fromUser(user), ...constraints) as any;
}

export async function getLeacyHoursOf(
  user: User,
  constraints?: {
    profiles?: QueryConstraint[];
    hours?: QueryConstraint[];
  }
) {
  const M = new Date().getMonth();
  const profs = await getDocs(
    getProfilesOf(user, ...(constraints?.profiles ?? []))
  );

  const res: HourAggregation = {
    month: 0,
    total: 0,
    pay: 0,
  };

  for await (let prof of profs.docs) {
    const data = prof.data();

    const [rm, ra] = await Promise.all([
      getAggregateFromServer(
        query(
          collection(db, "hours"),
          fromUser(user),
          where("profile", "==", prof.id),
          where("date.month", "==", M)
        ),
        { total: sum("total") }
      ),
      getAggregateFromServer(
        query(
          collection(db, "hours"),
          fromUser(user),
          where("profile", "==", prof.id)
        ),
        { total: sum("total") }
      ),
    ]);

    const month = rm.data();
    const all = ra.data();

    res[data.name] = all.total;
    res.total += all.total;

    res.month += month.total;
    res.pay += month.total * data.pph;
  }

  return res;
}

function getAggrQuery(
  user: User,
  id: string,
  ...constraints: QueryConstraint[]
) {
  return query(
    collection(db, "profiles", id, "hours"),
    fromUser(user),
    ...constraints
  );
}

export async function getSummaryOf(user: User) {
  const M = new Date().getMonth();
  const aggregation: HourAggregation = {
    month: 0,
    total: 0,
    pay: 0,
  };

  const profs = await getDocs(getProfilesOf(user));

  for await (let prof of profs.docs) {
    const data = prof.data();

    const [rm, ra] = await Promise.all([
      getAggregateFromServer(
        getAggrQuery(user, prof.id, where("date.month", "==", M)),
        { total: sum("total") }
      ),
      getAggregateFromServer(getAggrQuery(user, prof.id), {
        total: sum("total"),
      }),
    ]);

    const month = rm.data();
    const all = ra.data();

    aggregation[data.name] = all.total;
    aggregation.total += all.total;

    aggregation.month += month.total;
    aggregation.pay += month.total * data.pph;
  }

  //#region legacy
  const legacy = await getLeacyHoursOf(user);
  aggregation.total += legacy.total;
  aggregation.pay += legacy.pay;

  for (let prof of Object.keys(legacy)) {
    if (["total", "pay"].includes(prof)) continue;

    if (prof in aggregation) aggregation[prof] += legacy[prof];
    else aggregation[prof] = legacy[prof];
  }
  //#endregion

  return aggregation;
}
//#endregion

//#region actions
export async function updateProfile(profile: Profile, id?: string) {
  if (id && id.length > 0)
    try {
      await updateDoc(doc(db, "profiles", id), profile);
    } catch (err) {
      console.error(err);
    }
  else await addDoc(collection(db, "profiles"), profile);
}

export async function deleteProfile(id: string) {
  const doDel = await confirm(
    "Möchtest du wirklich deine Arbeitszeit löschen? Diese Aktion ist nicht wiederherstellbar!",
    "Arbeitszeit löschen",
    ["Ja", "Nein"]
  );

  if (doDel)
    try {
      deleteDoc(doc(db, "profiles", id));
      return true;
    } catch (err) {
      console.error(err);
    }

  return false;
}

export async function deleteHours(id: string) {
  const doDel = await confirm(
    "Möchtest du wirklich deine Arbeitszeit löschen? Diese Aktion ist nicht wiederherstellbar!",
    "Arbeitszeit löschen",
    ["Ja", "Nein"]
  );

  if (doDel) deleteDoc(doc(db, "hours", id));
}
//#endregion
