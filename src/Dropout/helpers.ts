const measureElements = (...elements: React.RefObject<HTMLElement>[]) =>
  elements.map(el => el.current.getBoundingClientRect())

const wrapEvent = (handler, cb) => (event: React.SyntheticEvent) => {
  handler && handler(event)

  if (!event.defaultPrevented) return cb(event)
}

type StateObj = { [key: string]: any }

interface Store {
  getState: () => StateObj
  subscribe: (any) => () => void
  dispatch: (action) => void
}

interface Action {
  type: string
  payload?: any
}

type Reducer<T> = (state: T, action: Action) => T

const createStore = (reducer: Reducer<any>, initialState: { [key: string]: any }): Store => {
  let state = initialState
  const listeners = []

  const getState = () => state

  const dispatch = (action: Action) => {
    state = reducer(state, action)
    listeners.forEach(l => l())
  }

  const subscribe = listener => {
    listeners.push(listener)

    return () => {
      listeners.filter(l => l !== listener)
    }
  }

  return { dispatch, getState, subscribe }
}

export type TransitionFn = (action: string, payload: any) => void

const createMachine = (chart, reducer, initialState) => {
  let state = chart.initial
  const { dispatch, getState, subscribe } = createStore(reducer, initialState)

  const transition: TransitionFn = (action, payload = {}) => {
    const nextState = chart[state][action]
    dispatch({ state, type: action, nextState: state, ...payload })
    // schedule a state update. removing the rAF seems to result
    // in a race condition when an element is selected and both
    // an onMouseUp and onBlur events can be occurring.
    requestAnimationFrame(() => {
      state = nextState
    })
  }

  return { state, getState, transition, subscribe }
}

export { wrapEvent, measureElements, createMachine }
