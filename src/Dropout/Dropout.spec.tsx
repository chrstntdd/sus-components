import react from 'react'

import { render, fireEvent } from 'react-testing-library'

import { Dropout, DropoutInput, DropoutList, DropoutOption } from '.'

jest.mock('@/Portal', () => ({
  Portal: ({ children }) => <div>{children}</div>
}))

const setup = (itemCount: number) => (
  <Dropout>
    <DropoutInput className="input" data-testid="DropoutInput" />

    <DropoutList>
      {[...new Array(itemCount).keys()].map(el => (
        <DropoutOption data-testid={`option-${el}`} key={el} value={el.toString()}>
          {el}
        </DropoutOption>
      ))}
    </DropoutList>
  </Dropout>
)

const initialView = `
<div>
  <input
    aria-autocomplete="list"
    aria-label="TODO"
    class="input"
    data-testid="DropoutInput"
    value=""
  />
  <div />
</div>
`

describe('Dropout Component', () => {
  it('should render something', () => {
    const { container } = render(setup(5))

    expect(container).toMatchInlineSnapshot(initialView)
  })

  describe('keyboard navigation', () => {
    it('should **ONLY** open the dropdown, but not select an item on the first ArrowDown', () => {
      const { getByTestId } = render(setup(5))

      const input = getByTestId('DropoutInput')

      fireEvent.focus(input)
      fireEvent.keyDown(input, { key: 'ArrowDown' })

      // \\
      ;[0, 1, 2, 3, 4].forEach(i => {
        expect(getByTestId(`option-${i}`)).toBeInTheDocument()
      })
    })

    test.todo('should loop through the items when during repeated ArrowDowns')

    test.todo('should loop through the items when during repeated ArrowUps')

    test.todo('should return focus back to the input after the last item in the dropdown')

    test.todo(
      'should return focus back to the input and hide the dropdown items when the escape key is pressed'
    )
  })
})
