import * as React from 'react'

import { Portal } from '../Portal'
import { wrapEvent, measureElements, createMachine, TransitionFn } from './helpers'

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

// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

let selectingWithClickNode = null

const DropoutContext = React.createContext({})

const dropoutStore = createMachine(stateChart, mainReducer, {
  // the value the user has typed
  value: '',

  // the value the user has navigated to with the keyboard
  navigationValue: null
})

/**
 * @description
 * Main component that **must** wrap all other Dropout components
 */
class Dropout extends React.Component {
  constructor(props) {
    super(props)

    this.unsubscribe = dropoutStore.subscribe(() => {
      // Flush all updates
      this.setState({})
    })
  }

  readonly state = { rect: null }

  // We store the values of all the Options on this ref through context on
  // render. This makes it possible to perform the keyboard navigation from
  // the input on the list.
  options: { current: React.RefObject<any>[] } = React.createRef() // list of refs

  // To position the menu over the input with useRect we need to store the
  // input ref up here.
  inputRef: React.RefObject<HTMLInputElement> = React.createRef()

  componentDidMount() {
    const resizeListener = () => {
      const [rect] = measureElements(this.inputRef)

      this.setState({ rect })
    }

    window.addEventListener('resize', resizeListener, { passive: true })

    this.cleanup = () => {
      this.unsubscribe()
      window.removeEventListener('resize', resizeListener)
    }

    resizeListener()
  }

  cleanup: () => void

  unsubscribe: () => void

  componentWillUnmount() {
    this.cleanup()
  }

  render() {
    const context = {
      rect: this.state.rect,
      inputRef: this.inputRef,
      optionsRef: this.options,

      state: dropoutStore.state,
      transition: dropoutStore.transition,
      data: dropoutStore.getState()
    }

    return <DropoutContext.Provider value={context}>{this.props.children}</DropoutContext.Provider>
  }
}

interface InputProps {
  onBlur: (e: any) => void
  onChange: (e: any) => void
  onClick: (e: any) => void
  onFocus: (e: any) => void
  onKeyDown: (e: any) => void
}

class DropoutInput extends React.Component<InputProps, {}> {
  static contextType = DropoutContext

  constructor(props) {
    super(props)
  }

  handleClick = () => {}

  handleFocus = () => {}

  handleBlur = () => {
    if (this.context.state !== 'selectingWithClick') {
      this.context.transition('CLOSE')
    }
  }

  handleChange = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const inputValue = event.currentTarget.value
    const value = inputValue.trim() // TODO: escape special chars too

    if (value === '') {
      this.context.transition('CLEAR')
    } else {
      this.context.transition('CHANGE', { value })
    }
  }

  handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const {
      transition,
      state,
      data,
      optionsRef: { current: options }
    } = this.context

    switch (event.key) {
      case 'ArrowDown':
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

      case 'ArrowUp':
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

      case 'Escape':
        if (state !== 'idle') transition('CLOSE')
        break

      case 'Enter':
        if (state === 'navigating' && data.navigationValue !== null) {
          // don't want to submit forms
          event.preventDefault()
          transition('SELECT_WITH_KEYBOARD')
        }
        break

      default:
    }
  }

  render() {
    const { onClick, onChange, onKeyDown, onBlur, onFocus, ...props } = this.props
    const {
      state,
      data: { value, navigationValue }
    } = this.context

    const inputValue =
      state === 'navigating' || state === 'selectingWithClick'
        ? // When idle, we don't have a navigationValue on ArrowUp/Down
          navigationValue || value
        : value

    return (
      <input
        ref={this.context.inputRef}
        {...props}
        value={inputValue}
        onBlur={wrapEvent(onBlur, this.handleBlur)}
        onChange={wrapEvent(onChange, this.handleChange)}
        onClick={wrapEvent(onClick, this.handleClick)}
        onFocus={wrapEvent(onFocus, this.handleFocus)}
        onKeyDown={wrapEvent(onKeyDown, this.handleKeyDown)}
      />
    )
  }
}

interface DropoutListProps {
  children: React.ReactElement<any>[]
  style?: React.CSSProperties
}

class DropoutList extends React.PureComponent<DropoutListProps, {}> {
  static contextType = DropoutContext

  constructor(props) {
    super(props)
  }

  cleanup: () => void

  componentDidMount() {
    const mouseUpHandler = event => {
      if (selectingWithClickNode && selectingWithClickNode !== event.target) {
        selectingWithClickNode = null
        this.context.transition('CLOSE')
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
    const { children, style } = this.props

    if (!children) return null

    const {
      data: { navigationValue, value },
      rect,
      transition
    } = this.context

    // useEffect? to update context not sure if needed with legacy react
    this.context.optionsRef.current = React.Children.map(children, ({ props: { value } }) => value)

    const clones = React.Children.map(children, child =>
      React.cloneElement(child, {
        transition,
        navigationValue,
        contextValue: value || ''
      })
    )

    const el = rect && (
      <ul
        style={{
          ...style,
          position: 'fixed',
          top: rect.bottom,
          left: rect.left,
          width: rect.width
        }}
      >
        {clones}
      </ul>
    )

    return <Portal>{rect && el}</Portal>
  }
}

interface DropoutOptionProps {
  children: React.ReactElement<any>
  value: string
  onClick: (e: any) => void
  onMouseDown: (e: any) => void

  // From context
  transition: TransitionFn
  contextValue: string
  navigationValue: string
}

class DropoutOption extends React.Component<DropoutOptionProps, {}> {
  static contextType = DropoutContext

  constructor(props) {
    super(props)
  }

  /**
   * @description
   * Here we set the 'intended' target to be selected
   */
  handleMouseDown = event => {
    selectingWithClickNode = event.target
    this.context.transition('MOUSE_DOWN')
  }

  handleClick = () => {
    const { value } = this.props

    this.context.transition('SELECT_WITH_CLICK', { value })
  }

  render() {
    const {
      children,
      value,

      // implicit (from context...?)
      transition,
      contextValue,
      navigationValue,

      // wrapped
      onClick,
      onMouseDown,

      ...props
    } = this.props

    const isActive = navigationValue === value

    return (
      <li
        {...props}
        style={{ backgroundColor: isActive ? 'lightGray' : 'transparent' }}
        aria-selected={isActive}
        onClick={wrapEvent(onClick, this.handleClick)}
        onMouseDown={wrapEvent(onMouseDown, this.handleMouseDown)}
      >
        {children}
      </li>
    )
  }
}

export { Dropout, DropoutInput, DropoutList, DropoutOption }
