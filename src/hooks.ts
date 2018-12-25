import { useCallback, useState, useEffect, useRef, useLayoutEffect } from 'react'

const imageCache = new Map()

const useImage = (src: string, critical?: boolean, onLoad?, onError?): [boolean, () => void] => {
  const alreadyLoaded = imageCache.has(src)
  const [imgLoaded, setImgLoaded] = useState(alreadyLoaded)

  const loadImage = useCallback(
    () => {
      if (alreadyLoaded) return

      const img = new Image()

      img.src = src

      img.onload = () => {
        imageCache.set(src, src)

        onLoad && onLoad(img)
      }

      img.onerror = () => {
        onError && onError(img)
      }
    },
    [src]
  )

  return [alreadyLoaded, loadImage]
}

type IntersectionObserverProps = {
  once: boolean
  onAppear: () => void
  options?:
    | {
        root: HTMLElement
        rootMargin: any
        threshold: number | number[]
      }
    | {}
}

const useIntersectionObserver = ({
  once,
  onAppear,
  options = {}
}: IntersectionObserverProps): React.MutableRefObject<any> => {
  const [seenBefore, setSeenBefore] = useState(false)
  const ioRef = useRef(null)
  const targetElement = useRef(null)

  const cleanup = useCallback(() => {
    ioRef.current.unobserve(targetElement.current)
    ioRef.current.disconnect()
  }, [])

  useEffect(() => {
    if (typeof window == 'undefined') return

    ioRef.current = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting || entry.intersectionRatio > 0) {
        if (!seenBefore) setSeenBefore(true)

        onAppear()

        if (once) cleanup()
      }
    }, options)

    ioRef.current.observe(targetElement.current)

    return cleanup
  }, [])

  return targetElement
}

/**
 * @description
 * Simple toggle hook
 */
const useToggle = (initial: boolean): [boolean, () => void] => {
  const [on, setOn] = useState(initial)

  const toggle = useCallback(
    () => {
      setOn(!on)
    },
    [on]
  )

  return [on, toggle]
}

export { useImage, useToggle, useIntersectionObserver }
