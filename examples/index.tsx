import * as React from 'react'
import { createRoot } from 'react-dom'

import { Dropout, DropoutInput, DropoutList, DropoutOption, SusImage } from '../lib'

const remoteImageAssets = [
  'https://images.unsplash.com/photo-1545271428-47057449c00c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1867&q=80',
  'https://images.unsplash.com/photo-1543363950-d1d51b4eca60?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1545239403-734e488cad95?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
  'https://images.unsplash.com/photo-1545285102-6ea82ec3b9b1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1867&q=80',
  'https://images.unsplash.com/photo-1545199143-c6f9256ec576?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2389&q=80',
  'https://images.unsplash.com/photo-1545253088-55b119d82e83?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=934&q=80',
  'https://images.unsplash.com/photo-1545273920-c6a376292092?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1868&q=80',
  'https://images.unsplash.com/photo-1545256968-9b87acc4e9de?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=934&q=80'
]

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

        <div className="image-container">
          {remoteImageAssets.map((src, i) => {
            return (
              <SusImage type={ImageEnum.BackgroundImage} key={src} src={src}>
                <div />
              </SusImage>
            )
          })}
        </div>

        {on ? app : null}
      </React.Fragment>
    )
  } catch (error) {
    console.log({ error })
  }
}

createRoot(document.getElementById('root')).render(<App />)
