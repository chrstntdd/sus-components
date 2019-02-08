const stateChart = {
  initial: 'idle',
  idle: {
    CLOSE: 'idle',
    CLEAR: 'idle',
    CHANGE: 'suggesting',
    NAVIGATE: 'navigating'
  },
  suggesting: {
    CHANGE: 'suggesting',
    NAVIGATE: 'navigating',
    MOUSE_DOWN: 'selectingWithClick',
    CLEAR: 'idle',
    CLOSE: 'idle'
  },
  navigating: {
    CHANGE: 'suggesting',
    ARROW_UP_DOWN: 'navigating',
    MOUSE_DOWN: 'selectingWithClick',
    CLEAR: 'idle',
    CLOSE: 'idle',
    NAVIGATE: 'navigating',
    SELECT_WITH_KEYBOARD: 'idle',
    SELECT_WITH_CLICK: 'idle'
  },
  selectingWithClick: {
    SELECT_WITH_CLICK: 'idle'
  }
}

const dropoutReducer = (state: Readonly<DropoutState>, action: DropoutAction): DropoutState => {
  const nextFiniteState: FiniteDropoutStates = stateChart[state.finiteState][action.type]

  switch (action.type) {
    case 'CLOSE':
      return {
        ...state,
        navigationValue: null,
        finiteState: nextFiniteState
      }

    case 'CLEAR':
      return {
        ...state,
        value: '',
        navigationValue: null,
        finiteState: nextFiniteState
      }

    case 'CHANGE':
      return {
        ...state,
        value: action.value,
        navigationValue: null,
        finiteState: nextFiniteState
      }

    case 'NAVIGATE':
      return {
        ...state,
        navigationValue: action.value,
        finiteState: nextFiniteState
      }

    case 'SELECT_WITH_CLICK':
      return {
        ...state,
        value: action.value,
        navigationValue: null,
        finiteState: nextFiniteState
      }

    case 'SELECT_WITH_KEYBOARD':
      return {
        ...state,
        value: state.navigationValue,
        navigationValue: null,
        finiteState: nextFiniteState
      }

    default:
      return state
  }
}

const measureElements = (...elements: React.RefObject<HTMLElement>[]) =>
  elements.map(el => el.current.getBoundingClientRect())

const wrapEvent = (handler, cb) => (event: React.SyntheticEvent) => {
  handler && handler(event)

  if (!event.defaultPrevented) return cb(event)
}

export { stateChart, dropoutReducer, wrapEvent, measureElements }
