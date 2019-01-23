import * as React from 'react'

interface Props {
  children: React.ReactElement<any>
  once?: boolean
  onReveal: () => void
  options?: { [key: string]: any }
}

const Reveal = ({ children, once = false, onReveal, options = {} }: Props) => {
  const [seenBefore, setSeenBefore] = React.useState(false)
  const ioRef = React.useRef(null)
  const rootRef = React.useRef(null)

  const cleanup = React.useCallback(() => {
    ioRef.current.unobserve(rootRef.current)

    ioRef.current.disconnect()
  }, [])

  const handleReveal = React.useCallback(() => {
    if (!seenBefore) setSeenBefore(true)

    onReveal()

    if (once) cleanup()
  }, [rootRef, seenBefore])

  const handleIoUpdates = React.useCallback(
    ([entry]) => {
      if (entry.isIntersecting || entry.intersectionRatio > 0) handleReveal()
    },
    [ioRef]
  )

  React.useEffect(() => {
    if (typeof window === 'undefined') return

    ioRef.current = new IntersectionObserver(handleIoUpdates, options)

    ioRef.current.observe(rootRef.current)

    return cleanup
  }, [])

  const child = React.Children.only(children)

  const clone = React.cloneElement(child, {
    ref: node => {
      rootRef.current = node
    }
  })

  return clone
}

export { Reveal }
