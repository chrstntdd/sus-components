import React from 'react'

import { render, fireEvent } from 'react-testing-library'

import { Dropout, DropoutInput, DropoutList, DropoutOption, resetIdCounter } from '.'

jest.mock('@/Portal', () => ({
  Portal: ({ children }) => <div>{children}</div>
}))

const makeArr = (n: number) => [...new Array(n).keys()]

const setup = (itemCount: number, inputProps = {}) => (
  <Dropout>
    <DropoutInput className="input" data-testid="DropoutInput" {...inputProps} />

    <DropoutList>
      {makeArr(itemCount).map(el => {
        const id = `option-${el}`
        return (
          <DropoutOption data-testid={id} key={el} value={id}>
            <span>{el}</span>
          </DropoutOption>
        )
      })}
    </DropoutList>
  </Dropout>
)

const initialView = `
<div
  aria-expanded="false"
  aria-haspopup="listbox"
  role="combobox"
>
  <input
    aria-autocomplete="list"
    aria-multiline="false"
    class="input"
    data-testid="DropoutInput"
    role="textbox"
    value=""
  />
  <div />
</div>
`

describe('Dropout Component', () => {
  afterEach(resetIdCounter)

  it('should render something', () => {
    const { container } = render(setup(5))

    expect(container.firstChild).toMatchInlineSnapshot(initialView)
  })

  describe('keyboard interactions', () => {
    it('should **ONLY** open the dropdown, but not select an item on the first ArrowDown', () => {
      const { getByTestId } = render(setup(5))

      const input = getByTestId('DropoutInput')

      fireEvent.focus(input)
      fireEvent.keyDown(input, { key: 'ArrowDown' })

      // \\
      makeArr(5).forEach(i => {
        expect(getByTestId(`option-${i}`)).toBeInTheDocument()
      })
    })

    it('should loop through the items when during repeated ArrowDowns', () => {
      const { getByTestId } = render(setup(5))

      const input = getByTestId('DropoutInput')

      fireEvent.focus(input)
      fireEvent.keyDown(input, { key: 'ArrowDown' })

      // \\
      makeArr(5).forEach(i => {
        expect(getByTestId(`option-${i}`)).toBeInTheDocument()
      })

      // Arrow down to the last item
      makeArr(5).forEach(i => {
        fireEvent.keyDown(input, { key: 'ArrowDown' })
      })
      expect(getByTestId(`option-4`)).toHaveAttribute('aria-selected', 'true')

      // Loop back to the input, if there is one, don't select the first item
      fireEvent.keyDown(input, { key: 'ArrowDown' })
      expect(getByTestId(`option-0`)).not.toHaveAttribute('aria-selected', 'true')

      fireEvent.keyDown(input, { key: 'ArrowDown' })
      expect(getByTestId(`option-0`)).toHaveAttribute('aria-selected', 'true')
    })

    it('should loop through the items when during repeated ArrowUps', () => {
      const { getByTestId } = render(setup(5))

      const input = getByTestId('DropoutInput')

      fireEvent.focus(input)
      // Open the dropdown, don't select anything
      fireEvent.keyDown(input, { key: 'ArrowUp' })

      // \\
      makeArr(5).forEach(i => {
        expect(getByTestId(`option-${i}`)).toBeInTheDocument()
      })

      // Arrow up to the last item
      fireEvent.keyDown(input, { key: 'ArrowUp' })

      expect(getByTestId(`option-4`)).toHaveAttribute('aria-selected', 'true')

      // // Loop back to the input, if there is one
      makeArr(5).forEach(i => {
        fireEvent.keyDown(input, { key: 'ArrowUp' })
      })
      expect(getByTestId(`option-0`)).not.toHaveAttribute('aria-selected', 'true')
    })

    it('should hide the dropdown items when the escape key is pressed', () => {
      const { getByTestId, queryByTestId } = render(setup(5))

      const input = getByTestId('DropoutInput')

      fireEvent.focus(input)
      fireEvent.keyDown(input, { key: 'ArrowDown' })

      // \\
      makeArr(5).forEach(i => {
        expect(getByTestId(`option-${i}`)).toBeInTheDocument()
      })

      fireEvent.keyDown(input, { key: 'Escape' })

      makeArr(5).forEach(i => {
        expect(queryByTestId(`option-${i}`)).not.toBeInTheDocument()
      })
    })

    it('should select the active item in the dropdown when the Enter key is pressed', () => {
      const { getByTestId, queryByTestId, getByValue } = render(setup(5))

      const input = getByTestId('DropoutInput')

      fireEvent.focus(input)
      fireEvent.keyDown(input, { key: 'ArrowDown' })

      // \\
      makeArr(5).forEach(i => {
        expect(getByTestId(`option-${i}`)).toBeInTheDocument()
      })

      // Select first item
      fireEvent.keyDown(input, { key: 'ArrowDown' })
      fireEvent.keyDown(input, { key: 'Enter' })

      makeArr(5).forEach(i => {
        expect(queryByTestId(`option-${i}`)).not.toBeInTheDocument()
      })

      expect(getByValue('option-0')).toBeInTheDocument()
    })
  })

  describe('pointer interactions', () => {
    const selectItem = node => {
      fireEvent.mouseDown(node)
      fireEvent.click(node)
    }

    it('should set the input value to the selected item in the dropdown', () => {
      const { getByTestId, getByValue, queryByTestId } = render(setup(5))

      const input = getByTestId('DropoutInput')

      fireEvent.focus(input)
      fireEvent.keyDown(input, { key: 'ArrowDown' })

      selectItem(getByTestId('option-0'))

      expect(getByValue('option-0')).toBeInTheDocument()
    })

    it('should collapse the input when an item is selected', () => {
      const { getByTestId, getByValue, queryByTestId } = render(setup(5))

      const input = getByTestId('DropoutInput')

      fireEvent.focus(input)
      fireEvent.keyDown(input, { key: 'ArrowDown' })

      makeArr(5).forEach(i => {
        expect(getByTestId(`option-${i}`)).toBeInTheDocument()
      })

      selectItem(getByTestId('option-0'))

      expect(getByValue('option-0')).toBeInTheDocument()
      makeArr(5).forEach(i => {
        expect(queryByTestId(`option-${i}`)).not.toBeInTheDocument()
      })
    })

    it('should collapse the input a mouse up event happens outside of the list', () => {
      const { getByTestId, queryByTestId } = render(setup(5))

      const input = getByTestId('DropoutInput')

      fireEvent.focus(input)
      fireEvent.keyDown(input, { key: 'ArrowDown' })

      makeArr(5).forEach(i => {
        expect(getByTestId(`option-${i}`)).toBeInTheDocument()
      })

      fireEvent.mouseUp(document.body)

      makeArr(5).forEach(i => {
        expect(queryByTestId(`option-${i}`)).not.toBeInTheDocument()
      })
    })

    it('should keep the dropdown open when clicking on the input', () => {
      const { getByTestId } = render(setup(5))

      const input = getByTestId('DropoutInput')

      fireEvent.focus(input)
      fireEvent.keyDown(input, { key: 'ArrowDown' })
      makeArr(5).forEach(i => {
        expect(getByTestId(`option-${i}`)).toBeInTheDocument()
      })
      fireEvent.click(input)
      makeArr(5).forEach(i => {
        expect(getByTestId(`option-${i}`)).toBeInTheDocument()
      })
    })
  })

  describe('DropoutInput', () => {
    it('should have a functioning input', () => {
      const { getByTestId, getByValue } = render(setup(5))

      const input = getByTestId('DropoutInput')

      fireEvent.focus(input)
      fireEvent.change(input, { target: { value: 'test string' } })

      // \\
      makeArr(5).forEach(i => {
        expect(getByTestId(`option-${i}`)).toBeInTheDocument()
      })

      expect(getByValue('test string')).toBeInTheDocument()
    })

    it('should update the input value with the value of the item navigated to with the keyboard', () => {
      const { getByTestId, getByValue } = render(setup(5))

      const input = getByTestId('DropoutInput')

      fireEvent.focus(input)
      fireEvent.change(input, { target: { value: 'test string' } })

      // Dropdown it open, select the first item
      fireEvent.keyDown(input, { key: 'ArrowDown' })

      expect(getByValue('option-0')).toBeInTheDocument()
    })

    it('should clear the items in the dropdown when the input value is empty ("")', () => {
      const { getByTestId, getByValue, queryByValue } = render(setup(5))

      const input = getByTestId('DropoutInput')

      fireEvent.focus(input)
      fireEvent.change(input, { target: { value: 'test string' } })

      // \\
      makeArr(5).forEach(i => {
        expect(getByTestId(`option-${i}`)).toBeInTheDocument()
      })

      expect(getByValue('test string')).toBeInTheDocument()
      fireEvent.change(input, { target: { value: '' } })
      expect(queryByValue('test string')).not.toBeInTheDocument()
    })

    it('should close the dropdown when the input is blurred', () => {
      const { getByTestId, queryByTestId } = render(setup(5))

      const input = getByTestId('DropoutInput')

      fireEvent.focus(input)

      fireEvent.keyDown(input, { key: 'ArrowDown' })
      fireEvent.keyDown(input, { key: 'ArrowDown' })

      // \\
      makeArr(5).forEach(i => {
        expect(getByTestId(`option-${i}`)).toBeInTheDocument()
      })

      fireEvent.blur(input)

      makeArr(5).forEach(i => {
        expect(queryByTestId(`option-${i}`)).not.toBeInTheDocument()
      })
    })
  })

  it('should have role="option" set on each item in the list', () => {
    const { getByTestId } = render(setup(5))

    const input = getByTestId('DropoutInput')

    fireEvent.focus(input)

    fireEvent.keyDown(input, { key: 'ArrowDown' })
    fireEvent.keyDown(input, { key: 'ArrowDown' })

    // \\
    makeArr(5).forEach(i => {
      expect(getByTestId(`option-${i}`)).toHaveAttribute('role', 'option')
    })
  })

  it('should set the aria-activedescendant attribute on the input to the id of the active item', () => {
    const { getByTestId } = render(setup(5))

    const input = getByTestId('DropoutInput')

    fireEvent.focus(input)
    fireEvent.keyDown(input, { key: 'ArrowDown' })

    fireEvent.keyDown(input, { key: 'ArrowDown' })
    expect(getByTestId(`DropoutInput`)).toHaveAttribute('aria-activedescendant', 'dropout-0-item-0')

    fireEvent.keyDown(input, { key: 'ArrowDown' })
    expect(getByTestId(`DropoutInput`)).toHaveAttribute('aria-activedescendant', 'dropout-0-item-1')

    fireEvent.keyDown(input, { key: 'ArrowUp' })
    fireEvent.keyDown(input, { key: 'ArrowUp' })
    expect(getByTestId(`DropoutInput`)).not.toHaveAttribute('aria-activedescendant')
  })

  it('should set the aria-controls attribute on the input to the id of the menu container when the items are visible', () => {
    const { getByTestId } = render(setup(5))

    const input = getByTestId('DropoutInput')

    fireEvent.focus(input)
    fireEvent.keyDown(input, { key: 'ArrowDown' })

    expect(getByTestId(`DropoutInput`)).toHaveAttribute('aria-controls', 'dropout-0-menu')
  })

  test.todo(
    'should allow the control of the active item when navigating through to support dividers'
  )
})
