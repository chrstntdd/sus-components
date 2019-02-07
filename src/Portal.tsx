import * as React from 'react'
import { createPortal } from 'react-dom'

interface PortalProps {
  type?: keyof HTMLElementTagNameMap
}

/**
 * @description
 * To render an element and child into a portal — outside of
 * the normal flow of the document.
 */
const Portal: React.FC<PortalProps> = ({ type, children }) => {
  const node = React.useRef(null)

  React.useEffect(() => {
    if (typeof window === 'undefined') return

    if (!node.current) {
      node.current = document.createElement(type || 'div')
      document.body.appendChild(node.current)
    }

    return () => {
      document.body.removeChild(node.current)
    }
  }, [])

  return node.current && createPortal(children, node.current)
}

export { Portal }
