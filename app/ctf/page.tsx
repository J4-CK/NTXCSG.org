"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { 
  getCTFProgress, 
  recordFlagById, 
  recordFlagByValue,
  validateFlagFormat,
  FLAG_REGISTRY,
  TOTAL_FLAGS 
} from "@/lib/ctf-token"
import { orgInfo, socialLinks } from "@/config/site-content"

/* ============================================================================
   CTF SCOREBOARD PAGE
   Uses signed cookie tokens for progress tracking
   ============================================================================ */

// Category display names (public - no flag values)
const FLAG_CATEGORIES = Object.entries(FLAG_REGISTRY).map(([id, data]) => ({
  id: Number(id),
  category: data.category,
  tier: data.tier,
}))

// Typewriter effect component
function TypewriterText({ text, onComplete, speed = 30 }: { text: string; onComplete?: () => void; speed?: number }) {
  const [displayed, setDisplayed] = useState("")
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mq.matches)
  }, [])
  
  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayed(text)
      onComplete?.()
      return
    }
    
    let i = 0
    setDisplayed("")
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1))
        i++
      } else {
        clearInterval(interval)
        onComplete?.()
      }
    }, speed)
    return () => clearInterval(interval)
  }, [text, speed, onComplete, prefersReducedMotion])
  
  return <span>{displayed}<span className="terminal-cursor">_</span></span>
}

export default function CTFPage() {
  const [foundFlags, setFoundFlags] = useState<number[]>([])
  const [input, setInput] = useState("")
  const [terminalOutput, setTerminalOutput] = useState<{ text: string; color: string; isTyping: boolean } | null>(null)
  const [justUnlockedId, setJustUnlockedId] = useState<number | null>(null)
  const [hasShownCelebration, setHasShownCelebration] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load progress from cookie token
  const refreshScoreboard = useCallback(async () => {
    const progress = await getCTFProgress()
    setFoundFlags(progress)
  }, [])

  useEffect(() => {
    // Flag 9 — CTF Scoreboard Meta (fires once per session)
    if (!sessionStorage.getItem('ntxcsg-ctf-meta-fired')) {
      sessionStorage.setItem('ntxcsg-ctf-meta-fired', '1')
      console.log("%c[NTXCSG]", "color: #39FF14; font-family: monospace;")
      console.log(
        "%c" + ["You found the scoreboard.", "That counts.", "flag{y0u_kn3w_wh3r3_t0_l00k}"].join("\n"),
        "color: #39FF14; font-family: monospace; font-size: 11px;"
      )
      recordFlagById(9) // Flag 9: Meta
    }

    // Load found flags
    refreshScoreboard()

    // Listen for flag updates from other components
    const handleFlagUpdate = () => refreshScoreboard()
    window.addEventListener('ctf-flag-update', handleFlagUpdate)
    
    return () => window.removeEventListener('ctf-flag-update', handleFlagUpdate)
  }, [refreshScoreboard])

  // Periodically refresh in case of cross-tab updates
  useEffect(() => {
    const interval = setInterval(refreshScoreboard, 2000)
    return () => clearInterval(interval)
  }, [refreshScoreboard])

  const foundCount = foundFlags.length
  const allFound = foundCount === TOTAL_FLAGS

  // Celebration effect when all flags are found
  useEffect(() => {
    if (allFound && !hasShownCelebration) {
      setHasShownCelebration(true)
    }
  }, [allFound, hasShownCelebration])

  // Clear terminal output after delay
  useEffect(() => {
    if (terminalOutput && !terminalOutput.isTyping) {
      const timeout = setTimeout(() => setTerminalOutput(null), 4000)
      return () => clearTimeout(timeout)
    }
  }, [terminalOutput])

  // Clear unlock glow after animation
  useEffect(() => {
    if (justUnlockedId !== null) {
      const timeout = setTimeout(() => setJustUnlockedId(null), 2000)
      return () => clearTimeout(timeout)
    }
  }, [justUnlockedId])

  const handleSubmit = async () => {
    const trimmed = input.trim().toLowerCase()
    
    // Format validation
    if (!trimmed.startsWith('flag{') || !trimmed.endsWith('}')) {
      setTerminalOutput({ 
        text: "> ERROR: Invalid format. Expected flag{...}", 
        color: "var(--red)", 
        isTyping: true 
      })
      // Don't clear input on error - user can edit and retry
      return
    }

    setIsValidating(true)
    
    // Check if flag is valid
    const flagId = validateFlagFormat(trimmed)
    
    if (flagId) {
      // Check if already found
      if (foundFlags.includes(flagId)) {
        setTerminalOutput({ 
          text: "> ALREADY CAPTURED — flag already recorded.", 
          color: "var(--green)", 
          isTyping: true 
        })
        setInput("")
      } else {
        // Record the flag
        await recordFlagByValue(trimmed)
        await refreshScoreboard()
        setJustUnlockedId(flagId)
        const newCount = foundFlags.length + 1
        setTerminalOutput({ 
          text: `> ACCESS GRANTED — flag{${flagId}} recorded. [${newCount}/${TOTAL_FLAGS} flags captured]`, 
          color: "var(--green)", 
          isTyping: true 
        })
        setInput("")
      }
    } else {
      setTerminalOutput({ 
        text: "> ERROR: Invalid flag. Keep looking.", 
        color: "var(--red)", 
        isTyping: true 
      })
      // Don't clear input on error - user can edit and retry
    }
    
    setIsValidating(false)
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg-primary)" }}>
      {/* Grain overlay */}
      <div className="grain-overlay" aria-hidden="true" />

      {/* Header — matches main site */}
      <header className="nav-header">
        <div className="container mx-auto max-w-[1100px] px-6 md:px-10">
          <nav className="flex items-center justify-between h-14 md:h-16" aria-label="Main navigation">
            <a href="/" aria-label="NTXCSG Home">
              <img src="/NTXCSG_ONLYLETTERS.svg" alt="NTXCSG" className="h-7 md:h-8 w-auto" />
            </a>
            <div className="hidden md:flex items-center gap-6">
              <a href="/#calendar" className="nav-link">Meetings</a>
              <a href="/#history" className="nav-link">History</a>
              <a href="/#faq" className="nav-link">Briefing</a>
              <a href={socialLinks.meetup.url} target="_blank" rel="noopener noreferrer" className="btn-nav">Join</a>
            </div>
            <button 
              className="md:hidden p-2 -mr-2" 
              aria-label="Open menu" 
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            </button>
          </nav>
          {mobileNavOpen && (
            <div className="md:hidden pb-4 border-t" style={{ borderColor: "var(--green-dim)" }}>
              <div className="flex flex-col gap-3 pt-4">
                <a href="/#calendar" className="nav-link py-2">Meetings</a>
                <a href="/#history" className="nav-link py-2">History</a>
                <a href="/#faq" className="nav-link py-2">Briefing</a>
                <a href={socialLinks.meetup.url} target="_blank" rel="noopener noreferrer" className="btn-nav inline-block text-center mt-2">Join on Meetup</a>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 py-8 md:py-16 px-6 md:px-10 pt-20 md:pt-24">
        <div className="container mx-auto max-w-[900px]">
          
          {/* Back navigation — prominent */}
          <a 
            href="/" 
            className="inline-flex items-center gap-2 mb-10 px-4 py-2 transition-all hover:bg-[rgba(57,255,20,0.05)]"
            style={{ 
              fontFamily: "var(--font-data)", 
              fontSize: "14px", 
              color: "var(--green)",
              border: "1px solid var(--green-dim)",
            }}
          >
            <span style={{ fontSize: "18px" }}>&larr;</span>
            <span>BACK TO MAIN SITE</span>
          </a>

          {/* Progress counter — large */}
          <div 
            className="mb-6"
            style={{
              fontFamily: "var(--font-data)",
              fontSize: "clamp(28px, 5vw, 42px)",
              fontWeight: "700",
              color: "var(--white)",
              letterSpacing: "-0.02em",
            }}
          >
            {foundCount} <span style={{ color: "var(--green-dim)" }}>/</span> {TOTAL_FLAGS}
            <span 
              className="block md:inline md:ml-4"
              style={{ 
                fontSize: "clamp(12px, 2vw, 14px)", 
                fontWeight: "400",
                color: "var(--green-dim)",
                letterSpacing: "0.1em",
              }}
            >
              FLAGS CAPTURED
            </span>
          </div>

          {/* Section label */}
          <div
            className="text-xs tracking-[0.15em] mb-4"
            style={{ fontFamily: "var(--font-data)", color: "var(--green)" }}
          >
            [ CTF SCOREBOARD ]
          </div>

          {/* Title */}
          <h1
            className="text-3xl md:text-4xl font-bold mb-8"
            style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--white)" }}
          >
            FIND THEM ALL
          </h1>

          {/* Flag tiles grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-12">
            {FLAG_CATEGORIES.map((flagData) => {
              const isFound = foundFlags.includes(flagData.id)
              const isJustUnlocked = justUnlockedId === flagData.id
              
              return (
                <div
                  key={flagData.id}
                  className={`ctf-tile ${isFound ? 'ctf-tile-found' : 'ctf-tile-locked'} ${isJustUnlocked ? 'ctf-tile-unlocking' : ''}`}
                >
                  <div className="ctf-tile-header">
                    <span className="ctf-tile-number">#{flagData.id.toString().padStart(2, '0')}</span>
                    <span className={`ctf-tile-status ${isJustUnlocked ? 'ctf-tile-status-unlocking' : ''}`}>
                      {isJustUnlocked ? 'UNLOCKED' : isFound ? 'FOUND' : 'LOCKED'}
                    </span>
                  </div>
                  <div className="ctf-tile-category">
                    {isFound ? flagData.category : '???'}
                  </div>
                  <div className="ctf-tile-tier">
                    TIER {flagData.tier}
                  </div>
                </div>
              )
            })}
          </div>

          {/* All found state */}
          {allFound && (
            <div
              className="mb-12 p-6 text-center ctf-complete-box"
            >
              <div
                style={{
                  fontFamily: "var(--font-data)",
                  fontSize: "14px",
                  color: "var(--green)",
                  marginBottom: "8px",
                }}
              >
                // ALL FLAGS CAPTURED
              </div>
              <div
                style={{
                  fontFamily: "var(--font-data)",
                  fontSize: "12px",
                  color: "var(--green)",
                  marginBottom: "8px",
                }}
              >
                // FULL CIRCUIT COMPLETE
              </div>
              <div
                style={{
                  fontFamily: "var(--font-data)",
                  fontSize: "11px",
                  color: "var(--green-dim)",
                  marginBottom: "16px",
                }}
              >
                // BRING THIS PAGE TO A MONTHLY MEETUP FOR YOUR STICKER
              </div>
              <a
                href="/"
                className="inline-block px-6 py-3"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "13px",
                  fontWeight: "600",
                  letterSpacing: "0.1em",
                  color: "var(--bg-primary)",
                  background: "var(--green)",
                  textTransform: "uppercase",
                }}
              >
                RETURN TO MAIN SITE
              </a>
            </div>
          )}

          {/* Manual submission */}
          <div
            className="mb-12 py-8 border-t border-b"
            style={{ borderColor: "var(--green-dim)" }}
          >
            <div
              className="mb-4"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "16px",
                fontWeight: "600",
                color: "var(--white)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              MANUAL FLAG SUBMISSION
            </div>
            <div className="flex gap-3">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !isValidating && handleSubmit()}
                placeholder="flag{...}"
                className="flex-1 px-4 py-3 ctf-input"
                disabled={isValidating}
              />
              <button
                onClick={handleSubmit}
                disabled={isValidating}
                className="ctf-submit-btn"
              >
                {isValidating ? "..." : "SUBMIT"}
              </button>
            </div>
            
            {/* Terminal output with typewriter effect */}
            <div className="ctf-terminal-output" style={{ minHeight: '24px' }}>
              {terminalOutput && (
                <div
                  className={`mt-3 ctf-terminal-line ${!terminalOutput.isTyping ? 'ctf-terminal-fade' : ''}`}
                  style={{ color: terminalOutput.color }}
                >
                  {terminalOutput.isTyping ? (
                    <TypewriterText 
                      text={terminalOutput.text} 
                      onComplete={() => setTerminalOutput(prev => prev ? { ...prev, isTyping: false } : null)}
                    />
                  ) : (
                    terminalOutput.text
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div
            style={{
              fontFamily: "var(--font-data)",
              fontSize: "11px",
              color: "var(--green-dim)",
              lineHeight: "1.8",
            }}
          >
            // Submit all {TOTAL_FLAGS} flags at a monthly meetup for a sticker.
            <br />
            // Or don&apos;t. The finding is the point.
            <br />
            //{" "}
            <a
              href="https://www.meetup.com/NTXCSG/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--green)" }}
            >
              meetup.com/NTXCSG
            </a>
          </div>
        </div>
      </main>

      {/* Footer — matches main site */}
      <footer className="py-10 px-6 md:px-10" style={{ background: "var(--bg-elevated)" }}>
        <div className="container mx-auto max-w-[1100px]">
          <div className="flex flex-col items-center text-center">
            {/* Centered logo */}
            <div className="mb-6">
              <img 
                src="/NTXCSG_fulllogo_white.png" 
                alt="NTXCSG - North Texas Cybersecurity Group" 
                className="w-[120px] md:w-[140px] h-auto"
              />
            </div>
            
            {/* Social links */}
            <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 mb-6">
              {Object.values(socialLinks).map((link) => (
                <a 
                  key={link.label} 
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="node-link text-xs" 
                  style={{ color: "var(--gray)" }}
                >
                  {link.label}
                </a>
              ))}
            </div>
            
            {/* Divider */}
            <div className="w-16 h-px mb-6" style={{ background: "var(--green-dim)" }} />
            
            {/* Stats */}
            <div className="mb-4">
              <span style={{ fontFamily: "var(--font-data)", fontSize: "10px", letterSpacing: "0.1em", color: "var(--green-dim)" }}>
                UPTIME: {new Date().getFullYear() - 2013} YRS · EVENTS: {orgInfo.pastEvents}+ · STILL RUNNING
              </span>
            </div>
            
            {/* Credit */}
            <a 
              href="https://www.linkedin.com/in/jacksongiddens/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center justify-center gap-2 transition-opacity hover:opacity-70"
            >
              <span style={{ fontFamily: "var(--font-data)", fontSize: "9px", color: "var(--gray-dim)" }}>
                Designed &amp; built by
              </span>
              <img 
                src="/l0wj4ck_signature.svg" 
                alt="L0WJ4CK" 
                className="h-3 w-auto"
                style={{ opacity: 0.7 }}
              />
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
