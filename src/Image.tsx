import * as React from 'react'

import { Reveal } from './Reveal'

const imageCache = new Map()

const useImage = (src: string, onLoad?, onError?) => {
  // generate id for key, value is intended url or eventual fallback url
  const alreadyLoaded = imageCache.has(src)

  if (alreadyLoaded) return

  const imageResource = new Image()

  imageResource.src = src

  imageResource.onload = () => {
    onLoad && onLoad([imageResource.height, imageResource.width])

    imageCache.set(src, src)
  }

  imageResource.onerror = () => {
    onError && onError()
  }
}

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
  type: ImageTypeMap['NativeImageTag'] | ImageTypeMap['BackgroundImage']
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
        imgLoaded: true
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
const SusImage = ({ src, type, ...props }: NativeImageProps | BackgroundImageProps) => {
  const seenBefore = React.useMemo(() => imageCache.has(src), [src])

  const [state, dispatch] = React.useReducer(lazyImageReducer, {
    seenBefore,
    imgLoaded: seenBefore,
    imgVisible: false
  })

  const handleImageVisible = React.useCallback(
    () => {
      dispatch({ type: 'VISIBLE' })

      if (state.seenBefore) {
        dispatch({ type: 'REAPPEAR' })
      } else {
        const img = new Image()

        img.src = src

        img.onload = () => {
          imageCache.set(src, src)

          dispatch({ type: 'LOADED' })
        }

        img.onerror = () => {
          dispatch({ type: 'ERROR' })
        }
      }
    },
    [state.seenBefore, src]
  )

  switch (type) {
    case ImageType.BackgroundImage: {
      const child = React.Children.only(props.children)

      const commonProps = {
        className: `${child.props.className} lazy-img`
      }

      const clone = React.cloneElement(child, {
        ...(state.imgVisible && state.imgLoaded
          ? {
              style: {
                ...child.props.style,
                minHeight: '200px',
                minWidth: '300px',
                backgroundImage: `url(${imageCache.get(src)})`
              },
              ...commonProps
            }
          : commonProps)
      })

      return (
        <Reveal once={true} onReveal={handleImageVisible}>
          <div style={{ height: '100%', width: '100%' }}>
            <div className="placeholder" />
            {clone}
          </div>
        </Reveal>
      )
    }

    case ImageType.NativeImageTag:
      return null
  }
}

export { SusImage, ImageType }
