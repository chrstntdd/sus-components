const measureElements = (...elements: React.RefObject<HTMLElement>[]) =>
  elements.map(el => el.current.getBoundingClientRect())

const wrapEvent = (handler, cb) => (event: React.SyntheticEvent) => {
  handler && handler(event)

  if (!event.defaultPrevented) return cb(event)
}

export { wrapEvent, measureElements }
