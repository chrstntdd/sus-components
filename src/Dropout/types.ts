type FiniteDropoutStates = 'initial' | 'idle' | 'suggesting' | 'navigating' | 'selectingWithClick'

type DropoutAction =
  | { type: 'CLOSE' }
  | { type: 'CLEAR' }
  | { type: 'RESIZE'; value: DOMRect | ClientRect }
  | { type: 'MOUSE_DOWN' }
  | { type: 'SELECT_WITH_KEYBOARD' }
  | { type: 'CHANGE'; value: string }
  | { type: 'NAVIGATE'; value: string }
  | { type: 'SELECT_WITH_CLICK'; value: string }

interface DropoutState {
  rect: ClientRect | DOMRect
  optionsRef: React.MutableRefObject<any[]>
  finiteState: FiniteDropoutStates
  menuId: React.MutableRefObject<string>
  inputId: string
  getItemId: React.MutableRefObject<(index: number) => string>
  menuRef: React.MutableRefObject<HTMLUListElement>
  inputRef: React.MutableRefObject<HTMLInputElement>
  /* the value that the user has typed */
  value: string
  /* the value the user has navigated to with the keyboard */
  navigationValue: null | string
  dispatch: (action: DropoutAction) => void
}

type ImplicitContext = Pick<DropoutState, 'navigationValue' | 'dispatch' | 'menuRef'> & {
  contextValue: string
}
