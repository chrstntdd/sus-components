import { useRef, useEffect, useState } from 'react'

import { addMediaQueryListener } from './dom'
import {
  Dictionary,
  MediaQueryAlias,
  MediaQueryBag,
  MediaQueryEntry,
  MediaQueryUnsubscribeFn,
  BoolDictionary
} from './types'

const useMediaQueryList = (queries: MediaQueryBag) => {
  const unsubscribeMap: React.MutableRefObject<
    Map<MediaQueryAlias, MediaQueryUnsubscribeFn>
  > = useRef(null)

  const computeMQL = (queryBag: BoolDictionary): BoolDictionary => {
    const dict: Dictionary<boolean> = {}

    for (const alias of Object.keys(queries)) {
      dict[alias] = !!queryBag[alias]
    }

    return dict
  }

  const [state, setState] = useState(() => computeMQL({}))

  useEffect(() => {
    unsubscribeMap.current = new Map()

    subscribe(Object.entries(queries))

    return () => {
      unsubscribe([...unsubscribeMap.current.keys()])
    }
  }, [])

  const subscribe = (entries: MediaQueryEntry[]): void => {
    for (const [alias, query] of entries) {
      const unsubscribeFn = addMediaQueryListener(query, mql => {
        setState(prevQueries => ({
          ...prevQueries,
          [alias]: mql.matches
        }))
      })

      unsubscribeMap.current.set(alias, unsubscribeFn)
    }
  }

  const unsubscribe = (aliases: string[]): void => {
    for (const alias of aliases) {
      const unsubscribeFn = unsubscribeMap.current.get(alias)
      if (unsubscribeFn) {
        unsubscribeFn()
        unsubscribeMap.current.delete(alias)
      }
    }
  }

  return state
}

export { useMediaQueryList }
