import { useCallback, useState, useEffect, useRef } from 'react'

type IntersectionObserverProps = {
  root: HTMLElement
  rootMargin: any
  threshold: number | number[]
}

const useAppearOnce = (
  onAppear: () => void,
  options?: IntersectionObserverProps
): React.MutableRefObject<any> => {
  const ioRef = useRef(null)
  const targetElement = useRef(null)

  useEffect(() => {
    ioRef.current = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting || entry.intersectionRatio > 0) {
        onAppear()

        ioRef.current.disconnect()
      }
    }, options || {})

    ioRef.current.observe(targetElement.current)
  }, [])

  return targetElement
}

const useToggle = (initial: boolean): [boolean, () => void] => {
  const [on, setOn] = useState(initial)

  const toggle = useCallback(() => {
    setOn(!on)
  }, [on])

  return [on, toggle]
}

export { useToggle, useAppearOnce }
