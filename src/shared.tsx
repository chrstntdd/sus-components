import * as React from 'react'
import { createPortal } from 'react-dom'

interface PortalProps {
  type: keyof HTMLElementTagNameMap
}
interface PortalState {}

/**
 * @description
 * To render an element and child into a portal — outside of
 * the normal flow of the document.
 */
class Portal extends React.Component<PortalProps, PortalState> {
  constructor(props) {
    super(props)
  }

  childNode: any

  cleanup: () => void

  componentDidMount() {
    this.childNode = document.createElement(this.props.type || 'portal')

    document.body.appendChild(this.childNode)

    this.cleanup = () => {
      document.body.removeChild(this.childNode)
    }

    this.forceUpdate() // flush createElement + appendChild updates
  }

  componentWillUnmount() {
    this.cleanup()
  }

  render() {
    return this.childNode ? createPortal(this.props.children, this.childNode) : null
  }
}

export { Portal }
