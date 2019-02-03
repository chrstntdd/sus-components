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
class Portal extends React.Component<PortalProps> {
  defaultNode: HTMLElement | HTMLDivElement

  componentWillUnmount() {
    if (this.defaultNode) {
      document.body.removeChild(this.defaultNode)
    }
    this.defaultNode = null
  }

  render() {
    if (typeof window === 'undefined') return null

    if (!this.defaultNode) {
      this.defaultNode = document.createElement(this.props.type || 'div')
      document.body.appendChild(this.defaultNode)
    }

    return createPortal(this.props.children, this.defaultNode)
  }
}

export { Portal }
