import {API_URL} from '../config'

export const fetchData: <TData>(body: string, headers?: HeadersInit) => Promise<TData> = async <TData>(body:string, headers = {}) => {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    body,
  })

  const json = await res.json()

  if (json.errors) {
    const { message } = json.errors[0] || 'Error..'
    throw new Error(message)
  }

  return json.data as TData
}

export const useFetchData = <TData, TVariables>(query: string): (() => Promise<TData>) => {
  // it is safe to call React Hooks here.
  return async (variables?: TVariables) => await fetchData(JSON.stringify({query, variables}))
}
