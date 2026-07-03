/**
 * Real backend client for the FastAPI /query endpoint.
 *
 * Reads the backend base URL from VITE_API_URL (set in .env.local for dev,
 * or as a Netlify environment variable for the deployed site). If that
 * var isn't set, `isBackendConfigured()` returns false and App.jsx should
 * skip straight to the mock — no point attempting a fetch to nowhere.
 *
 * queryBackend() intentionally throws on any failure (network error,
 * timeout, non-2xx status, or a response that doesn't match the citation
 * contract) rather than silently returning something malformed. App.jsx
 * catches that and falls back to the mock, so a flaky or half-built
 * backend can never break the demo.
 */

const API_URL = import.meta.env.VITE_API_URL
const REQUEST_TIMEOUT_MS = 15000

export function isBackendConfigured() {
  return Boolean(API_URL)
}

// Minimal shape check against the contract in README.md — doesn't validate
// every field exhaustively, just enough to catch "wrong shape entirely"
// (e.g. an error page's HTML, or a response missing citations) before it
// hits the UI components.
function isValidExchangeShape(data) {
  return (
    data &&
    Array.isArray(data.answer) &&
    Array.isArray(data.citations) &&
    Array.isArray(data.reasoningSteps)
  )
}

/**
 * Calls POST {VITE_API_URL}/query with { question, webSearchEnabled }.
 * Resolves to an exchange object matching pickMockExchange's return shape,
 * or resolves to null if the backend explicitly signals "no grounded
 * answer" (mirrors the EmptyState behavior of the mock). Throws for any
 * other failure — network error, timeout, bad status, malformed shape —
 * so the caller can decide how to handle/fallback.
 */
export async function queryBackend(question, webSearchEnabled) {
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
      body: JSON.stringify({ question, webSearchEnabled }),
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

  // Explicit "no grounded citations" signal from the backend -> EmptyState,
  // same as the mock's null return.
  if (data === null || data.noGroundedAnswer === true) {
    return null
  }

  if (!isValidExchangeShape(data)) {
    throw new Error('Backend response did not match the expected citation contract shape')
  }

  return data
}
