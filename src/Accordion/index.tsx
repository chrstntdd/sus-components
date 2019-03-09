import React from 'react'

import { nextUuid } from './helpers'

const AccordionContext = React.createContext({
  setExpanded: (uuid: number, expanded: boolean) => {},
  state: -1
})

const Accordion: React.FC = ({ children }) => {
  const [state, setState] = React.useState(-1)
  const setExpanded = (uuid: number, expanded: boolean) => {
    if (expanded) {
      setState(uuid)
    } else {
      setState(-1)
    }
  }

  const value = {
    setExpanded,
    state
  }

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
  const { setExpanded, state } = React.useContext(AccordionContext)

  const uuid = React.useRef(null)

  React.useEffect(() => {
    uuid.current = nextUuid()
  }, [])

  const handleToggle = () => {
    setExpanded(uuid.current, state !== uuid.current)
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      handleToggle()
    }
  }

  return (
    <>
      <div
        className="fold"
        role="tab"
        tabIndex={0}
        id={id}
        aria-controls={sectionId}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
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
    </>
  )
}

export { Accordion, Fold }
