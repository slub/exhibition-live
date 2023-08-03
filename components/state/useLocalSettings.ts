import useLocalState from '@phntms/use-local-state'
import {useCallback, useEffect, useState} from 'react'
import {create} from 'zustand'

type SparqlEndpoint = {
  label?: string
  endpoint: string
  active: boolean
}

type Features = {
  enablePreview?: boolean
  enableDebug?: boolean
}

type OpenAIConfig = {
  organization?: string
  apiKey?: string
}

type Settings = {
  sparqlEndpoints: SparqlEndpoint[]

  features: Features
  openai: OpenAIConfig
}

type UseLocalSettings = {
  settingsOpen: boolean
  sparqlEndpoints: SparqlEndpoint[]
  setSparqlEndpoints: (endpoints: SparqlEndpoint[]) => void
  openSettings: () => void
  closeSettings: () => void
  getActiveEndpoint: () => SparqlEndpoint | undefined
}

const defaultSparqlEndpoints: SparqlEndpoint[] = [
  {
    label: 'Production',
    endpoint: 'https://ausstellungsdatenbank.kuenste.live/query',
    active: true
  },
  {
    label: 'Test',
    endpoint: 'http://sdvahndmgtest.slub-dresden.de:7878/query',
    active: false
  },
  {
    label: 'Local',
    endpoint: 'http://localhost:7878/query',
    active: false
  },
  {
    label: 'in memory',
    endpoint: 'urn:worker',
    active: false
  }
  ]

export const useLocalSettings = create<UseLocalSettings>((set, get) => ({
  settingsOpen: false,
  openSettings: () => set({settingsOpen: true}),
  closeSettings: () => set({settingsOpen: false}),
  sparqlEndpoints: defaultSparqlEndpoints,
  setSparqlEndpoints: (endpoints) => set({sparqlEndpoints: endpoints}),
  getActiveEndpoint: () => get().sparqlEndpoints.find(e => e.active)
}))

type UseSettings = Settings & {
  activeEndpoint: SparqlEndpoint | undefined;
  setSparqlEndpoints: (endpoints: SparqlEndpoint[]) => void
  setFeatures: (features: Features) => void
  setOpenAIConfig: (config: OpenAIConfig) => void
}

export const useSettings: () => UseSettings = () => {
  const [ settings, setSettings ] = useLocalState<Settings>('settings',
      {
        sparqlEndpoints: [],
        openai: {},
        features: { enableDebug: false, enablePreview: false }})
  const [ activeEndpoint, setActiveEndpoint ] = useState<SparqlEndpoint | undefined>(settings.sparqlEndpoints?.find(e => e.active))

  const setSparqlEndpoints = useCallback((endpoints: SparqlEndpoint[]) => {
    setSettings(settings_ => ({...settings_, sparqlEndpoints: endpoints }))
  },[setSettings])

  const setFeatures = useCallback((features: Features) => {
   setSettings(settings_ => ({...settings_, features }))
  }, [setSettings])

  const setOpenAIConfig = useCallback(
      (openAiConfig: OpenAIConfig) => {
        setSettings(settings_ => ({...settings_, openai: openAiConfig}))
      },
      [setSettings])


  useEffect(() => {
    if(!Array.isArray(settings.sparqlEndpoints) || settings.sparqlEndpoints.length === 0) {
      setSparqlEndpoints(defaultSparqlEndpoints)
    }
  }, [settings.sparqlEndpoints, setSettings, setSparqlEndpoints])

  useEffect(() => {
    setActiveEndpoint(settings.sparqlEndpoints.find(e => e.active))
  }, [settings.sparqlEndpoints])

  return {
    ...settings,
    setSparqlEndpoints,
    setFeatures,
    activeEndpoint,
    setOpenAIConfig
    }
}
