import useLocalState from '@phntms/use-local-state'
import {useEffect, useState} from 'react'
import {create} from 'zustand'

type SparqlEndpoint = {
  label?: string
  endpoint: string
  active: boolean
}

type Settings = {
  sparqlEndpoints: SparqlEndpoint[]
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
    label: 'Test',
    endpoint: 'http://sdvahndmgtest.slub-dresden.de:7878/query',
    active: true
  },
  {
    label: 'Local',
    endpoint: 'http://localhost:7878/query',
    active: false
  }]

export const useLocalSettings = create<UseLocalSettings>((set, get) => ({
  settingsOpen: false,
  openSettings: () => set({settingsOpen: true}),
  closeSettings: () => set({settingsOpen: false}),
  sparqlEndpoints: defaultSparqlEndpoints,
  setSparqlEndpoints: (endpoints) => set({sparqlEndpoints: endpoints}),
  getActiveEndpoint: () => get().sparqlEndpoints.find(e => e.active)
}))

type UseSettings = {
  sparqlEndpoints: SparqlEndpoint[];
  activeEndpoint: SparqlEndpoint | undefined;
  setSparqlEndpoints: (endpoints: SparqlEndpoint[]) => void
}

export const useSettings: () => UseSettings = () => {
  const [ settings, setSettings ] = useLocalState<Settings>('settings', { sparqlEndpoints: [] })
  const [ activeEndpoint, setActiveEndpoint ] = useState<SparqlEndpoint | undefined>(settings.sparqlEndpoints?.find(e => e.active))

  useEffect(() => {
    if(!Array.isArray(settings.sparqlEndpoints) || settings.sparqlEndpoints.length === 0) {
      setSettings({ sparqlEndpoints: defaultSparqlEndpoints })
    }
  }, [settings.sparqlEndpoints, setSettings])

  useEffect(() => {
    setActiveEndpoint(settings.sparqlEndpoints.find(e => e.active))
  }, [settings.sparqlEndpoints])

  return {
    ...settings,
    setSparqlEndpoints: (endpoints: SparqlEndpoint[]) => setSettings({ sparqlEndpoints: endpoints }),
    activeEndpoint
  }
}
