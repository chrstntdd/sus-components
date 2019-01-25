import { useCallback, useState, useEffect, useRef } from 'react'

const imageCache = new Map()

const useImage = (src: string, critical?: boolean, onLoad?, onError?): [boolean, () => void] => {
  const alreadyLoaded = imageCache.has(src)
  const [imgLoaded, setImgLoaded] = useState(alreadyLoaded)

  const loadImage = useCallback(() => {
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
  }, [src])

  return [alreadyLoaded, loadImage]
}

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

/**
 * @description
 * Simple toggle hook
 */
const useToggle = (initial: boolean): [boolean, () => void] => {
  const [on, setOn] = useState(initial)

  const toggle = useCallback(() => {
    setOn(!on)
  }, [on])

  return [on, toggle]
}

export { useImage, useToggle, useAppearOnce }
