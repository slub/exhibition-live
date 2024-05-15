import { SetStateAction, useCallback, useMemo } from "react";
import { create } from "zustand";
import {
  ExternalAuthorityConfig,
  Features,
  GoogleDriveConfig,
  OpenAIConfig,
  Settings,
  SparqlEndpoint,
  UseLocalSettings,
} from "@slub/edb-core-types";
import { useAdbContext } from "./provider";
import useLocalStorage from "use-local-storage";

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

const initalState = {
  lockedEndpoint: false,
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
};
export const useSettings: () => UseSettings = () => {
  const { lockedSPARQLEndpoint } = useAdbContext();
  const [settingsLocalStorage, setLocalSettings] = useLocalStorage<Settings>(
    "settings",
    initalState,
  );

  const settings = useMemo<Settings>(() => {
    const localSettings = settingsLocalStorage || initalState;
    return lockedSPARQLEndpoint
      ? {
          ...localSettings,
          lockedEndpoint: true,
          sparqlEndpoints: [
            {
              ...lockedSPARQLEndpoint,
              active: true,
            },
          ],
        }
      : localSettings;
  }, [lockedSPARQLEndpoint, settingsLocalStorage]);

  const setSettings = useCallback(
    (settings: SetStateAction<Settings>) => {
      // @ts-ignore
      setLocalSettings(settings);
    },
    [setLocalSettings],
  );

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
  /*
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
  ]);*/

  const activeEndpoint = useMemo(
    () =>
      lockedSPARQLEndpoint || settings.sparqlEndpoints.find((e) => e.active),
    [settings.sparqlEndpoints, lockedSPARQLEndpoint],
  );

  return {
    ...(settings || settingsLocalStorage || initalState),
    setSparqlEndpoints,
    setFeatures,
    activeEndpoint,
    setOpenAIConfig,
    setAuthorityConfig,
    setGoogleDriveConfig,
  };
};
