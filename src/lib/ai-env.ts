import fs from 'fs'
import path from 'path'

/**
 * Resolves API keys from profile, process.env, and .env.local dynamically
 */
export function getAiApiKeys(profile?: { gemini_api_key?: string | null; openrouter_api_key?: string | null } | null) {
  let gKey = (profile?.gemini_api_key?.trim() && profile.gemini_api_key.trim().length > 5)
    ? profile.gemini_api_key.trim()
    : (process.env.GEMINI_API_KEY?.trim() || '')

  let oKey = (profile?.openrouter_api_key?.trim() && profile.openrouter_api_key.trim().length > 5)
    ? profile.openrouter_api_key.trim()
    : (process.env.OPENROUTER_API_KEY?.trim() || '')

  // If missing from process.env (e.g. Next.js dev server started before .env.local was edited), read fresh from .env.local
  if (!gKey || !oKey) {
    try {
      const envPath = path.resolve(process.cwd(), '.env.local')
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8')
        content.split(/\r?\n/).forEach(line => {
          const trimmed = line.trim()
          if (!trimmed.startsWith('#') && trimmed.includes('=')) {
            const idx = trimmed.indexOf('=')
            const k = trimmed.slice(0, idx).trim()
            const v = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '')
            if (k === 'GEMINI_API_KEY' && !gKey) gKey = v
            if (k === 'OPENROUTER_API_KEY' && !oKey) oKey = v
          }
        })
      }
    } catch {
      // Ignore in production environments without local file access
    }
  }

  return {
    geminiApiKey: gKey,
    openrouterApiKey: oKey
  }
}
