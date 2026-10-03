import { useRef, useState } from 'react'
import { exportJson, parseImport } from '../lib/storage'
import { useApp } from '../state/store'

export function Settings() {
  const { store, settings, setSettings, replace, reset } = useApp()
  const file = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState('')

  const doExport = () => {
    const blob = new Blob([exportJson(store)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `number-keys-progress-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }
  const doImport = async (f?: File) => {
    if (!f) return
    const s = parseImport(await f.text())
    if (!s) return setMsg('That file is not a valid progress export.')
    if (confirm('Replace current progress with the imported file?')) { replace(s); setMsg('Imported.') }
  }

  return (
    <div className="screen">
      <h1>Settings</h1>
      <label className="setting"><span>Sound</span>
        <input type="checkbox" checked={!settings.muted} onChange={(e) => setSettings({ muted: !e.target.checked })} /></label>
      <label className="setting"><span>F# instead of Gb<small>Shows Gb major as F# major</small></span>
        <input type="checkbox" checked={settings.sharpGb} onChange={(e) => setSettings({ sharpGb: e.target.checked })} /></label>
      <label className="setting"><span>Theme</span>
        <select value={settings.theme} onChange={(e) => setSettings({ theme: e.target.value as never })}>
          <option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option>
        </select></label>
      <h3>Your data</h3>
      <div className="row">
        <button className="btn" onClick={doExport}>Export JSON</button>
        <button className="btn" onClick={() => file.current?.click()}>Import JSON</button>
        <input ref={file} type="file" accept="application/json" hidden onChange={(e) => { void doImport(e.target.files?.[0]); e.target.value = '' }} />
      </div>
      <button className="btn bad wide" onClick={() => confirm('Erase all progress? This cannot be undone.') && (reset(), setMsg('Progress reset.'))}>Reset progress</button>
      {msg && <p className="muted">{msg}</p>}
    </div>
  )
}
