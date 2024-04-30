import useLocalState from "@phntms/use-local-state";
import {
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { create } from "zustand";
import {
  ExternalAuthorityConfig,
  Features,
  GoogleDriveConfig,
  OpenAIConfig,
  Settings,
  SparqlEndpoint,
  UseLocalSettings,
} from "../types/settings";
import { useAdbContext } from "../provider";

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

export const useSettings: () => UseSettings = () => {
  const { lockedSPARQLEndpoint } = useAdbContext();
  const [settingsLocalStorage, setLocalSettings] = useLocalState<Settings>(
    "settings",
    {
      lockedEndpoint: Boolean(lockedSPARQLEndpoint),
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
    lockedSPARQLEndpoint
      ? {
          ...settingsLocalStorage,
          lockedEndpoint: true,
          sparqlEndpoints: [
            {
              ...lockedSPARQLEndpoint,
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
