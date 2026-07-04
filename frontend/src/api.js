/**
 * Real backend client for Vanshi's FastAPI /query and /upload endpoints.
 *
 * Reads the backend base URL from VITE_API_URL (set in .env.local for dev,
 * or as a Netlify environment variable for the deployed site). If that
 * var isn't set, `isBackendConfigured()` returns false and App.jsx should
 * skip straight to the mock — no point attempting a fetch to nowhere.
 *
 * Request/response shapes here match backend/schemas.py exactly (checked
 * against her actual pushed code, not just the top-level README summary):
 *   - POST /query body: { question, session_id, web_search_enabled, document_ids? }
 *   - POST /query response: { answer, citations, reasoningSteps, insufficient }
 *     -> insufficient: true is the explicit "couldn't find an answer" signal,
 *        NOT an empty citations array or a null response. This is different
 *        from the mock's convention (mock returns JS `null`), so queryBackend
 *        translates insufficient:true -> null here to keep App.jsx's existing
 *        "null means show EmptyState" logic working unchanged either way.
 *   - POST /upload response: { status: "ready"|"error", file_id, filename,
 *     type, chunks_indexed, detail? }
 *     -> IMPORTANT: her /upload always returns HTTP 200, even on a real
 *        ingestion failure — the failure is signaled via status:"error" in
 *        the body, not via HTTP status. uploadFile() checks that field
 *        explicitly and throws if so; checking response.ok alone would miss
 *        real failures entirely.
 *
 * Both functions throw on any failure (network error, timeout, non-2xx
 * status, malformed shape, or an explicit error signal in the body) so
 * App.jsx can fall back to mock/fake-ready behavior consistently.
 */

const API_URL = import.meta.env.VITE_API_URL
const REQUEST_TIMEOUT_MS = 15000
// Image uploads go through a Gemini vision call + a separate embedding
// call (see backend/ingestion.py + rag.py) before they return — on
// Render's free-tier CPU that routinely takes 20-40s, well past a plain
// text query's budget. Uploads get their own longer ceiling so slow-but-
// working ingestion doesn't get killed as if it were a hung connection.
const UPLOAD_TIMEOUT_MS = 60000

export function isBackendConfigured() {
  return Boolean(API_URL)
}

// Minimal shape check against backend/schemas.py's QueryResponse — doesn't
// validate every field exhaustively, just enough to catch "wrong shape
// entirely" (e.g. an error page's HTML) before it hits the UI components.
function isValidExchangeShape(data) {
  return (
    data &&
    Array.isArray(data.answer) &&
    Array.isArray(data.citations) &&
    Array.isArray(data.reasoningSteps)
  )
}

/**
 * Uploads a single file to POST {VITE_API_URL}/upload as multipart form
 * data. Resolves to the backend's UploadResponse body (includes file_id,
 * useful later for document_ids scoping in queryBackend) on real success.
 * Throws on network error, timeout, non-2xx status, OR a 200 response
 * whose body says status:"error" (see note above — her endpoint reports
 * ingestion failures this way, not via HTTP status).
 */
export async function uploadFile(file) {
  if (!isBackendConfigured()) {
    throw new Error('VITE_API_URL is not set')
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT_MS)

  const formData = new FormData()
  formData.append('file', file)

  let response
  try {
    response = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    })
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error(`Upload timed out after ${UPLOAD_TIMEOUT_MS}ms`)
    }
    throw new Error(`Upload failed: ${err.message}`)
  } finally {
    clearTimeout(timeoutId)
  }

  if (!response.ok) {
    throw new Error(`Upload returned ${response.status} ${response.statusText}`)
  }

  const data = await response.json()

  if (data.status === 'error') {
    throw new Error(data.detail || 'Backend reported an ingestion error')
  }

  return data
}

/**
 * Calls POST {VITE_API_URL}/query with the exact shape backend/schemas.py's
 * QueryRequest expects: { question, session_id, web_search_enabled,
 * document_ids }. sessionId must be a stable string generated once per
 * browser session (see App.jsx) — the backend keys conversation memory off
 * it. documentIds is optional; pass an array of file_ids from successfully
 * uploaded docs to scope retrieval, or omit/empty to search everything.
 *
 * Resolves to an exchange object (answer/citations/reasoningSteps), or
 * resolves to null when the backend signals insufficient:true — App.jsx
 * treats a null result as "show EmptyState in its no-answer variant."
 */
export async function queryBackend(question, webSearchEnabled, sessionId, documentIds) {
  if (!isBackendConfigured()) {
    throw new Error('VITE_API_URL is not set')
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  let response
  try {
    response = await fetch(`${API_URL}/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question,
        session_id: sessionId,
        web_search_enabled: webSearchEnabled,
        document_ids: documentIds && documentIds.length > 0 ? documentIds : undefined,
      }),
      signal: controller.signal,
    })
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error(`Backend request timed out after ${REQUEST_TIMEOUT_MS}ms`)
    }
    throw new Error(`Backend request failed: ${err.message}`)
  } finally {
    clearTimeout(timeoutId)
  }

  if (!response.ok) {
    throw new Error(`Backend returned ${response.status} ${response.statusText}`)
  }

  const data = await response.json()

  if (!isValidExchangeShape(data)) {
    throw new Error('Backend response did not match the expected citation contract shape')
  }

  // Her explicit "couldn't answer" signal -> same as the mock's null return.
  if (data.insufficient === true) {
    return null
  }

  return data
}
