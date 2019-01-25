import react, { Component } from 'react'

import { addMediaQueryListener } from './dom'
import {
  Dictionary,
  MediaQuery,
  MediaQueryAlias,
  MediaQueryBag,
  MediaQueryEntry,
  MediaQueryMatches,
  MediaQueryUnsubscribeFn
} from './types'

interface QueryDiff {
  subscribe: MediaQueryEntry[]
  unsubscribe: string[]
}

export interface Props {
  queries: MediaQueryBag
  children: (props: MediaQueryMatches) => React.ReactNode
}

interface State {
  queries: Dictionary<boolean>
}

export class MatchMedia extends Component<Props, State> {
  unsubscribeMap: Map<MediaQueryAlias, MediaQueryUnsubscribeFn> = new Map()

  state: State = {
    queries: this.computeMQL({})
  }

  computeMQL(queryBag: Dictionary<boolean>): Dictionary<boolean> {
    const dict: Dictionary<boolean> = {}

    for (const alias of Object.keys(this.props.queries)) {
      dict[alias] = Boolean(queryBag[alias])
    }

    return dict
  }

  subscribe(entries: MediaQueryEntry[]): void {
    for (const [alias, query] of entries) {
      const unsubscribeFn = addMediaQueryListener(query, mql => {
        this.setState(({ queries }) => ({
          queries: {
            ...queries,
            [alias]: mql.matches
          }
        }))
      })

      this.unsubscribeMap.set(alias, unsubscribeFn)
    }
  }

  unsubscribe(aliases: string[]): void {
    for (const alias of aliases) {
      const unsubscribeFn = this.unsubscribeMap.get(alias)
      if (unsubscribeFn) {
        unsubscribeFn()
        this.unsubscribeMap.delete(alias)
      }
    }
  }

  componentDidMount() {
    this.subscribe(Object.entries(this.props.queries))
  }

  componentWillUnmount() {
    this.unsubscribe([...this.unsubscribeMap.keys()])
  }

  componentDidUpdate(prevProps: Props) {
    const diff = diffQueries(prevProps.queries, this.props.queries)

    if (!diff) return

    const { subscribe, unsubscribe } = diff
    // * if we have subs/unsubs, we need to update the mql dictionary
    // * to remove unused aliases and add new aliases.
    if (subscribe.length + unsubscribe.length > 0) {
      this.setState(({ queries }) => ({
        queries: this.computeMQL(queries)
      }))
    }

    // ! Must unsubscribe first
    this.unsubscribe(unsubscribe)
    this.subscribe(subscribe)
  }

  render() {
    return this.props.children({ ...this.state.queries })
  }
}

function diffQueries(previous: MediaQueryBag, current: MediaQueryBag): QueryDiff | null {
  if (previous === current) return null

  const oldQueries = new Map(Object.entries(previous))
  const subscribe: Map<MediaQueryAlias, MediaQuery> = new Map()
  const unsubscribe: MediaQueryAlias[] = []

  for (const [alias, query] of Object.entries(current)) {
    // * NEW: subscribe
    if (!oldQueries.has(alias)) {
      subscribe.set(alias, query)
      continue
    }

    const prevQuery = oldQueries.get(alias)

    // * UNCHANGED: remove from old_queries (already subscribed)
    if (prevQuery === query) {
      oldQueries.delete(alias)
      continue
    }

    // * UPDATED: subscribe
    subscribe.set(alias, query)
  }

  // * Leftover keys are queries that have been updated
  // * and need old queries removed
  unsubscribe.push(...oldQueries.keys())

  return {
    unsubscribe,
    subscribe: [...subscribe.entries()]
  }
}
