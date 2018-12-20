import * as React from 'react'

import { Portal } from '../shared'

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

// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

let selectingWithClickNode = null

const createNamedContext = (name, defaultValue = {}) => {
  const Ctx = React.createContext(defaultValue)
  // @ts-ignore
  Ctx.Consumer.displayName = `${name}.Consumer`
  // @ts-ignore
  Ctx.Provider.displayName = `${name}.Provider`

  return Ctx
}

const DropoutContext = createNamedContext('Dropout')

const wrapEvent = (handler, cb) => (event: React.SyntheticEvent) => {
  handler && handler(event)

  if (!event.defaultPrevented) return cb(event)
}

interface DropoutListProps {
  children: React.ReactElement<any>[]
}
interface DropoutListState {
  // ...
}

class DropoutList extends React.Component<DropoutListProps, DropoutListState> {
  static defaultProps = {}

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

    this.context.options.current = null
  }

  render() {
    // useEffect? to update context not sure if needed with legacy react

    // this.context.options.current = React.Children.map(
    //   this.props.children,
    //   ({ props: { children } }) => children
    // )

    const clones = React.Children.map(this.props.children, child => {
      return React.cloneElement(child, {
        contextValue: (this.context.data && this.context.data.value) || ''
      })
    })

    return (
      <Portal>
        <ul style={{ position: 'fixed' }}>{clones}</ul>
      </Portal>
    )
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
    this.context.dispatch({ type: 'MOUSE_DOWN' })

    selectingWithClickNode = event.target
  }
  handleClick = () => {
    this.context.dispatch({ type: 'SELECT_BY_CLICK' })
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

    return (
      <li
        {...props}
        aria-selected={true} // TODO
        onClick={wrapEvent(onClick, this.handleClick)}
        onMouseDown={wrapEvent(onMouseDown, this.handleMouseDown)}
      >
        {children}
      </li>
    )
  }
}

const mainReducer = (state, action) => {
  switch (action.type) {
    case '': {
      return ''
    }

    default:
      return state
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

  // We store the values of all the Options on this ref through context on
  // render. This makes it possible to perform the keyboard navigation from
  // the input on the list.
  options = React.createRef() // list of refs

  internalState = createStore(mainReducer, {})

  render() {
    const context = {
      options: this.options,
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

  inputRef: React.RefObject<HTMLInputElement> = React.createRef()

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
      this.context.dispatch({ type: 'CHANGE', value: safeInputValue })
      this.setState({ value: safeInputValue })
    }
  }

  handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'ArrowDown': {
        // Prevent scrolling down the page
        event.preventDefault()
        break
      }

      case 'ArrowUp': {
        // Prevent scrolling up the page
        event.preventDefault()

        break
      }
      case 'Escape': {
        break
      }

      case 'Enter': {
        break
      }

      default:
        break
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
        ref={this.inputRef}
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
