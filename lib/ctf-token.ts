/**
 * CTF Session Token System
 * 
 * JWT-style token with HMAC-SHA256 signature stored in a cookie.
 * Provides enough friction that casual users can't edit progress directly.
 */

// ============================================================================
// OBFUSCATED SECRET KEY — split across multiple variables
// This is not cryptographically secure, just friction against casual editing
// ============================================================================
const _k1 = String.fromCharCode(110, 116, 120, 99, 115, 103) // ntxcsg
const _k2 = String.fromCharCode(45, 99, 116, 102, 45) // -ctf-
const _k3 = String.fromCharCode(115, 51, 99, 114, 51, 116) // s3cr3t
const _k4 = String.fromCharCode(45, 107, 51, 121, 45) // -k3y-
const _k5 = String.fromCharCode(50, 48, 50, 52) // 2024
const _k6 = String.fromCharCode(45, 100, 102, 119) // -dfw
const getSecretKey = () => [_k1, _k2, _k3, _k4, _k5, _k6].join('')

// ============================================================================
// TOKEN STRUCTURE
// ============================================================================
interface CTFTokenPayload {
  f: number[] // Completed flag IDs (e.g. [1, 3, 5])
  t: number   // Timestamp of first visit (Unix ms)
  v: number   // Token version for future upgrades
}

const TOKEN_VERSION = 1
const COOKIE_NAME = 'ntxcsg-ctf'
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60 // 1 year in seconds

// ============================================================================
// CRYPTO UTILITIES
// ============================================================================

// Base64URL encode (no padding, URL-safe)
function base64UrlEncode(str: string): string {
  if (typeof window !== 'undefined') {
    return btoa(str)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
  }
  return Buffer.from(str).toString('base64url')
}

// Base64URL decode
function base64UrlDecode(str: string): string {
  // Add padding if needed
  let padded = str.replace(/-/g, '+').replace(/_/g, '/')
  while (padded.length % 4) padded += '='
  
  if (typeof window !== 'undefined') {
    return atob(padded)
  }
  return Buffer.from(padded, 'base64').toString('utf8')
}

// HMAC-SHA256 signature using Web Crypto API
async function hmacSign(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder()
  const keyData = encoder.encode(secret)
  const messageData = encoder.encode(message)
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData)
  const hashArray = Array.from(new Uint8Array(signature))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  
  return base64UrlEncode(hashHex)
}

// Verify HMAC-SHA256 signature
async function hmacVerify(message: string, signature: string, secret: string): Promise<boolean> {
  const expected = await hmacSign(message, secret)
  return expected === signature
}

// ============================================================================
// TOKEN CREATION / PARSING
// ============================================================================

// Create a new signed token
async function createToken(payload: CTFTokenPayload): Promise<string> {
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'CTF' }))
  const body = base64UrlEncode(JSON.stringify(payload))
  const message = `${header}.${body}`
  const signature = await hmacSign(message, getSecretKey())
  return `${message}.${signature}`
}

// Parse and verify a token, returns null if invalid
async function parseToken(token: string): Promise<CTFTokenPayload | null> {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    
    const [header, body, signature] = parts
    const message = `${header}.${body}`
    
    // Verify signature
    const valid = await hmacVerify(message, signature, getSecretKey())
    if (!valid) return null
    
    // Parse payload
    const payload = JSON.parse(base64UrlDecode(body)) as CTFTokenPayload
    
    // Version check
    if (payload.v !== TOKEN_VERSION) return null
    
    return payload
  } catch {
    return null
  }
}

// ============================================================================
// COOKIE MANAGEMENT
// ============================================================================

function setCookie(token: string): void {
  if (typeof document === 'undefined') return
  document.cookie = `${COOKIE_NAME}=${token}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`
}

function getCookie(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`))
  return match ? match[1] : null
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Initialize or load the CTF session token.
 * Creates a new token if none exists or signature is invalid.
 */
export async function initCTFSession(): Promise<CTFTokenPayload> {
  const existing = getCookie()
  
  if (existing) {
    const payload = await parseToken(existing)
    if (payload) return payload
  }
  
  // Create fresh token
  const payload: CTFTokenPayload = {
    f: [],
    t: Date.now(),
    v: TOKEN_VERSION
  }
  
  const token = await createToken(payload)
  setCookie(token)
  return payload
}

/**
 * Get current CTF progress. Returns empty array if no valid token.
 */
export async function getCTFProgress(): Promise<number[]> {
  const existing = getCookie()
  if (!existing) return []
  
  const payload = await parseToken(existing)
  return payload?.f ?? []
}

/**
 * Record a flag as found by its ID (1-9).
 * Updates the token and saves to cookie.
 * Returns true if flag was newly recorded, false if already found.
 */
export async function recordFlagById(flagId: number): Promise<boolean> {
  if (flagId < 1 || flagId > 9) return false
  
  // Load current session
  const payload = await initCTFSession()
  
  // Check if already recorded
  if (payload.f.includes(flagId)) return false
  
  // Add flag
  payload.f.push(flagId)
  payload.f.sort((a, b) => a - b) // Keep sorted
  
  // Save updated token
  const token = await createToken(payload)
  setCookie(token)
  
  // Dispatch event for UI updates
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('ctf-flag-update', { detail: { flagId, flags: payload.f } }))
  }
  
  return true
}

/**
 * Record a flag by its string value.
 * Validates format and maps to flag ID.
 * Returns the flag ID if valid and recorded, null otherwise.
 */
export async function recordFlagByValue(flagValue: string): Promise<number | null> {
  const normalized = flagValue.trim().toLowerCase()
  const id = FLAG_VALUE_TO_ID[normalized]
  if (!id) return null
  
  const recorded = await recordFlagById(id)
  return recorded ? id : null
}

/**
 * Validate a flag string and return its ID if valid.
 * Does NOT record the flag.
 */
export function validateFlagFormat(flagValue: string): number | null {
  const normalized = flagValue.trim().toLowerCase()
  return FLAG_VALUE_TO_ID[normalized] ?? null
}

/**
 * Check if a specific flag has been found.
 */
export async function isFlagFound(flagId: number): Promise<boolean> {
  const progress = await getCTFProgress()
  return progress.includes(flagId)
}

/**
 * Get full session info including timestamp.
 */
export async function getCTFSession(): Promise<{ flags: number[]; firstVisit: number } | null> {
  const existing = getCookie()
  if (!existing) return null
  
  const payload = await parseToken(existing)
  if (!payload) return null
  
  return {
    flags: payload.f,
    firstVisit: payload.t
  }
}

// ============================================================================
// FLAG REGISTRY — Maps flag values to IDs
// ============================================================================

// Flag ID to metadata (public info only - no flag values)
export const FLAG_REGISTRY: Record<number, { category: string; tier: number; autoRecords: boolean }> = {
  1: { category: 'CONSOLE', tier: 1, autoRecords: true },
  2: { category: 'SOURCE', tier: 1, autoRecords: false },
  3: { category: 'INTERACTION', tier: 1, autoRecords: true },
  4: { category: 'HIDDEN', tier: 2, autoRecords: true },
  5: { category: 'BEHAVIOR', tier: 2, autoRecords: true },
  6: { category: 'RECON', tier: 3, autoRecords: false },
  7: { category: 'STYLESHEET', tier: 3, autoRecords: false },
  8: { category: 'NETWORK', tier: 3, autoRecords: true },
  9: { category: 'META', tier: 4, autoRecords: true },
}

// Obfuscated flag value to ID mapping (built at runtime)
// We store char codes to avoid plain strings in source
const _f1 = [102,108,97,103,123,121,48,117,95,48,112,101,110,101,100,95,116,104,51,95,99,48,110,115,48,108,51,125]
const _f2 = [102,108,97,103,123,115,111,117,114,99,51,95,100,49,118,51,114,95,100,51,116,51,99,116,51,100,125] // flag{sourc3_d1v3r_d3t3ct3d}
const _f3 = [102,108,97,103,123,107,48,110,97,109,49,95,104,52,99,107,51,114,125]
const _f4 = [102,108,97,103,123,98,48,116,116,48,109,95,48,102,95,116,104,51,95,115,116,52,99,107,125]
const _f5 = [102,108,97,103,123,112,51,114,115,49,115,116,51,110,99,51,95,49,115,95,107,51,121,125]
const _f6 = [102,108,97,103,123,114,48,98,48,116,115,95,100,48,110,116,95,115,116,48,112,95,104,52,99,107,51,114,115,125]
const _f7 = [102,108,97,103,123,99,52,115,99,52,100,49,110,103,95,115,51,99,114,51,116,115,125]
const _f8 = [102,108,97,103,123,116,114,52,102,102,49,99,95,52,110,52,108,121,115,49,115,95,102,116,119,125]
const _f9 = [102,108,97,103,123,121,48,117,95,107,110,51,119,95,119,104,51,114,51,95,116,48,95,108,48,48,107,125]

const FLAG_VALUE_TO_ID: Record<string, number> = {
  [String.fromCharCode(..._f1)]: 1,
  [String.fromCharCode(..._f2)]: 2,
  [String.fromCharCode(..._f3)]: 3,
  [String.fromCharCode(..._f4)]: 4,
  [String.fromCharCode(..._f5)]: 5,
  [String.fromCharCode(..._f6)]: 6,
  [String.fromCharCode(..._f7)]: 7,
  [String.fromCharCode(..._f8)]: 8,
  [String.fromCharCode(..._f9)]: 9,
}

// Export for manual submission validation
export const TOTAL_FLAGS = 9
