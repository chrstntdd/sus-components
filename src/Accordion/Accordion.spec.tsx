import React from 'react'

import { render } from 'react-testing-library'

import { Accordion, Fold } from '.'

const setup = () => {
  return (
    <Accordion>
      <div className="menu-item">no items</div>

      <Fold label="a" id="a" sectionId="a">
        <div>A</div>
      </Fold>

      <div>Another thing with no items</div>

      <Fold label="b" id="b" sectionId="b">
        <div>B</div>
      </Fold>
    </Accordion>
  )
}

describe('Accordion component', () => {
  it('should render something', () => {
    const { container } = render(setup())

    expect(container.firstChild).toMatchInlineSnapshot(`
<div
  class="accordion"
  role="tablist"
>
  <div
    class="menu-item"
  >
    no items
  </div>
  <div
    aria-controls="a"
    class="fold"
    id="a"
    role="tab"
    tabindex="0"
  >
    a
  </div>
  <div
    aria-hidden="true"
    aria-labelledby="a"
    id="a"
    role="tabpanel"
    tabindex="0"
  >
    <div>
      A
    </div>
  </div>
  <div>
    Another thing with no items
  </div>
  <div
    aria-controls="b"
    class="fold"
    id="b"
    role="tab"
    tabindex="0"
  >
    b
  </div>
  <div
    aria-hidden="true"
    aria-labelledby="b"
    id="b"
    role="tabpanel"
    tabindex="0"
  >
    <div>
      B
    </div>
  </div>
</div>
`)
  })
  test.todo('should b')
  test.todo('should c')
})
