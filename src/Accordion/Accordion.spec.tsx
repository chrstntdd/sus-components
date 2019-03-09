import React from 'react'
import 'jest-dom/extend-expect'

import { render, fireEvent } from 'react-testing-library'

import { Accordion, Fold } from '.'

const setup = () => {
  return (
    <Accordion>
      <Fold label="Label A" id="a" sectionId="a">
        <div>Content A</div>
      </Fold>

      <Fold label="Label B" id="b" sectionId="b">
        <div>Content B</div>
      </Fold>
    </Accordion>
  )
}

describe('Accordion component', () => {
  it('should render something', () => {
    const { container } = render(setup())

    expect(container.firstChild).toBeDefined()
  })

  it('should toggle the visibility of the content when the tab is focused and the Spacebar is pressed', () => {
    const { container } = render(setup())

    const firstTab = container.querySelector('[role="tab"]')

    fireEvent.focus(firstTab)
    expect(container.querySelector('[role="tabpanel"')).toHaveAttribute('aria-hidden', 'true')
    fireEvent.keyDown(firstTab, { keyCode: 32 })
    expect(container.querySelector('[role="tabpanel"')).toHaveAttribute('aria-hidden', 'false')
    fireEvent.keyDown(firstTab, { keyCode: 32 })
    expect(container.querySelector('[role="tabpanel"')).toHaveAttribute('aria-hidden', 'true')
  })

  it('should toggle the visibility of the content when the tab is focused and the Enter key is pressed', () => {
    const { container } = render(setup())

    const firstTab = container.querySelector('[role="tab"]')

    fireEvent.focus(firstTab)
    expect(container.querySelector('[role="tabpanel"')).toHaveAttribute('aria-hidden', 'true')
    fireEvent.keyDown(firstTab, { keyCode: 13 })
    expect(container.querySelector('[role="tabpanel"')).toHaveAttribute('aria-hidden', 'false')
    fireEvent.keyDown(firstTab, { keyCode: 13 })
    expect(container.querySelector('[role="tabpanel"')).toHaveAttribute('aria-hidden', 'true')
  })

  it('should noop on keys other than " " and Enter', () => {
    const { container } = render(setup())

    const firstTab = container.querySelector('[role="tab"]')

    fireEvent.focus(firstTab)
    expect(container.querySelector('[role="tabpanel"')).toHaveAttribute('aria-hidden', 'true')
    for (let index = 0; index < 255; index++) {
      if (index !== 32 && index !== 13) {
        fireEvent.keyDown(firstTab, { keyCode: index })
      }
    }
    expect(container.querySelector('[role="tabpanel"')).toHaveAttribute('aria-hidden', 'true')
  })

  it('should toggle the visibility of the content when the tab when clicked', () => {
    const { container } = render(setup())

    const firstTab = container.querySelector('[role="tab"]')

    expect(container.querySelector('[role="tabpanel"')).toHaveAttribute('aria-hidden', 'true')
    fireEvent.click(firstTab)
    expect(container.querySelector('[role="tabpanel"')).toHaveAttribute('aria-hidden', 'false')
    fireEvent.click(firstTab)
    expect(container.querySelector('[role="tabpanel"')).toHaveAttribute('aria-hidden', 'true')
  })
})
