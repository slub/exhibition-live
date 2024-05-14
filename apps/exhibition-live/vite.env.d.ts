/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SPARQL_ENDPOINT: string;
  readonly VITE_SPARQL_ENDPOINT_LABEL: string;
  readonly VITE_SPARQL_ENDPOINT_PROVIDER: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
