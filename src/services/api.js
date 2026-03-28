const BASE = (import.meta.env.VITE_API_URL || '') + '/api'

async function get(path) {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  return res.json()
}

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  return res.json()
}

async function del(path) {
  const res = await fetch(`${BASE}${path}`, { method: 'DELETE' })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  return res.json()
}

export const api = {
  
  listDatasets:  ()               => get('/datasets'),
  getDataset:    (id, params = {}) => get(`/datasets/${id}?${new URLSearchParams(params)}`),
  getStats:      (id)             => get(`/datasets/${id}/stats`),
  getSummary:    (id)             => get(`/analysis/${id}/summary`),
  getCharts:     (id, params = {}) => get(`/analysis/${id}/charts?${new URLSearchParams(params)}`),
  getML:         (id)             => get(`/analysis/${id}/ml`),
  getSQL:        (id)             => get(`/analysis/${id}/sql`),

  listUploads:   ()               => get('/upload'),
  getUpload:     (id, params = {}) => get(`/upload/${id}?${new URLSearchParams(params)}`),
  deleteUpload:  (id)             => del(`/upload/${id}`),

  uploadCSV: async (file) => {
    const form = new FormData()
    form.append('file', file)
    const res = await fetch(`${BASE}/upload`, {
      method: 'POST',
      body: form,   
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Upload failed')
    return data
  },

  // ── AI — streaming SSE ──────────────────────────────────────────────────
  streamAnalysis: async (question, datasetId, onChunk, onDone, onError) => {
    try {
      const res = await fetch(`${BASE}/ai/analyse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, datasetId }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        onError(err.error || `HTTP ${res.status}`)
        return
      }
      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop()
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (data === '[DONE]') { onDone(); return }
          try {
            const parsed = JSON.parse(data)
            if (parsed.error) { onError(parsed.error); return }
            if (parsed.text)  onChunk(parsed.text)
          } catch {}
        }
      }
      onDone()
    } catch (err) {
      onError(err.message)
    }
  },
}