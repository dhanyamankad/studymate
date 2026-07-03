import { useState } from 'react'
import GlowOrb from './GlowOrb'

export default function InputBar({ onSubmit, thinking = false, webSearchEnabled, onToggleWebSearch }) {
  const [value, setValue] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!value.trim()) return
    onSubmit?.(value.trim())
    setValue('')
  }

  return (
    <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-surface to-transparent pt-12">
      <div className="max-w-[800px] mx-auto relative">
        <GlowOrb
          mode={thinking ? 'thinking' : 'idle'}
          className="absolute -top-16 left-1/2 -translate-x-1/2 w-20 h-20"
        />

        <form
          onSubmit={handleSubmit}
          className="flex items-end gap-6 bg-surface-container/80 backdrop-blur-md p-6 rounded-xl border border-outline-variant/10"
        >
          <div className="flex-1 ink-bleed-focus group">
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full bg-transparent border-none focus:ring-0 focus:outline-none italic text-primary placeholder:text-on-surface-variant/40 font-body-lg text-body-lg py-1"
              placeholder="Ask me anything about your notes..."
              type="text"
            />
            <div className="h-ink-line-height w-full bg-outline-variant/20 relative mt-1">
              <div className="ink-line absolute top-0 left-1/2 -translate-x-1/2 h-full w-0 bg-primary-container" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="font-label-mono text-[10px] text-on-surface-variant mb-1">
                REACH BEYOND
              </span>
              <label className="analog-switch relative inline-block w-10 h-5 cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={webSearchEnabled}
                  onChange={(e) => onToggleWebSearch?.(e.target.checked)}
                />
                <span className="slider absolute cursor-pointer inset-0 bg-surface-variant peer-checked:bg-primary-container transition-all duration-300 rounded-full before:content-[''] before:absolute before:h-3 before:w-3 before:left-1 before:bottom-1 before:bg-on-surface-variant before:peer-checked:bg-surface before:peer-checked:translate-x-[18px] before:transition-all before:duration-300 before:rounded-full" />
              </label>
            </div>
            <button
              type="submit"
              className="bg-primary-container text-on-primary-container p-3 rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg"
              aria-label="Send question"
            >
              <span className="material-symbols-outlined">send</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
