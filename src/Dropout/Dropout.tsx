import * as React from 'react'

import { Portal } from '../Portal'
import { dropoutReducer, stateChart, wrapEvent, measureElements } from './shared'

// @ts-ignore
const DropoutContext: React.Context<DropoutState> = React.createContext()

interface DropoutProps {
  children: React.ReactElement<any>[]
}

/**
 * @description
 * Main component that **must** wrap all other Dropout components
 */
class Dropout extends React.PureComponent<DropoutProps, DropoutState> {
  readonly state: DropoutState = {
    dispatch: (action: DropoutAction) => {
      this.setState(state => dropoutReducer(state, action))
    },
    finiteState: stateChart.initial as FiniteDropoutStates,
    inputRef: React.createRef(),
    navigationValue: null,
    optionsRef: React.createRef(),
    rect: null,
    value: ''
  }

  unsubscribe: () => void

  cleanup: () => void

  componentDidMount() {
    const resizeListener = () => {
      const [rect] = measureElements(this.state.inputRef)

      this.setState({ rect })
    }

    window.addEventListener('resize', resizeListener)

    this.cleanup = () => {
      window.removeEventListener('resize', resizeListener)
    }

    resizeListener()
  }

  componentWillUnmount() {
    this.cleanup()
  }

  render() {
    return (
      <DropoutContext.Provider value={this.state}>{this.props.children}</DropoutContext.Provider>
    )
  }
}

interface InputProps {
  onBlur: (e: any) => void
  onChange: (e: any) => void
  onClick: (e: any) => void
  onFocus: (e: any) => void
  onKeyDown: (e: any) => void
  selectOnClick?: boolean
  autocompleteOnNav?: boolean
}

class DropoutInput extends React.Component<InputProps & React.HTMLProps<HTMLInputElement>> {
  static contextType = DropoutContext

  static defaultProps = {
    selectOnClick: false,
    autocompleteOnNav: false
  }

  context!: React.ContextType<typeof DropoutContext>

  handleBlur = () => {
    const { finiteState, dispatch } = this.context

    /* istanbul ignore else */
    if (finiteState !== 'selectingWithClick') dispatch({ type: 'CLOSE' })
  }

  handleChange = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const inputValue = event.currentTarget.value
    // TODO: handle special characters

    if (inputValue.trim() === '') {
      this.context.dispatch({ type: 'CLEAR' })
    } else {
      this.context.dispatch({ type: 'CHANGE', value: inputValue })
    }
  }

  handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const {
      dispatch,
      finiteState,
      navigationValue,
      optionsRef: { current: options }
    } = this.context

    switch (event.key) {
      case 'ArrowDown':
        // Don't scroll the page
        event.preventDefault()

        // No need to navigate
        /* istanbul ignore if */
        if (!options || options.length === 0) return

        if (finiteState === 'idle') {
          // Opening a closed list, we don't want to select anything,
          // just open it.
          dispatch({ type: 'NAVIGATE', value: null })
        } else {
          const index = options.indexOf(navigationValue)
          const atBottom = index === options.length - 1
          if (atBottom) {
            // Go back to the value the user has typed
            dispatch({ type: 'NAVIGATE', value: null })
          } else {
            // Go to the next item in the list
            const nextValue = options[(index + 1) % options.length]
            dispatch({ type: 'NAVIGATE', value: nextValue })
          }
        }
        break

      case 'ArrowUp':
        // Don't scroll the page
        event.preventDefault()

        // No need to navigate
        /* istanbul ignore if */
        if (!options || options.length === 0) return

        if (finiteState === 'idle') {
          dispatch({ type: 'NAVIGATE', value: null })
        } else {
          const index = options.indexOf(navigationValue)
          if (index === 0) {
            // Go back to the value the user has typed
            dispatch({ type: 'NAVIGATE', value: null })
          } else if (index === -1) {
            // select the last one
            const value = options.length ? options[options.length - 1] : null
            dispatch({ type: 'NAVIGATE', value })
          } else {
            // normal case, select previous
            const nextValue = options[(index - 1 + options.length) % options.length]
            dispatch({ type: 'NAVIGATE', value: nextValue })
          }
        }
        break

      case 'Escape':
        /* istanbul ignore else */
        if (finiteState !== 'idle') dispatch({ type: 'CLOSE' })
        break

      case 'Enter':
        /* istanbul ignore else */
        if (finiteState === 'navigating' && navigationValue !== null) {
          // don't want to submit forms
          event.preventDefault()
          dispatch({ type: 'SELECT_WITH_KEYBOARD' })
        }
        break

      /* istanbul ignore next */
      default:
    }
  }

  render() {
    const {
      onClick,
      onChange,
      onKeyDown,
      onBlur,
      onFocus,
      selectOnClick,
      autocompleteOnNav,
      ...props
    } = this.props
    const { finiteState, value, navigationValue } = this.context

    const inputValue =
      finiteState === 'navigating' || finiteState === 'selectingWithClick'
        ? // When idle, we don't have a navigationValue on ArrowUp/Down
          navigationValue || value
        : value

    return (
      <input
        ref={this.context.inputRef}
        aria-autocomplete="list"
        aria-label="TODO"
        data-dropoutinput
        {...props}
        value={inputValue}
        onBlur={wrapEvent(onBlur, this.handleBlur)}
        onChange={wrapEvent(onChange, this.handleChange)}
        onKeyDown={wrapEvent(onKeyDown, this.handleKeyDown)}
      />
    )
  }
}

interface DropoutListProps {
  children: React.ReactElement<any>[]
  style?: React.CSSProperties
}

const visibleStates = ['suggesting', 'navigating', 'selectingWithClick']

let selectingWithClickNode = null

class DropoutList extends React.PureComponent<DropoutListProps, {}> {
  static contextType = DropoutContext

  context!: React.ContextType<typeof DropoutContext>

  cleanup: () => void

  componentDidMount() {
    /**
     * @description
     * To track if a user were to mouseDown on an item, hold, then release the
     * click outside of the dropdown items.
     */
    const mouseUpHandler = (event: MouseEvent) => {
      if (selectingWithClickNode && selectingWithClickNode !== event.target) {
        selectingWithClickNode = null
        this.context.dispatch({ type: 'CLOSE' })
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

    const { navigationValue, value, rect, dispatch, finiteState } = this.context

    // useEffect? to update context not sure if needed with legacy react
    this.context.optionsRef.current = React.Children.map(children, ({ props: { value } }) => value)

    const clones = React.Children.map(children, child =>
      React.cloneElement(child, {
        dispatch,
        navigationValue,
        contextValue: value || ''
      })
    )

    const el = visibleStates.includes(finiteState) && rect && (
      <ul
        role="listbox"
        aria-label="TODO"
        data-dropoutmenu
        style={{
          top: rect.bottom,
          left: rect.left,
          width: rect.width
        }}
      >
        {clones}
      </ul>
    )

    return <Portal>{el}</Portal>
  }
}

interface DropoutOptionProps {
  children: React.ReactElement<any>
  value: string
  onClick?: (e: any) => void
  onMouseDown?: (e: any) => void
}

class DropoutOption extends React.Component<DropoutOptionProps & ImplicitContext> {
  shouldComponentUpdate(nextProps) {
    const wasActive = this.props.navigationValue === this.props.value
    const isActive = nextProps.navigationValue === nextProps.value
    if (wasActive !== isActive) {
      return true
    }
    return false
  }

  /**
   * @description
   * Here we set the 'intended' target to be selected
   */
  handleMouseDown = event => {
    // This prevents the activeElement from being changed
    // to the item so it can remain with the current activeElement
    // which is a more common use case.
    event.preventDefault()

    selectingWithClickNode = event.target
    this.props.dispatch({ type: 'MOUSE_DOWN' })
  }

  handleClick = () => {
    const { value } = this.props

    this.props.dispatch({ type: 'SELECT_WITH_CLICK', value })
  }

  render() {
    const {
      children,
      value,

      // implicit (from context...?)
      dispatch,
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
        data-dropoutitem
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
