import * as React from 'react'

import { Portal } from './Portal'
import observeRect from './observe-rect'

/**
 * @description
 * A set of components to build an (accessible)
 * combobox. Using classes here for compat reasons
 */

type StateObj = { [key: string]: any }

// create redux
interface Store {
  state: StateObj
  listeners: any[]
  getState: () => StateObj
  subscribe: (listener) => void
  dispatch: (action) => void
}

const createStore = (reducer, initialState): Store => {
  // @ts-ignore
  const store: Store = {}

  store.state = initialState
  store.listeners = []

  store.getState = () => store.state

  store.subscribe = listener => {
    store.listeners.push(listener)
  }

  store.dispatch = action => {
    store.state = reducer(store.state, action)
    store.listeners.forEach(listener => listener())
  }

  return store
}

const createMachine = (chart, reducer, initialState) => {
  let state = chart.initial
  const { dispatch, state: data } = createStore(reducer, initialState)

  const transition = (action, payload = {}) => {
    const nextState = chart[state][action]
    dispatch({ state, type: action, nextState: state, ...payload })
    state = nextState
  }

  return { state, data, transition }
}

// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

let selectingWithClickNode = null

const DropoutContext = React.createContext({})

const wrapEvent = (handler, cb) => (event: React.SyntheticEvent) => {
  handler && handler(event)

  if (!event.defaultPrevented) return cb(event)
}

interface DropoutListProps {
  children: React.ReactElement<any>[]
  style?: React.CSSProperties
}
interface DropoutListState {
  // ...
}

class DropoutList extends React.Component<DropoutListProps, DropoutListState> {
  static contextType = DropoutContext

  constructor(props) {
    super(props)
  }

  cleanup: () => void

  componentDidMount() {
    const mouseUpHandler = event => {
      if (selectingWithClickNode && selectingWithClickNode !== event.target) {
        selectingWithClickNode = null
      }
    }

    document.addEventListener('mouseup', mouseUpHandler)

    this.cleanup = () => {
      document.removeEventListener('mouseup', mouseUpHandler)
    }
  }

  componentWillUnmount() {
    this.cleanup()

    this.context.optionsRef.current = null
  }

  render() {
    if (!this.props.children) return null

    const {
      data: { navigationValue, value },
      transition
    } = this.context

    // useEffect? to update context not sure if needed with legacy react
    this.context.optionsRef.current = React.Children.map(
      this.props.children,
      ({ props: { children } }) => children
    )

    const clones = React.Children.map(this.props.children, child => {
      return React.cloneElement(child, {
        transition,
        navigationValue,
        contextValue: value || ''
      })
    })

    const el = this.context.rect && (
      <ul
        style={{
          ...this.props.style,
          position: 'fixed',
          top: this.context.rect.bottom,
          left: this.context.rect.left,
          width: this.context.rect.width
        }}
      >
        {clones}
      </ul>
    )

    return <Portal>{this.context.rect && el}</Portal>
  }
}

interface DropoutOptionProps {
  // ..
}
interface DropoutOptionState {
  // ...
}

class DropoutOption extends React.Component<DropoutOptionProps, DropoutOptionState> {
  static contextType = DropoutContext

  constructor(props) {
    super(props)
  }

  /**
   * @description
   * Here we set the 'intended' target to be selected
   */
  handleMouseDown = event => {
    this.context.transition('MOUSE_DOWN')

    selectingWithClickNode = event.target
  }
  handleClick = () => {
    this.context.transition('SELECT_BY_CLICK')
  }

  render() {
    const {
      children,
      // @ts-ignore
      value,

      // implicit (from context...?)
      // @ts-ignore
      transition,
      // @ts-ignore
      onSelect,
      // @ts-ignore
      contextValue,
      // @ts-ignore
      navigationValue,

      // wrapped
      // @ts-ignore
      onClick,
      // @ts-ignore
      onMouseDown,

      ...props
    } = this.props

    const isActive = navigationValue === value

    return (
      <li
        {...props}
        aria-selected={isActive}
        onClick={wrapEvent(onClick, this.handleClick)}
        onMouseDown={wrapEvent(onMouseDown, this.handleMouseDown)}
      >
        {children}
      </li>
    )
  }
}

const mainReducer = (data, action) => {
  switch (action.type) {
    case 'CHANGE':
      return {
        ...data,
        navigationValue: null,
        value: action.value
      }
    case 'NAVIGATE':
      return {
        ...data,
        navigationValue: action.value
      }
    case 'CLEAR':
      return {
        ...data,
        value: '',
        navigationValue: null
      }
    case 'CLOSE':
      return {
        ...data,
        navigationValue: null
      }
    case 'SELECT_WITH_CLICK':
      return {
        ...data,
        value: action.value,
        navigationValue: null
      }
    case 'SELECT_WITH_KEYBOARD':
      return {
        ...data,
        value: data.navigationValue,
        navigationValue: null
      }
    default:
      return data
  }
}

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
    SELECT_WITH_KEYBOARD: 'idle'
  },
  selectingWithClick: {
    SELECT_WITH_CLICK: 'idle'
  }
}

/**
 * @description
 * Main component that **must** wrap all other Dropout* components
 */
class Dropout extends React.Component {
  constructor(props) {
    super(props)
  }

  observerRef: {
    current: {
      observe: () => void
      unobserve: () => void
    }
  } = React.createRef()

  state = { rect: null }

  // We store the values of all the Options on this ref through context on
  // render. This makes it possible to perform the keyboard navigation from
  // the input on the list.
  options: { current: React.RefObject<any>[] } = React.createRef() // list of refs

  // To position the menu over the input with useRect we need to store the
  // input ref up here.
  inputRef: React.RefObject<HTMLInputElement> = React.createRef()

  internalState = createMachine(stateChart, mainReducer, {
    // the value the user has typed
    value: '',

    // the value the user has navigated to with the keyboard
    navigationValue: null
  })

  componentDidMount() {
    this.observerRef.current = observeRect(this.inputRef.current, rect => {
      this.setState({ rect })
    })

    this.observerRef.current.observe()
  }

  componentWillUnmount() {
    this.observerRef.current.unobserve()
  }

  render() {
    const context = {
      rect: this.state.rect,
      inputRef: this.inputRef,
      optionsRef: this.options,
      ...this.internalState
    }

    return <DropoutContext.Provider value={context}>{this.props.children}</DropoutContext.Provider>
  }
}

interface InputProps {
  // from Context
  moveHighlightedIndex: (n: number) => void

  // for input element
  onBlur: (e: any) => void
  onChange: (e: any) => void
  onClick: (e: any) => void
  onFocus: (e: any) => void
  onKeyDown: (e: any) => void
}
interface InputState {}

class DropoutInput extends React.Component<InputProps, InputState> {
  static contextType = DropoutContext

  constructor(props) {
    super(props)

    this.state = {
      value: ''
    }
  }

  handleClick = () => {
    //
  }

  handleFocus = () => {
    //
  }

  handleBlur = () => {
    //
  }

  handleChange = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const inputValue = event.currentTarget.value
    const safeInputValue = inputValue.trim() // TODO: escape special chars too

    if (safeInputValue === '') {
      //
    } else {
      this.context.transition('CHANGE', { value: safeInputValue })
      this.setState({ value: safeInputValue })
    }
  }

  handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const {
      transition,
      state,
      data,
      optionsRef: { current: options }
    } = this.context

    // TODO: investigate why data is not being updated

    switch (event.key) {
      case 'ArrowDown': {
        // Don't scroll the page
        event.preventDefault()

        // No need to navigate
        if (!options || options.length === 0) return

        if (state === 'idle') {
          // Opening a closed list, we don't want to select anything,
          // just open it.
          transition('NAVIGATE', { value: null })
        } else {
          const index = options.indexOf(data.navigationValue)
          const atBottom = index === options.length - 1
          if (atBottom) {
            // Go back to the value the user has typed
            transition('NAVIGATE', { value: null })
          } else {
            // Go to the next item in the list
            const nextValue = options[(index + 1) % options.length]
            transition('NAVIGATE', { value: nextValue })
          }
        }
        break
      }
      case 'ArrowUp': {
        // Don't scroll the page
        event.preventDefault()

        // No need to navigate
        if (!options || options.length === 0) return

        if (state === 'idle') {
          transition('NAVIGATE', { value: null })
        } else {
          const index = options.indexOf(data.navigationValue)
          if (index === 0) {
            // Go back to the value the user has typed
            transition('NAVIGATE', { value: null })
          } else if (index === -1) {
            // select the last one
            const value = options.length ? options[options.length - 1] : null
            transition('NAVIGATE', { value })
          } else {
            // normal case, select previous
            const nextValue = options[(index - 1 + options.length) % options.length]
            transition('NAVIGATE', { value: nextValue })
          }
        }
        break
      }
      case 'Escape': {
        if (state !== 'idle') transition('CLOSE')
        break
      }
      case 'Enter': {
        if (state === 'navigating' && data.navigationValue !== null) {
          // don't want to submit forms
          event.preventDefault()
          // onSelect && onSelect(navigationValue);
          // not sure if we want this, if we don't do it, apps can do in
          // `onSelect` what they do in `onChange`, but probably want to keep
          // the old results after a selection
          // onChange && onChange(event);
          transition('SELECT_WITH_KEYBOARD')
        }
        break
      }
      default: {
      }
    }
  }

  render() {
    const {
      // highlights all the text in the box on click when true
      // @ts-ignore
      selectOnClick = false,
      // @ts-ignore
      autocompleteOnNav = true,

      // wrapped events
      onClick,
      onChange,
      onKeyDown,
      onBlur,
      onFocus,

      ...props
    } = this.props

    return (
      <input
        ref={this.context.inputRef}
        {...props}
        onBlur={wrapEvent(onBlur, this.handleBlur)}
        onChange={wrapEvent(onChange, this.handleChange)}
        onClick={wrapEvent(onClick, this.handleClick)}
        onFocus={wrapEvent(onFocus, this.handleFocus)}
        onKeyDown={wrapEvent(onKeyDown, this.handleKeyDown)}
      />
    )
  }
}

export { Dropout, DropoutInput, DropoutList, DropoutOption }
