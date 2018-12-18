import * as React from "react";

interface Props {
  children: React.ReactElement<any>;
  once?: boolean;
  onReveal: () => void;
  options?: { [key: string]: any };
}

export const Reveal = ({
  children,
  once = false,
  onReveal,
  options = {}
}: Props) => {
  const [seenBefore, setSeenBefore] = React.useState(false);
  const ioRef = React.useRef(null);
  const rootRef = React.useRef(null);

  const cleanup = React.useCallback(() => {
    ioRef.current.unobserve(rootRef.current);

    ioRef.current.disconnect();
  }, []);

  const handleReveal = React.useCallback(
    () => {
      if (!seenBefore) setSeenBefore(true);

      onReveal();

      if (once) cleanup();
    },
    [rootRef, seenBefore]
  );

  const handleIoUpdates = React.useCallback(
    ([entry]) => {
      if (entry.isIntersecting || entry.intersectionRatio > 0) handleReveal();
    },
    [ioRef]
  );

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    ioRef.current = new IntersectionObserver(handleIoUpdates, options);

    ioRef.current.observe(rootRef.current);

    return cleanup;
  }, []);

  const child = React.Children.only(children);

  const clone = React.cloneElement(child, {
    ref: node => {
      rootRef.current = node;
    }
  });

  return clone;
};

interface LazyImageProps {
  alt?: string;
  critical?: boolean;
  onError?: (e: any) => void;
  onLoad?: (a: any) => void;
  src: string | string[];
}

interface LazyBackgroundImageProps {
  critical?: boolean;
  children: React.ReactElement<any>;
  onError?: (e: any) => void;
  onLoad?: (a: any) => void;
  src: string;
}

const imageCache = new Map();

type LazyImageMessage = "LOADED" | "VISIBLE" | "ERROR" | "REAPPEAR";

const lazyImageReducer = (state, action) => {
  switch (action.type) {
    case "LOADED":
      return {
        ...state,
        imgLoaded: true
      };

    case "REAPPEAR":
    case "VISIBLE":
      return {
        ...state,
        imgVisible: true
      };

    case "ERROR":
      return {
        ...state,
        imgLoaded: false
      };

    default:
      return state;
  }
};

export const LazyBackgroundImage = ({
  src,
  children
}: LazyBackgroundImageProps) => {
  const [state, dispatch] = React.useReducer(lazyImageReducer, {
    imgLoaded: false,
    imgVisible: false,
    seenBefore: imageCache.has(src)
  });

  const handleImageVisible = React.useCallback(
    () => {
      dispatch({ type: "VISIBLE" });

      if (state.seenBefore) {
        dispatch({ type: "REAPPEAR" });
      } else {
        const img = new Image();

        img.src = src;

        img.onload = () => {
          imageCache.set(src, src);

          dispatch({ type: "LOADED" });
        };

        img.onerror = () => {
          dispatch({ type: "ERROR" });
        };
      }
    },
    [state.seenBefore, src]
  );

  const child = React.Children.only(children);

  const clone = React.cloneElement(child, {
    ...(state.imgVisible && state.imgLoaded
      ? {
          style: {
            ...child.props.style,
            backgroundImage: `url(${imageCache.get(src)})`
          }
        }
      : {})
  });

  return (
    <Reveal once={true} onReveal={handleImageVisible}>
      <div style={{ height: "100%", width: "100%" }}>
        <div className="placeholder" />
        {clone}
      </div>
    </Reveal>
  );
};
