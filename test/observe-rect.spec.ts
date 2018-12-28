import 'jest-dom/extend-expect'

import observeRect from '../src/observe-rect'

const setup = () => {
  const el = document.createElement('div')
  const cb = jest.fn()

  const listener = observeRect(el, cb)

  return { listener, el, cb }
}

describe('observeRect', () => {
  const mockGetBoundingClientRectVal = {
    width: 120,
    height: 120,
    top: 1,
    left: 2,
    bottom: 3,
    right: 4
  }

  beforeEach(() => {
    Element.prototype.getBoundingClientRect = jest.fn(() => mockGetBoundingClientRectVal)
  })

  it('should work', () => {
    const { cb, listener } = setup()

    expect(cb).not.toBeCalled()

    listener.observe()

    expect(cb).toBeCalled()
    expect(cb).toBeCalledWith(expect.objectContaining(mockGetBoundingClientRectVal))
  })
})
