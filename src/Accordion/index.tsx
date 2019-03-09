import React from 'react'
import { nextUuid } from './helpers'

const AccordionContext = React.createContext({} as any)

interface AccordionProps {
  keepOpen?: boolean
}

const accordionReducer = (state: number, action) => {
  switch (action.type) {
    case 'TOGGLE':
      if (state === action.id) {
        return -1
      }
      return action.id
  }
}

const Accordion: React.FC<AccordionProps> = ({ children, keepOpen }) => {
  const [state, dispatch] = React.useReducer(accordionReducer, -1)

  const value = { state, dispatch }

  return (
    <AccordionContext.Provider value={value}>
      <div className="accordion" role="tablist">
        {children}
      </div>
    </AccordionContext.Provider>
  )
}

interface FoldProps {
  handleToggle?: (event: React.SyntheticEvent) => void
  label: string
  id: string
  sectionId: string
}

/**
 * @description
 * An accordion item
 */
const Fold: React.FC<FoldProps> = ({ label, id, sectionId, children }) => {
  const { state, dispatch } = React.useContext(AccordionContext)
  const uuid = React.useRef(null)

  React.useEffect(() => {
    uuid.current = nextUuid()
  }, [])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.keyCode === 32 || event.keyCode === 13) {
      dispatch({ type: 'TOGGLE', id: uuid.current })
    }
  }

  const handleClick = () => {
    dispatch({ type: 'TOGGLE', id: uuid.current })
  }

  return (
    <div className="container-thing">
      <div
        className="fold"
        role="tab"
        tabIndex={0}
        id={id}
        aria-controls={sectionId}
        onKeyDown={handleKeyDown}
        onClick={handleClick}
        // aria-selected={} TODO
      >
        {label}
      </div>
      <div
        tabIndex={0}
        role="tabpanel"
        id={sectionId}
        aria-labelledby={id}
        aria-hidden={state !== uuid.current}
      >
        {children}
      </div>
    </div>
  )
}

export { Accordion, Fold }
