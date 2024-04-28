/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly APP_VERSION: string;
  readonly DB_VERSION: number;
  readonly APP_STATE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

type Profiles = { [key: string]: Profile };
type Hours = { [key: string]: Hour[] };

type DatabaseExport = { profiles: Profiles; hours: Hours; version: number };

type Profile = {
  name: string;
  pph: number;
};

type Hour = {
  profile: string;
  total: number;
  begin: string;
  date: string[];
  end: string;
};

type Typed<T = any> = { [key: string]: T };

type ErrorMap<T = any> = {
  message: Typed<T>;
  name: Typed<T>;
};
