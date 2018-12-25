import * as React from 'react'

import { Reveal } from './Reveal'

const imageCache = new Map()

/**
 * @description
 * Since enums emit so much extra code, this approach
 * lets us save bytes and maintain a similar level of
 * type safety
 *
 * ~ after minification ~
 * enum -> 134 B
 * object -> 50 B
 *
 * @see https://xem.github.io/terser-online/
 */
const ImageType: ImageTypeMap = {
  NativeImageTag: 0,
  BackgroundImage: 1
}

type ImageTypeMap = {
  readonly NativeImageTag: 0
  readonly BackgroundImage: 1
}

type ImageUnion = ImageTypeMap['NativeImageTag'] | ImageTypeMap['BackgroundImage']

/**
 * @description
 * Props shared between all image variants.
 *
 * Users **MUST** explicitly provide a `type` and `src`
 *
 * @todo Support `string[]` type as src for NativeImages
 * @todo Add prop for placeholder ui while image is loading
 */
type CommonImageProps = {
  src: string
  type: ImageUnion
  critical?: boolean
  onError?: (e: any) => void
  onLoad?: (a: any) => void
}

/**
 * @description
 * For native `<img />` tags and such.
 *
 * @todo
 * Support `<picture />` tag as well
 */
type NativeImageProps = CommonImageProps & HTMLImageElement

/**
 * @description
 * For background images. The child element will
 * have the `backgroundImage: url()` cloned onto
 * its style prop
 */
type BackgroundImageProps = CommonImageProps & {
  children: React.ReactElement<any>
}

const lazyImageReducer = (state, action) => {
  switch (action.type) {
    case 'LOADED':
      return {
        ...state,
        imgLoaded: true,
        imageData: action.data
      }

    case 'REAPPEAR':
    case 'VISIBLE':
      return {
        ...state,
        imgVisible: true
      }

    case 'ERROR':
      return {
        ...state,
        imgLoaded: false
      }

    default:
      return state
  }
}

/**
 * @description
 * Main `<Image />` component to handle all cases.
 */
const SusImage = ({ src, type, critical, ...props }: NativeImageProps | BackgroundImageProps) => {
  const seenBefore = React.useMemo(() => imageCache.has(src), [src])

  const [state, dispatch] = React.useReducer(lazyImageReducer, {
    seenBefore,
    imageData: null,
    imgLoaded: seenBefore,
    imgVisible: false
  })

  const imageOnLoad = React.useCallback(
    img => () => {
      imageCache.set(src, src)

      dispatch({ type: 'LOADED', data: img })
    },
    [src]
  )

  const imageOnError = React.useCallback(() => {
    dispatch({ type: 'ERROR' })
  }, [])

  const loadImage = React.useCallback(
    () => {
      const img = new Image()

      img.src = src

      img.onload = imageOnLoad(img)

      img.onerror = imageOnError
    },
    [src]
  )

  const handleImageVisible = React.useCallback(
    () => {
      dispatch({ type: 'VISIBLE' })

      if (state.seenBefore) dispatch({ type: 'REAPPEAR' })
      else type === ImageType.BackgroundImage && loadImage()
    },
    [state.seenBefore, src]
  )

  switch (type) {
    case ImageType.BackgroundImage: {
      const child = React.Children.only(props.children)

      const commonProps = {
        className: `${child.props.className || ''} lazy-img`
      }

      const clone = React.cloneElement(child, {
        ...((state.imgVisible || critical) && state.imgLoaded
          ? {
              style: {
                ...child.props.style,
                height: state.imageData.height / 3,
                width: state.imageData.width / 3,
                opacity: state.imgLoaded ? 1 : 0,
                backgroundImage: `url(${imageCache.get(src)})`
              },
              ...commonProps
            }
          : commonProps)
      })

      const el = (
        <div>
          <div className="placeholder" />
          {clone}
        </div>
      )

      if (critical) {
        if (!state.imgLoaded) loadImage()

        return el
      } else {
        return (
          <Reveal once onReveal={handleImageVisible}>
            {el}
          </Reveal>
        )
      }
    }

    case ImageType.NativeImageTag:
      return (
        <Reveal once onReveal={handleImageVisible}>
          <div>
            {(state.imgVisible || critical) && (
              <img
                className="lazy-img"
                style={{
                  opacity: state.imgLoaded ? 1 : 0,
                  ...(state.imgLoaded && {
                    height: state.imageData.height / 2,
                    width: state.imageData.width / 2
                  })
                }}
                src={src}
                onLoad={l => imageOnLoad(l.currentTarget)()}
                onError={imageOnError}
              />
            )}
          </div>
        </Reveal>
      )
  }
}

export { SusImage, ImageType }
