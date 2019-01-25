import * as React from 'react'

import { useAppearOnce } from './hooks'

const imageCache = {}

const DefaultPlaceholder = ({ imageIsReady }) => (
  <div className={`default-placeholder ${!imageIsReady ? 'flicker' : 'fadeIn'}`} />
)

interface BackgroundImageProps {
  src: string
  placeholderUi?: React.ReactElement<any>
  critical?: boolean
  onError?: (e: any) => void
  onLoad?: (i: any) => void
  children: React.ReactElement<any>
}

function BackgroundImage({ src, critical, placeholderUi, ...props }: BackgroundImageProps) {
  const [imgLoaded, setImgLoaded] = React.useState(() => !!imageCache[src])
  const [imgVisible, setImgVisible] = React.useState(false)

  const rootRef = useAppearOnce(() => {
    if (!critical || !imgLoaded) {
      loadImage()
      setImgVisible(true)
    }
  })

  const loadImage = () => {
    if (!imgLoaded) {
      const img = new Image()
      img.src = src
      img.onload = () => {
        setImgLoaded(true)
        imageCache[src] = img
      }
    }
  }

  const child = React.Children.only(props.children)

  const commonProps = {
    className: `${child.props.className || ''} lazy-img`
  }

  const imgData = imageCache[src]

  const imageIsReady = (critical || imgVisible) && imgLoaded

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
