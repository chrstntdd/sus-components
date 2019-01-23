import * as React from 'react'

import { useAppearOnce } from './hooks'

const imageCache = new Map()

const DefaultPlaceholder = ({ imageIsReady }) => (
  <div className={`default-placeholder ${!imageIsReady ? 'flicker' : ''}`} />
)

/**
 * @description
 * For background images. The child element will
 * have the `backgroundImage: url()` cloned onto
 * its style prop
 */
type BackgroundImageProps = {
  src: string
  placeholderUi?: React.ReactElement<any>
  critical?: boolean
  onError?: (e: any) => void
  onLoad?: (i: any) => void
  children: React.ReactElement<any>
}

/**
 * @description
 * Main `<Image />` component to handle all cases.
 */
const BackgroundImage = ({ src, critical, placeholderUi, ...props }: BackgroundImageProps) => {
  const seenBefore = React.useMemo(() => imageCache.has(src), [src])
  const [imgLoaded, setImgLoaded] = React.useState(seenBefore)
  const [imgVisible, setImgVisible] = React.useState(false)

  const rootRef = useAppearOnce({
    onAppear: () => {
      setImgVisible(true)
      loadImage()
    }
  })

  const loadImage = React.useCallback(() => {
    if (!seenBefore) {
      const img = new Image()

      img.src = src

      img.onload = () => {
        imageCache.set(src, img)

        setImgLoaded(true)
      }

      // TODO: handle `onerror`
    }
  }, [src, seenBefore])

  const child = React.Children.only(props.children)

  const commonProps = {
    className: `${child.props.className || ''} lazy-img`
  }

  const imgData = imageCache.get(src)

  const imageIsReady = (imgVisible || critical) && imgLoaded

  const clone = React.cloneElement(child, {
    ...(imageIsReady
      ? {
          style: {
            ...child.props.style,
            height: imgData.height / 3,
            width: imgData.width / 3,
            opacity: imgLoaded ? 1 : 0,
            backgroundImage: `url(${imgData.src})`
          },
          ...commonProps
        }
      : commonProps)
  })

  if (critical) loadImage()

  return (
    <div className="lazy-img-wrapper" ref={rootRef}>
      {placeholderUi || <DefaultPlaceholder imageIsReady={imageIsReady} />}
      {clone}
    </div>
  )
}

export { BackgroundImage }
