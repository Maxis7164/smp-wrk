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

type DatabaseExport = {
  profiles: Profile[];
  hours: Hour[];
  version: number;
};

type Typed<T = any> = { [key: string]: T };

type ErrorMap<T = any> = {
  message: Typed<T>;
  name: Typed<T>;
};

type ISODate = [number, number, number];
