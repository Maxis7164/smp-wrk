/// <reference types="vite/client" />

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
