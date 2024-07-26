/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_VERSION: string;
  readonly VITE_DB_VERSION: string;
  readonly VITE_APP_STATE: string;
  readonly VITE_SW_DEV: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

type Profiles = { [key: string]: Profile };
type Hours = { [key: string]: Hour[] };

type DatabaseExport = {
  profiles: Profile[];
  hours: Hour[];
  version: number;
};

type CheckIn = {
  profile: string;
  begin: string;
  date: string[];
};

type Typed<T = any> = { [key: string]: T };

type ErrorMap<T = any> = {
  message: Typed<T>;
  name: Typed<T>;
};

type ISODate = [number, number, number];

type Hour = {
  profile: string;
  date: string[];
  total: number;
  owner: string;
  start: string;
  end: string;
};

type Profile = {
  owner: string;
  name: string;
  pph: number;
};
