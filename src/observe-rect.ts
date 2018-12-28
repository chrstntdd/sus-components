const props = ['width', 'height', 'top', 'right', 'bottom', 'left']

const rectChanged = (currentRect = {}, prevRect = {}) =>
  props.some(prop => currentRect[prop] !== prevRect[prop])

let rafId

const observedNodes: Map<HTMLElement, State> = new Map()
type Rectangle = ClientRect | DOMRect
type State = { rect: Rectangle; callbacks: any[] }

const run = () => {
  const changedStates = []

  observedNodes.forEach((state: State, node: HTMLElement) => {
    const newRect: Rectangle = node.getBoundingClientRect()

    if (rectChanged(newRect, state.rect)) {
      state.rect = newRect
      changedStates.push(state)
    }
  })

  changedStates.forEach(state => {
    state.callbacks.forEach(listener => listener(state.rect))
  })

  rafId = window.requestAnimationFrame(run)
}

export default (node: HTMLElement, callback: (state: State) => void) => ({
  observe() {
    const wasEmpty = observedNodes.size === 0

    if (observedNodes.has(node)) {
      observedNodes.get(node).callbacks.push(callback)
    } else {
      observedNodes.set(node, {
        rect: undefined,
        callbacks: [callback]
      })
    }

    if (wasEmpty) run()
  },

  unobserve() {
    const state = observedNodes.get(node)

    if (state) {
      // Remove the callback
      const index = state.callbacks.indexOf(callback)
      if (index >= 0) state.callbacks.splice(index, 1)

      // Remove the node reference
      if (!state.callbacks.length) observedNodes.delete(node)

      // Stop the loop
      if (!observedNodes.size) cancelAnimationFrame(rafId)
    }
  }
})
