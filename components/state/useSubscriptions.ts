import {v4 as uuidv4} from 'uuid'
import {create} from 'zustand'

type Subscription = {
  key: string
  uuid: string
  callback: (value: any) => void
}

type UseSubscriptions = {
  subscribe: (key: string, callback: (value: any) => void) => string
  unsubscribe: (key: string, uuid: string) => void
  subscriptions: Subscription[]
  dataChanged: (key: string) => void
}

const useSubscriptions = create<UseSubscriptions>((set, get) => ({
  subscriptions: [],
  subscribe: (key, callback) => {
    const uuid = uuidv4()
    set(({subscriptions}) => ({
      subscriptions: [
        ...subscriptions,
        {
          key,
          uuid,
          callback,
        }
      ]
    }))
    return uuid
  },
  unsubscribe: (key, uuid) => {
    set(({subscriptions}) => ({
      subscriptions: subscriptions.filter(s => s.key !== key || s.uuid !== uuid)
    }))
  },
  dataChanged: (key) => {
    const {subscriptions} = get()
    subscriptions.filter(s => s.key === key).forEach(s => s.callback(key))
  }
}))