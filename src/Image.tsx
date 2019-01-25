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
type SusImageProps = {
  src: string
  style?: React.CSSProperties
  placeholderUi?: React.ReactElement<any>
  critical?: boolean
  onError?: (e: any) => void
  onLoad?: (i: any) => void
  children: React.ReactElement<any>
}

/**
 * @description
 * Main `<Image />` component to handle all cases.
 *
 * By default, the wrapping element does not have a height set on it. Without an
 * explicit height, the `onAppear` callback will be fired since the container
 * will be within the viewport while waiting for the image to load. Provide
 * additional styles from the `style` prop.
 */
const SusImage = ({ src, critical, placeholderUi, style }: SusImageProps) => {
  const seenBefore = React.useMemo(() => imageCache.has(src), [src])
  const [imgLoaded, setImgLoaded] = React.useState(seenBefore)
  const [imgVisible, setImgVisible] = React.useState(false)

  const rootRef = useAppearOnce(() => {
    setImgVisible(true)
  })

  const handleImageLoad = React.useCallback(
    event => {
      const img = event.currentTarget
      imageCache.set(src, img)
      setImgLoaded(true)
    },
    [src]
  )

  const imageIsReady = (imgVisible || critical) && imgLoaded

  return (
    <div
      className="sus-img-wrapper"
      ref={rootRef}
      style={{
        position: 'relative',
        ...style
      }}
    >
      {placeholderUi || <DefaultPlaceholder imageIsReady={imageIsReady} />}
      {/* only place the img into the dom when ready to start the load event */}
      {imgVisible && (
        <img
          className="sus-img"
          src={src}
          onLoad={handleImageLoad}
          style={{
            opacity: imgLoaded ? 1 : 0,
            transition: 'opacity 200ms'
          }}
        />
      )}
    </div>
  )
}

export { SusImage }
