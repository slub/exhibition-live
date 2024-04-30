export type SparqlEndpoint = {
  label?: string;
  endpoint: string;
  active: boolean;
  auth?: {
    username?: string;
    password?: string;
    token?: string;
  };
  provider?:
    | "allegro"
    | "oxigraph"
    | "worker"
    | "blazegraph"
    | "virtuoso"
    | "qlever"
    | "rest";
};
export type Features = {
  enablePreview?: boolean;
  enableDebug?: boolean;
  enableBackdrop?: boolean;
  enableStylizedCard?: boolean;
};
export type OpenAIConfig = {
  organization?: string;
  apiKey?: string;
};
export type GoogleDriveConfig = {
  apiKey?: string;
};
export type ExternalAuthorityConfig = {
  kxp?: {
    endpoint?: string;
    baseURL?: string;
    recordSchema?: string;
  };
};
export type Settings = {
  lockedEndpoint: boolean;
  sparqlEndpoints: SparqlEndpoint[];

  features: Features;
  openai: OpenAIConfig;
  googleDrive: GoogleDriveConfig;
  externalAuthority: ExternalAuthorityConfig;
};
export type UseLocalSettings = {
  settingsOpen: boolean;
  sparqlEndpoints: SparqlEndpoint[];
  setSparqlEndpoints: (endpoints: SparqlEndpoint[]) => void;
  openSettings: () => void;
  closeSettings: () => void;
  getActiveEndpoint: () => SparqlEndpoint | undefined;
};
