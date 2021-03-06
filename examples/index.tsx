import * as React from 'react'
import ReactDom from 'react-dom'
import { Router, Link } from '@chrstntdd/router'

import {
  Dropout,
  DropoutInput,
  DropoutList,
  DropoutOption,
  BackgroundImage,
  MatchMedia,
  useMediaQueryList
} from '../lib'

import { randomEmoji } from '../src/random'

import './index.scss'

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
      ))}
    </div>
  </div>
)

function* fibonacci() {
  let fn1 = 0
  let fn2 = 1
  while (true) {
    const current = fn1
    fn1 = fn2
    fn2 = current + fn1
    yield current
  }
}

function* enumerate(it, start?: number) {
  start = start || 0
  for (const x of it) {
    yield [start++, x]
  }
}

const getSomeNums = () => {
  let items = []

  for (const [_, x] of enumerate(fibonacci())) {
    if (x > 10e20) break
    items.push(x)
  }

  return items
}

const DropoutPage = () => {
  let [items, setItems] = React.useState(getSomeNums)
  return (
    <div className="dropout-page">
      <Dropout options={items}>
        <DropoutInput
          className="input"
          selectOnClick={true}
          onChange={_ => {
            setItems(shuffle(getSomeNums()))
          }}
        />

        <DropoutList>
          {items.map((el, i) => {
            const val = `${randomEmoji()}${el}`
            return (
              <DropoutOption key={i} value={val}>
                {val}
              </DropoutOption>
            )
          })}
        </DropoutList>
      </Dropout>
    </div>
  )
}

const prettyPrint = value => JSON.stringify(value, null, 2)

// ! Important to define this object outside of the component
// ! that way it doesn't get re-created on each render of the
// ! consuming component.
const mql = {
  xs: '(max-width: 575.98px)',
  sm: '(min-width: 576px) and (max-width: 767.98px)',
  md: '(min-width: 768px) and (max-width: 991.98px)',
  lg: '(min-width: 992px) and (max-width: 1199.98px)',
  xl: '(min-width: 1200px)'
}

const MatchMediaPage = () => {
  const hook = useMediaQueryList(mql)

  return (
    <div>
      HOOK
      <pre>{prettyPrint(hook)}</pre>
      <hr />
      <MatchMedia queries={mql}>
        {({ xs, sm, md, lg, xl }) => (
          <div>
            RENDER PROP
            <pre>{prettyPrint({ xs, sm, md, lg, xl })}</pre>
          </div>
        )}
      </MatchMedia>
    </div>
  )
}

const App = () => {
  return (
    <React.unstable_ConcurrentMode>
      <React.Fragment>
        <nav className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/dropout">Dropout</Link>
          <Link to="/match-media">Match Media</Link>
        </nav>
        <main>
          <Router>
            <Home path="/" />
            <DropoutPage path="/dropout" />
            <MatchMediaPage path="/match-media" />
          </Router>
        </main>
      </React.Fragment>
    </React.unstable_ConcurrentMode>
  )
}

ReactDom.unstable_createRoot(document.getElementById('root')).render(<App />)
// ReactDom.render(<App />, document.getElementById('root'))
