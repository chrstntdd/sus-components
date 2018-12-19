import * as React from 'react'
import { createRoot } from 'react-dom'

import { Dropout, DropoutInput, DropoutList, DropoutOption } from '../dist'

if (module.hot) {
  module.hot.accept(() => {
    window.location.reload()
  })
}

const useToggle = (initial: boolean) => {
  const [on, setOn] = React.useState(initial)

  const toggle = React.useCallback(
    () => {
      setOn(!on)
    },
    [on]
  )

  return [on, toggle]
}

const App = () => {
  const [on, toggle] = useToggle(false)

  const app = (
    <div>
      <Dropout>
        <DropoutInput className="input" />

        <DropoutList>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((el, i) => {
            return (
              <DropoutOption key={el}>
                <div>hey lol</div>
              </DropoutOption>
            )
          })}
        </DropoutList>
      </Dropout>
    </div>
  )

  try {
    return (
      <React.Fragment>
        <button type="button" onClick={toggle}>
          Toggle app mount
        </button>
        {on ? app : null}
      </React.Fragment>
    )
  } catch (error) {
    console.log({ error })
  }
}

createRoot(document.getElementById('root')).render(<App />)
