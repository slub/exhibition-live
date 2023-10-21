import {useCallback, useState} from 'react'

export const useLocalHistory: () => {
  pushHistory: (historyElement?: string) => string;
  popHistory: () => string;
  history: (string | undefined)[]
} = () => {
  const [history, setHistory] = useState<(string | undefined)[]>([undefined])
  const pushHistory = useCallback((historyElement?: string) => {
        setHistory(h => [...h, historyElement])
        return historyElement
      },
      [setHistory])
  const popHistory = useCallback(() => {
        const input = history[history.length - 2]
        setHistory(h => h.slice(0, h.length - 1))
        return input
      },
      [setHistory, history])
  return {history, pushHistory, popHistory}
}
