import { useState } from 'react'
import { ChordDrill } from './modes/ChordDrill'
import { ChordFlip } from './modes/ChordFlip'
import { SpeedRound } from './modes/SpeedRound'
import { Home } from './screens/Home'
import { Progress } from './screens/Progress'
import { Mode, Session } from './screens/Session'
import { Settings } from './screens/Settings'
import { Study } from './screens/Study'
import { Filter, defaultFilter } from './lib/session'
import { StoreProvider } from './state/store'

type Tab = 'home' | 'study' | 'progress' | 'settings'
const TABS: [Tab, string][] = [['home', 'Practice'], ['study', 'Study'], ['progress', 'Progress'], ['settings', 'Settings']]

function Shell() {
  const [tab, setTab] = useState<Tab>('home')
  const [filter, setFilter] = useState<Filter>(defaultFilter)
  const [mode, setMode] = useState<Mode | null>(null)
  const exit = () => setMode(null)

  // During a session there is no tab bar, so the Study chart can't be opened mid-quiz.
  if (mode) {
    return (
      <main className="app">
        {mode === 'speed' ? <SpeedRound filter={filter} onExit={exit} />
          : mode === 'chordflip' ? <ChordFlip keys={filter.keys} onExit={exit} />
          : mode === 'chords' ? <ChordDrill keys={filter.keys} onExit={exit} />
          : <Session mode={mode} filter={filter} onExit={exit} />}
      </main>
    )
  }
  return (
    <>
      <main className="app">
        {tab === 'home' && <Home onStart={setMode} filter={filter} setFilter={setFilter} />}
        {tab === 'study' && <Study />}
        {tab === 'progress' && <Progress />}
        {tab === 'settings' && <Settings />}
      </main>
      <nav className="tabs">
        {TABS.map(([t, label]) => (
          <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{label}</button>
        ))}
      </nav>
    </>
  )
}

export default function App() {
  return <StoreProvider><Shell /></StoreProvider>
}
