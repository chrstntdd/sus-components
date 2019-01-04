import * as React from 'react'
import reactDom from 'react-dom'
import { Router, Link } from '@chrstntdd/router'

import {
  Dropout,
  DropoutInput,
  DropoutList,
  DropoutOption,
  BackgroundImage,
  SusImage,
  useToggle
} from '../lib'

const rando = () =>
  Math.random()
    .toString(32)
    .substr(2, 6)

const shuffle = (a: any[]) => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const loadScript = src => {
  const script = document.createElement('script')
  script.src = src
  document.body.appendChild(script)
}

if (!('IntersectionObserver' in window)) {
  loadScript('https://unpkg.com/intersection-observer@0.5.1/intersection-observer')
}

const remoteImageAssets = [
  'https://images.unsplash.com/photo-1545271428-47057449c00c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1867&q=80',
  'https://images.unsplash.com/photo-1543363950-d1d51b4eca60?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1545239403-734e488cad95?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
  'https://images.unsplash.com/photo-1545285102-6ea82ec3b9b1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1867&q=80',
  'https://images.unsplash.com/photo-1545199143-c6f9256ec576?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2389&q=80',
  'https://images.unsplash.com/photo-1545253088-55b119d82e83?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=934&q=80',
  'https://images.unsplash.com/photo-1545273920-c6a376292092?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1868&q=80',
  'https://images.unsplash.com/photo-1545256968-9b87acc4e9de?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=934&q=80',
  'https://images.unsplash.com/photo-1545588156-bb90eb5315ba?ixlib=rb-1.2.1&auto=format&fit=crop&w=1951&q=80',
  'https://images.unsplash.com/photo-1545588058-7ef3ae3ebdf5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1950&q=80',
  'https://images.unsplash.com/photo-1545560957-53fff0503982?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1545534384-4826fc941890?ixlib=rb-1.2.1&auto=format&fit=crop&w=934&q=80',
  'https://images.unsplash.com/photo-1545499026-702db711b529?ixlib=rb-1.2.1&auto=format&fit=crop&w=1900&q=80'
]

if (module.hot) {
  module.hot.accept(() => {
    window.location.reload()
  })
}

const Home = () => (
  <div>
    <div className="image-container">
      {shuffle(remoteImageAssets).map((src, i) => (
        <BackgroundImage key={src} src={src} critical={i < 3}>
          <div />
        </BackgroundImage>
        // <SusImage
        //   key={src}
        //   src={src}
        //   critical={i < 3}
        //   style={{
        //     display: 'flex',
        //     margin: '2rem',
        //     minHeight: '600px',
        //     minWidth: '800px'
        //   }}
        // />
      ))}
    </div>
  </div>
)

const PageTwo = () => {
  return (
    <div>
      <Dropout>
        <DropoutInput className="input" />

        <DropoutList>
          {[...new Array(10).keys()].map(el => {
            const val = `hey ${rando()}`
            return (
              <DropoutOption key={el} value={val}>
                {val}
              </DropoutOption>
            )
          })}
        </DropoutList>
      </Dropout>
    </div>
  )
}

const App = () => {
  try {
    return (
      <React.Fragment>
        <nav className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/2">2</Link>
        </nav>
        <Router>
          <Home path="/" />
          <PageTwo path="/2" />
        </Router>
      </React.Fragment>
    )
  } catch (error) {
    console.log({ error })
  }
}

// reactDom.createRoot(document.getElementById('root')).render(<App />)
reactDom.render(<App />, document.getElementById('root'))
