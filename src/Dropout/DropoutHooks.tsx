import * as React from 'react'

import { Portal } from '../Portal'

import {
  dropoutReducer,
  generateId,
  resetIdCounter,
  scrollIfNeeded,
  stateChart,
  wrapEvent
} from './shared'

/**
 * @description
 * Simplest way to re-measure the elements in the dropdown
 * when the `observe` flag is flipped.
 *
 * If more updates are needed, an event listener can be added
 * that can also call to update the measurements on those events.
 *
 * 👀 consider using `observeDomNode()`
 *
 * The re-render of this hook are required to flush updates to
 * the context and all the items in the list.
 */
const useMeasureDomNode = (nodeRef: React.MutableRefObject<HTMLElement>, observe = true) => {
  const [nodeDimensions, setNodeDimensions] = React.useState(() => null)

  React.useEffect(() => {
    setNodeDimensions(nodeRef.current.getBoundingClientRect())
  }, [observe])

  return nodeDimensions
}

const initialState = {
  finiteState: stateChart.initial as FiniteDropoutStates,
  navigationValue: null,
  value: ''
}

// @ts-ignore We only need a bit of state to kickoff the state machine,
// the rest it taken care of in the renders.
const DropoutContext: React.Context<DropoutState> = React.createContext(initialState)

/**
 * @description
 * Main component that **must** wrap all other Dropout components
 *
 * @see https://www.w3.org/TR/wai-aria-practices/#combobox
 */
const Dropout: React.FC = ({ children }) => {
  // @ts-ignore
  const [state, dispatch] = React.useReducer(dropoutReducer, initialState)

  const getItemId = React.useRef(null)
  const optionsRef = React.useRef(null)
  const inputRef = React.useRef(null)
  const inputId = React.useRef(null)
  const menuRef = React.useRef(null)
  const menuId = React.useRef(null)

  React.useEffect(() => {
    const mainId = `dropout-${generateId()}`

    menuId.current = `${mainId}-menu`
    inputId.current = `${mainId}-input`
    getItemId.current = index => `${mainId}-item-${index}`
  }, [])

  const isInVisibleState = visibleStates.includes(state.finiteState)
  const rect = useMeasureDomNode(inputRef, isInVisibleState)

  const context = React.useMemo(
    () => ({
      ...state,
      dispatch,
      getItemId,
      inputId,
      inputRef,
      menuId,
      menuRef,
      optionsRef,
      rect
    }),
    [inputId, menuId, menuRef, optionsRef, rect, state.value, state.navigationValue]
  )

  return (
    <div
      role="combobox"
      aria-expanded={isInVisibleState}
      aria-haspopup="listbox"
      aria-owns={isInVisibleState ? menuId.current : null}
    >
      <DropoutContext.Provider value={context}>{children}</DropoutContext.Provider>
    </div>
  )
}

type InputProps = {
  selectOnClick?: boolean
  autocompleteOnNav?: boolean
} & React.HTMLProps<HTMLInputElement>

const DropoutInput: React.FC<InputProps> = ({
  selectOnClick = false,
  autocompleteOnNav = false,
  onClick,
  onChange,
  onKeyDown,
  onBlur,
  onFocus,
  ...props
}) => {
  const {
    dispatch,
    finiteState,
    getItemId,
    inputRef,
    menuId,
    navigationValue,
    value,
    optionsRef: { current: options }
  } = React.useContext(DropoutContext)

  const handleBlur = React.useCallback(() => {
    /* istanbul ignore else */
    if (finiteState !== 'selectingWithClick') dispatch({ type: 'CLOSE' })
  }, [finiteState])

  const handleChange = React.useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    const inputValue = event.currentTarget.value
    // TODO: handle special characters

    if (inputValue.trim() === '') {
      dispatch({ type: 'CLEAR' })
    } else {
      dispatch({ type: 'CHANGE', value: inputValue })
    }
  }, [])

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
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
    },
    [navigationValue, finiteState, value, options]
  )

  const inputValue =
    finiteState === 'navigating' || finiteState === 'selectingWithClick'
      ? // When idle, we don't have a navigationValue on ArrowUp/Down
        navigationValue || value
      : value

  const isInVisibleState = visibleStates.includes(finiteState)

  let activeDescendant = null

  if (isInVisibleState) {
    for (let i = 0; i < options.length; i++) {
      if (options[i] === navigationValue) {
        activeDescendant = getItemId.current(i)
      }
    }
  }

  return (
    <input
      ref={inputRef}
      role="textbox" // or searchbox
      aria-autocomplete="list"
      aria-activedescendant={isInVisibleState ? activeDescendant : null}
      aria-controls={isInVisibleState ? menuId.current : null}
      aria-multiline={false}
      data-dropoutinput
      {...props}
      value={inputValue}
      onBlur={wrapEvent(onBlur, handleBlur)}
      onChange={wrapEvent(onChange, handleChange)}
      onKeyDown={wrapEvent(onKeyDown, handleKeyDown)}
    />
  )
}

const visibleStates = ['suggesting', 'navigating', 'selectingWithClick']

let selectingWithClickNode = null

const DropoutList: React.FC = ({ children }) => {
  const {
    dispatch,
    finiteState,
    getItemId,
    menuId,
    menuRef,
    navigationValue,
    optionsRef,
    rect,
    value
  } = React.useContext(DropoutContext)

  /**
   * @description
   * To track if a user were to mouseDown on an item, hold, then release the
   * click outside of the dropdown items.
   */
  React.useEffect(() => {
    const mouseUpHandler = (event: MouseEvent) => {
      if (selectingWithClickNode && selectingWithClickNode !== event.target) {
        selectingWithClickNode = null
        dispatch({ type: 'CLOSE' })
      }
    }

    document.addEventListener('mouseup', mouseUpHandler)

    return () => {
      document.removeEventListener('mouseup', mouseUpHandler)
    }
  }, [])

  React.useEffect(() => {
    // @ts-ignore
    optionsRef.current = React.Children.map(children, ({ props: { value } }) => value)
    return () => {
      optionsRef.current = null
    }
  })

  if (!children) return null

  const clones = React.Children.map(children, (child, index) =>
    // @ts-ignore
    React.cloneElement(child, {
      id: getItemId.current ? getItemId.current(index) : null,
      menuRef,
      dispatch,
      navigationValue,
      contextValue: value || ''
    })
  )

  const el = visibleStates.includes(finiteState) && rect && (
    <ul
      ref={menuRef}
      id={menuId.current}
      role="listbox"
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

interface DropoutOptionProps {
  children: React.ReactElement<any>
  value: string
  onClick?: (e: any) => void
  onMouseDown?: (e: any) => void
}

const DropoutOption: React.FC<DropoutOptionProps & ImplicitContext> = React.memo(
  function DropoutOption({
    children,
    value,

    // implicit (from context)
    menuRef,
    dispatch,
    contextValue,
    navigationValue,

    // wrapped
    onClick,
    onMouseDown,
    ...props
  }) {
    const root = React.useRef(null)
    /**
     * @description
     * Here we set the 'intended' target to be selected
     */
    const handleMouseDown = React.useCallback(
      event => {
        // This prevents the activeElement from being changed
        // to the item so it can remain with the current activeElement
        // which is a more common use case.
        event.preventDefault()

        selectingWithClickNode = event.target
        dispatch({ type: 'MOUSE_DOWN' })
      },
      [selectingWithClickNode]
    )

    const handleClick = React.useCallback(() => {
      dispatch({ type: 'SELECT_WITH_CLICK', value })
    }, [])

    const isActive = navigationValue === value

    React.useEffect(() => {
      if (isActive) {
        scrollIfNeeded(root.current, menuRef.current)
      }
    }, [isActive])

    return (
      <li
        ref={root}
        role="option"
        {...props}
        data-dropoutitem
        aria-selected={isActive}
        onClick={wrapEvent(onClick, handleClick)}
        onMouseDown={wrapEvent(onMouseDown, handleMouseDown)}
      >
        {children}
      </li>
    )
  },
  (prevProps, nextProps) => {
    /* Simple check, probably buggy when the children change */
    const wasActive = prevProps.navigationValue === prevProps.value
    const isActive = nextProps.navigationValue === nextProps.value
    if (wasActive === isActive) {
      return true
    }
    return false
  }
)

export { Dropout, DropoutInput, DropoutList, DropoutOption, resetIdCounter }
