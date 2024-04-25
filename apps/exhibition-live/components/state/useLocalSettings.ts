import useLocalState from "@phntms/use-local-state";
import {
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { create } from "zustand";
import getConfig from "next/config";

export const envToSparqlEndpoint = (
  env: Record<string, string>,
): SparqlEndpoint | undefined => {
  const endpoint = env.SPARQL_ENDPOINT;
  if (!endpoint) {
    return;
  }
  const label = env.SPARQL_ENDPOINT_LABEL || "Custom";
  const provider = env.SPARQL_ENDPOINT_PROVIDER || "oxigraph";
  const username = env.SPARQL_ENDPOINT_USERNAME;
  const password = env.SPARQL_ENDPOINT_PASSWORD;
  const token = env.SPARQL_ENDPOINT_TOKEN;
  return {
    label,
    endpoint,
    active: true,
    provider,
    auth: {
      username,
      password,
      token,
    },
  } as SparqlEndpoint;
};

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

type Features = {
  enablePreview?: boolean;
  enableDebug?: boolean;
  enableBackdrop?: boolean;
  enableStylizedCard?: boolean;
};

type OpenAIConfig = {
  organization?: string;
  apiKey?: string;
};

type GoogleDriveConfig = {
  apiKey?: string;
};

type ExternalAuthorityConfig = {
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

const defaultSparqlEndpoints: SparqlEndpoint[] = [
  {
    label: "Production",
    endpoint: "https://sdv-ahn-adbtest.slub-dresden.de/query",
    active: true,
    provider: "oxigraph",
  },
  {
    label: "Local",
    endpoint: "http://localhost:7878/query",
    active: false,
    provider: "oxigraph",
  },
  {
    label: "QLever local",
    endpoint: "http://localhost:7001",
    active: false,
    provider: "qlever",
  },
  {
    label: "in memory",
    endpoint: "urn:worker",
    active: false,
  },
];

export const useLocalSettings = create<UseLocalSettings>((set, get) => ({
  settingsOpen: false,
  openSettings: () => set({ settingsOpen: true }),
  closeSettings: () => set({ settingsOpen: false }),
  sparqlEndpoints: defaultSparqlEndpoints,
  setSparqlEndpoints: (endpoints) => set({ sparqlEndpoints: endpoints }),
  getActiveEndpoint: () => get().sparqlEndpoints.find((e) => e.active),
}));

type UseSettings = Settings & {
  activeEndpoint: SparqlEndpoint | undefined;
  setSparqlEndpoints: (endpoints: SparqlEndpoint[]) => void;
  setFeatures: (features: Features) => void;
  setOpenAIConfig: (config: OpenAIConfig) => void;
  setAuthorityConfig: (config: ExternalAuthorityConfig) => void;
  setGoogleDriveConfig: (config: GoogleDriveConfig) => void;
};

const sparqlEndpoint = envToSparqlEndpoint(getConfig().publicRuntimeConfig);
export const useSettings: () => UseSettings = () => {
  const [settingsLocalStorage, setLocalSettings] = useLocalState<Settings>(
    "settings",
    {
      lockedEndpoint: Boolean(sparqlEndpoint),
      sparqlEndpoints: [],
      openai: {},
      googleDrive: {},
      externalAuthority: {
        kxp: {
          endpoint: "https://sru.bsz-bw.de/swbtest",
        },
      },
      features: {
        enableDebug: false,
        enablePreview: false,
        enableBackdrop: false,
        enableStylizedCard: false,
      },
    },
  );

  const [settingsState, setSettingsState] = useState<Settings>(
    sparqlEndpoint
      ? {
          ...settingsLocalStorage,
          lockedEndpoint: true,
          sparqlEndpoints: [
            {
              ...sparqlEndpoint,
              active: true,
            },
          ],
        }
      : settingsLocalStorage,
  );

  const setSettings = useCallback(
    (settings: SetStateAction<Settings>) => {
      setLocalSettings(settings);
      setSettingsState(settings);
    },
    [setLocalSettings, setSettingsState],
  );

  const settings = settingsState;

  const setSparqlEndpoints = useCallback(
    (endpoints: SparqlEndpoint[]) => {
      setSettings((settings_) => ({
        ...settings_,
        sparqlEndpoints: endpoints,
      }));
    },
    [setSettings],
  );

  const setFeatures = useCallback(
    (features: Features) => {
      setSettings((settings_) => ({ ...settings_, features }));
    },
    [setSettings],
  );

  const setOpenAIConfig = useCallback(
    (openAiConfig: OpenAIConfig) => {
      setSettings((settings_) => ({ ...settings_, openai: openAiConfig }));
    },
    [setSettings],
  );

  const setGoogleDriveConfig = useCallback(
    (googleDriveConfig: GoogleDriveConfig) => {
      setSettings((settings_) => ({
        ...settings_,
        googleDrive: googleDriveConfig,
      }));
    },
    [setSettings],
  );

  const setAuthorityConfig = useCallback(
    (authorityConfig: ExternalAuthorityConfig) => {
      setSettings((settings_) => ({
        ...settings_,
        externalAuthority: authorityConfig,
      }));
    },
    [setSettings],
  );

  useEffect(() => {
    if (
      (!settings.lockedEndpoint && !Array.isArray(settings.sparqlEndpoints)) ||
      settings.sparqlEndpoints.length === 0
    ) {
      setSparqlEndpoints(defaultSparqlEndpoints);
    }
  }, [
    settings.sparqlEndpoints,
    settings.lockedEndpoint,
    setSettings,
    setSparqlEndpoints,
  ]);

  const activeEndpoint = useMemo(
    () => settings.sparqlEndpoints.find((e) => e.active),
    [settings.sparqlEndpoints],
  );

  return {
    ...settings,
    setSparqlEndpoints,
    setFeatures,
    activeEndpoint,
    setOpenAIConfig,
    setAuthorityConfig,
    setGoogleDriveConfig,
  };
};
