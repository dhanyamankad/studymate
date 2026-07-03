import { useCallback, useRef, useState } from 'react'

/**
 * UploadZone
 * -----------
 * Real drag-and-drop upload for StudyMate's library. Replaces the 3 hardcoded
 * fake documents in App.jsx with actual user uploads.
 *
 * Matches the app's real icon system (Material Symbols Outlined font, same as
 * DocumentCard.jsx) and real design tokens from tailwind.config.js — no extra
 * dependencies required.
 *
 * Wiring:
 * - onFilesAdded(files: File[]) fires immediately on drop/select with raw
 *   File objects — App.jsx owns turning these into the actual upload request
 *   once the FastAPI /upload endpoint exists.
 */

const ACCEPTED_TYPES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
])

const ACCEPTED_EXT_LABEL = 'PDF, JPG, PNG, WEBP'

function isAccepted(file) {
  return ACCEPTED_TYPES.has(file.type)
}

export default function UploadZone({ onFilesAdded }) {
  const [isDragging, setIsDragging] = useState(false)
  const [rejectionMsg, setRejectionMsg] = useState(null)
  const inputRef = useRef(null)
  const rejectionTimer = useRef(null)

  const flashRejection = useCallback((msg) => {
    setRejectionMsg(msg)
    clearTimeout(rejectionTimer.current)
    rejectionTimer.current = setTimeout(() => setRejectionMsg(null), 3200)
  }, [])

  const handleFiles = useCallback(
    (fileList) => {
      const incoming = Array.from(fileList)
      const accepted = incoming.filter(isAccepted)
      const rejected = incoming.filter((f) => !isAccepted(f))

      if (rejected.length > 0) {
        flashRejection(
          rejected.length === 1
            ? `"${rejected[0].name}" isn't a supported file type.`
            : `${rejected.length} files weren't PDFs or images.`
        )
      }
      if (accepted.length > 0) {
        onFilesAdded(accepted)
      }
    },
    [onFilesAdded, flashRejection]
  )

  const onDrop = useCallback(
    (e) => {
      e.preventDefault()
      setIsDragging(false)
      if (e.dataTransfer?.files?.length) handleFiles(e.dataTransfer.files)
    },
    [handleFiles]
  )

  const onDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const onDragLeave = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const onPick = useCallback(
    (e) => {
      if (e.target.files?.length) handleFiles(e.target.files)
      e.target.value = '' // allow re-selecting the same file later
    },
    [handleFiles]
  )

  return (
    <div className="w-full">
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload lecture notes or photos"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click()
        }}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`group relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-3 py-6 cursor-pointer select-none transition-all duration-300 outline-none focus-visible:ring-1 focus-visible:ring-primary/60 ${
          isDragging
            ? 'border-primary bg-primary/10 scale-[1.01]'
            : 'border-outline-variant/40 hover:border-primary/50 hover:bg-surface-variant/40'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          multiple
          onChange={onPick}
          className="hidden"
        />

        <span
          className={`material-symbols-outlined text-2xl transition-colors ${
            isDragging ? 'text-primary' : 'text-on-surface-variant/60 group-hover:text-primary/80'
          }`}
        >
          upload_file
        </span>

        <p className="font-body-md text-body-md text-on-surface text-center leading-tight">
          {isDragging ? 'Drop it on the desk' : 'Add notes or photos'}
        </p>
        <p className="font-label-mono text-label-mono text-on-surface-variant/50 uppercase tracking-widest">
          {ACCEPTED_EXT_LABEL}
        </p>
      </div>

      {rejectionMsg && (
        <div className="mt-2 flex items-center gap-2 rounded-sm border border-error/30 bg-error-container/20 px-3 py-2">
          <span className="material-symbols-outlined text-error text-sm shrink-0">error</span>
          <span className="font-label-mono text-[10px] text-error leading-snug">{rejectionMsg}</span>
        </div>
      )}
    </div>
  )
}
