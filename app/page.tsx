"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { ExternalLink } from "lucide-react"
import {
  orgInfo,
  meetingConfig,
  getNextMeetingDate,
  missionPillars,
  socialLinks,
  eventsUrl,
  historyEras,
  historyClosing,
  heroContent,
  sectionLabels,
  faqItems,
} from "@/config/site-content"
import { recordFlagById } from "@/lib/ctf-token"

/* ============================================================================
   CTF FLAG SYSTEM — Now uses signed cookie tokens
   ============================================================================ */

// Wrapper to record flags by ID (async but fire-and-forget)
function recordFlag(flagId: number) {
  if (typeof window === "undefined") return
  recordFlagById(flagId).catch(() => {})
}

function calcUptimeString(): string {
  const founded = new Date("2013-02-01")
  const now = new Date()
  const diffMs = now.getTime() - founded.getTime()
  const years = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365.25))
  const months = Math.floor((diffMs % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24 * 30.44))
  const days = Math.floor((diffMs % (1000 * 60 * 60 * 24 * 30.44)) / (1000 * 60 * 60 * 24))
  return `${years} YRS, ${months} MONTHS, ${days} DAYS`
}

/* ============================================================================
   INTRO ANIMATION — Robust rewrite with proper path measurement
   ============================================================================ */

function IntroAnimation({ onComplete }: { onComplete: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const shieldRef = useRef<SVGSVGElement>(null)
  const wordmarkRef = useRef<HTMLDivElement>(null)
  const subtitleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Skip if reduced motion preferred
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onComplete()
      return
    }

    // Same animation for both desktop and mobile - full 3 seconds
    const overlay = overlayRef.current
    const shield = shieldRef.current
    const wordmark = wordmarkRef.current
    const subtitle = subtitleRef.current
    if (!overlay) { onComplete(); return }

    // Prevent scroll during intro
    document.body.style.overflow = 'hidden'

    // === PHASE 1: Fade shield in as dormant (200ms → 1000ms) ===
    const phase1Timer = setTimeout(() => {
      if (shield) {
        shield.style.transition = 'opacity 800ms ease'
        shield.style.opacity = '1'
        
        // Set all traces to dim, dormant state
        shield.querySelectorAll('.intro-trace').forEach(path => {
          const p = path as SVGPathElement
          p.style.stroke = '#1C4A1C'
          p.style.opacity = '0.4'
        })
        shield.querySelectorAll('.intro-node').forEach(circle => {
          const c = circle as SVGCircleElement
          c.style.fill = 'none'
          c.style.stroke = '#1C4A1C'
          c.style.opacity = '0.3'
        })
      }
    }, 200)

    // === PHASE 2: Measure and animate traces (1000ms → 1800ms) ===
    const phase2Timer = setTimeout(() => {
      if (shield) {
        // Double-rAF to guarantee paint has occurred before measuring
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const traces = Array.from(shield.querySelectorAll('.intro-trace')) as SVGPathElement[]
            
            traces.forEach((path, i) => {
              let length: number
              try {
                length = path.getTotalLength()
              } catch {
                length = 200 // Fallback
              }
              if (length === 0) length = 200

              // Set up for animation
              path.style.strokeDasharray = `${length}`
              path.style.strokeDashoffset = `${length}`
              path.style.transition = 'none'

              // Stagger each trace
              const delay = i * 80
              const duration = Math.max(length * 1.2, 300)

              setTimeout(() => {
                path.style.transition = `stroke-dashoffset ${duration}ms linear`
                path.style.strokeDashoffset = '0'
              }, delay)
            })
          })
        })
      }
    }, 1000)

    // === PHASE 3: POWER ON FLIP (1800ms) ===
    const phase3Timer = setTimeout(() => {
      if (shield) {
        // All traces go live — instant color change
        shield.querySelectorAll('.intro-trace').forEach(path => {
          const p = path as SVGPathElement
          p.style.transition = 'none'
          p.style.stroke = '#39FF14'
          p.style.opacity = '0.65'
        })

        // Node dots — relay snap activation
        const nodes = Array.from(shield.querySelectorAll('.intro-node')) as SVGCircleElement[]
        nodes.forEach((node, i) => {
          setTimeout(() => {
            node.style.fill = '#39FF14'
            node.style.stroke = 'none'
            node.style.opacity = '0'
            node.style.transform = 'scale(0)'
            node.style.transformOrigin = 'center'
            node.style.transition = 'none'

            requestAnimationFrame(() => {
              node.style.transition = 'transform 180ms cubic-bezier(0.2, 2.0, 0.4, 1), opacity 60ms ease'
              node.style.opacity = '1'
              node.style.transform = 'scale(1)'
            })
          }, i * 50)
        })
      }
    }, 1800)

    // === PHASE 4: Wordmark assembly (2200ms) ===
    const phase4Timer = setTimeout(() => {
      if (wordmark) {
        wordmark.style.opacity = '1'
        
        const letters = wordmark.querySelectorAll('.intro-letter')
        letters.forEach((letter, i) => {
          const l = letter as HTMLSpanElement
          setTimeout(() => {
            l.classList.add('drop')
          }, i < 3 ? i * 80 : 120 + i * 80) // Pause between NTX and CSG
        })
      }
    }, 2200)

    // === PHASE 5: Subtitle scan (2800ms, finishes ~3100ms) ===
    const phase5Timer = setTimeout(() => {
      if (subtitle) {
        subtitle.style.opacity = '1'
        subtitle.classList.add('scan')
      }
    }, 2800)

    // === PHASE 6: HOLD for 1 second, then fade out (4100ms) ===
    const phase6Timer = setTimeout(() => {
      if (overlay) {
        overlay.style.transition = 'opacity 500ms ease'
        overlay.style.opacity = '0'
      }
      if (shield) {
        shield.style.transition = 'opacity 500ms ease'
        shield.style.opacity = '0'
      }
      if (wordmark) {
        wordmark.style.transition = 'opacity 500ms ease'
        wordmark.style.opacity = '0'
      }
      if (subtitle) {
        subtitle.style.transition = 'opacity 400ms ease'
        subtitle.style.opacity = '0'
      }
    }, 4100)

    // === PHASE 7: Complete (4600ms) ===
    const phase7Timer = setTimeout(() => {
      document.body.style.overflow = ''
      onComplete()
    }, 4600)

    return () => {
      clearTimeout(phase1Timer)
      clearTimeout(phase2Timer)
      clearTimeout(phase3Timer)
      clearTimeout(phase4Timer)
      clearTimeout(phase5Timer)
      clearTimeout(phase6Timer)
      clearTimeout(phase7Timer)
      document.body.style.overflow = ''
    }
  }, [onComplete])

  return (
    <div ref={overlayRef} className="intro-overlay" aria-hidden="true">
      <div className="intro-pcb-grid visible" />
      
      {/* Main content container - centered */}
      <div className="intro-content">
        {/* Shield SVG — large and prominent */}
        <svg 
          ref={shieldRef}
          className="intro-shield"
          viewBox="0 0 200 240" 
          style={{ opacity: 0 }}
        >
          <path className="intro-trace outer" d="M100,10 L180,40 L180,130 Q180,180 100,230 Q20,180 20,130 L20,40 Z" strokeWidth="3" fill="none" />
          <path className="intro-trace inner" d="M100,25 L165,50 L165,125 Q165,170 100,215 Q35,170 35,125 L35,50 Z" strokeWidth="1.5" fill="none" />
          <path className="intro-trace" d="M55,75 L100,75 L100,120 L145,120" strokeWidth="1" fill="none" />
          <path className="intro-trace" d="M75,95 L75,145 L125,145 L125,170" strokeWidth="1" fill="none" />
          <circle className="intro-node" cx="55" cy="75" r="4" />
          <circle className="intro-node" cx="100" cy="75" r="3" />
          <circle className="intro-node" cx="145" cy="120" r="4" />
          <circle className="intro-node" cx="125" cy="170" r="4" />
        </svg>

        {/* Wordmark - large NTXCSG */}
        <div ref={wordmarkRef} className="intro-wordmark" style={{ opacity: 0 }}>
          <span className="intro-letter" style={{ color: "#ffffff" }}>N</span>
          <span className="intro-letter" style={{ color: "#ffffff" }}>T</span>
          <span className="intro-letter" style={{ color: "#ffffff" }}>X</span>
          <span className="intro-letter" style={{ color: "#CC0000" }}>C</span>
          <span className="intro-letter" style={{ color: "#CC0000" }}>S</span>
          <span className="intro-letter" style={{ color: "#CC0000" }}>G</span>
        </div>

        {/* Subtitle - Full org name */}
        <div ref={subtitleRef} className="intro-subtitle" style={{ opacity: 0 }}>
          {orgInfo.name}
        </div>
      </div>
    </div>
  )
}

/* ============================================================================
   COUNTING ANIMATION
   ============================================================================ */

/* ============================================================================
   SCROLL REVEAL HOOK
   ============================================================================ */

function useScrollReveal(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setIsVisible(true) }, { threshold, rootMargin: "0px" })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold])
  
  return { ref, isVisible }
}

/* ============================================================================
   SECTION COMPONENT
   ============================================================================ */

function Section({ children, className = "", delay = 0, type = "scan" }: { children: React.ReactNode; className?: string; delay?: number; type?: "scan" | "snap" | "flicker" }) {
  const { ref, isVisible } = useScrollReveal()
  const revealClass = type === "scan" ? "reveal-scan" : type === "flicker" ? "reveal-flicker" : "reveal-snap"
  
  return (
    <div ref={ref} className={`${revealClass} ${isVisible ? "visible" : ""} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}

/* ============================================================================
   TRACE DIVIDER
   ============================================================================ */

function TraceDivider() {
  const { ref, isVisible } = useScrollReveal(0.2)
  return (
    <div ref={ref} className={`trace-divider ${isVisible ? "active" : ""}`} aria-hidden="true">
      <div className="trace-divider-h" />
      <div className="trace-divider-v" />
      <div className="trace-divider-node" />
    </div>
  )
}

/* ============================================================================
   SECTION DIVIDER — Full-width PCB trace between major sections
   ============================================================================ */

function SectionDivider({ position = "center" }: { position?: "left" | "center" | "right" }) {
  const positionClass = position === "left" ? "section-divider--left" : position === "right" ? "section-divider--right" : ""
  return <div className={`section-divider ${positionClass}`} aria-hidden="true" />
}

/* ============================================================================
   SECTION LABEL
   ============================================================================ */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-xs tracking-[0.15em] mb-4" style={{ fontFamily: "var(--font-data)", color: "var(--green)" }}>{children}</div>
}

/* ============================================================================
   INTERACTIVE CALENDAR
   ============================================================================ */

/* ============================================================================
   WHY WE EXIST CAROUSEL — Auto-scrolling with manual drag/swipe interaction
   ============================================================================ */

function WhyWeExistCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  
  // Refs for drag state (avoid re-renders during drag)
  const dragStartX = useRef(0)
  const scrollStartX = useRef(0)
  const lastInteraction = useRef(Date.now())
  const resumeTimeout = useRef<NodeJS.Timeout | null>(null)
  
  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)
    // If reduced motion, never auto-play
    if (mediaQuery.matches) setIsAutoPlaying(false)
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
      if (e.matches) setIsAutoPlaying(false)
    }
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])
  
  // Auto-scroll effect (disabled if user prefers reduced motion or is dragging)
  useEffect(() => {
    // Skip auto-scroll if user prefers reduced motion or auto-play is paused
    if (prefersReducedMotion || !isAutoPlaying) return
    
    const container = scrollRef.current
    if (!container) return
    
    let animationId: number
    let scrollPosition = container.scrollLeft
    const scrollSpeed = 0.5 // pixels per frame
    
    const scroll = () => {
      scrollPosition += scrollSpeed
      
      // Get the width of one set of cards (half the total since we duplicate)
      const singleSetWidth = container.scrollWidth / 2
      
      // Reset when we've scrolled through one complete set
      if (scrollPosition >= singleSetWidth) {
        scrollPosition = 0
      }
      
      container.scrollLeft = scrollPosition
      animationId = requestAnimationFrame(scroll)
    }
    
    animationId = requestAnimationFrame(scroll)
    
    return () => cancelAnimationFrame(animationId)
  }, [prefersReducedMotion, isAutoPlaying])
  
  // Resume auto-play after 10 seconds of inactivity
  const scheduleResume = useCallback(() => {
    // Don't resume if reduced motion is preferred
    if (prefersReducedMotion) return
    
    // Clear any existing timeout
    if (resumeTimeout.current) {
      clearTimeout(resumeTimeout.current)
    }
    
    lastInteraction.current = Date.now()
    
    resumeTimeout.current = setTimeout(() => {
      setIsAutoPlaying(true)
    }, 10000) // 10 seconds
  }, [prefersReducedMotion])
  
  // Stop auto-play on interaction
  const stopAutoPlay = useCallback(() => {
    setIsAutoPlaying(false)
    scheduleResume()
  }, [scheduleResume])
  
  // Mouse drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const container = scrollRef.current
    if (!container) return
    
    setIsDragging(true)
    stopAutoPlay()
    dragStartX.current = e.clientX
    scrollStartX.current = container.scrollLeft
    
    // Prevent text selection during drag
    e.preventDefault()
  }, [stopAutoPlay])
  
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return
    const container = scrollRef.current
    if (!container) return
    
    const deltaX = e.clientX - dragStartX.current
    container.scrollLeft = scrollStartX.current - deltaX
  }, [isDragging])
  
  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])
  
  const handleMouseLeave = useCallback(() => {
    if (isDragging) {
      setIsDragging(false)
    }
  }, [isDragging])
  
  // Touch handlers for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const container = scrollRef.current
    if (!container) return
    
    setIsDragging(true)
    stopAutoPlay()
    dragStartX.current = e.touches[0].clientX
    scrollStartX.current = container.scrollLeft
  }, [stopAutoPlay])
  
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return
    const container = scrollRef.current
    if (!container) return
    
    const deltaX = e.touches[0].clientX - dragStartX.current
    container.scrollLeft = scrollStartX.current - deltaX
  }, [isDragging])
  
  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)
  }, [])
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (resumeTimeout.current) {
        clearTimeout(resumeTimeout.current)
      }
    }
  }, [])

  // Icon components
  const icons: Record<string, JSX.Element> = {
    terminal: (
      <svg viewBox="0 0 48 48" fill="none" className="carousel-icon">
        <rect x="4" y="8" width="40" height="32" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M12 20L18 26L12 32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M22 32H32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    chip: (
      <svg viewBox="0 0 48 48" fill="none" className="carousel-icon">
        <rect x="12" y="12" width="24" height="24" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M18 12V6M24 12V6M30 12V6M18 42V36M24 42V36M30 42V36M12 18H6M12 24H6M12 30H6M42 18H36M42 24H36M42 30H36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <rect x="18" y="18" width="12" height="12" fill="currentColor" opacity="0.3" />
      </svg>
    ),
    radar: (
      <svg viewBox="0 0 48 48" fill="none" className="carousel-icon">
        <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="2" fill="none" />
        <circle cx="24" cy="24" r="12" stroke="currentColor" strokeWidth="1" opacity="0.5" fill="none" />
        <circle cx="24" cy="24" r="6" stroke="currentColor" strokeWidth="1" opacity="0.3" fill="none" />
        <path d="M24 24L36 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="24" cy="24" r="3" fill="currentColor" />
      </svg>
    ),
    shield: (
      <svg viewBox="0 0 48 48" fill="none" className="carousel-icon">
        <path d="M24 4L40 10V22C40 32 32 40 24 44C16 40 8 32 8 22V10L24 4Z" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M16 24L22 30L32 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    network: (
      <svg viewBox="0 0 48 48" fill="none" className="carousel-icon">
        <circle cx="24" cy="12" r="4" stroke="currentColor" strokeWidth="2" fill="none" />
        <circle cx="12" cy="36" r="4" stroke="currentColor" strokeWidth="2" fill="none" />
        <circle cx="36" cy="36" r="4" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M24 16V24L12 32M24 24L36 32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="24" cy="24" r="2" fill="currentColor" />
      </svg>
    ),
    nodes: (
      <svg viewBox="0 0 48 48" fill="none" className="carousel-icon">
        <circle cx="24" cy="24" r="6" stroke="currentColor" strokeWidth="2" fill="none" />
        <circle cx="12" cy="12" r="3" fill="currentColor" />
        <circle cx="36" cy="12" r="3" fill="currentColor" />
        <circle cx="12" cy="36" r="3" fill="currentColor" />
        <circle cx="36" cy="36" r="3" fill="currentColor" />
        <path d="M14 14L20 20M28 20L34 14M14 34L20 28M28 28L34 34" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
      </svg>
    ),
  }

  // Duplicate cards for infinite scroll effect
  const duplicatedPillars = [...missionPillars, ...missionPillars]

  return (
    <div className="carousel-container">
      <div 
        ref={scrollRef} 
        className={`carousel-track ${isDragging ? 'carousel-grabbing' : 'carousel-grab'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {duplicatedPillars.map((pillar, i) => (
          <div key={i} className="carousel-card">
            <div className="carousel-card-inner">
              <div className="carousel-icon-wrapper">
                {icons[pillar.icon]}
              </div>
              <h4 className="carousel-title">{pillar.title}</h4>
              <p className="carousel-text">{pillar.text}</p>
            </div>
            {/* PCB corner accents */}
            <div className="carousel-corner carousel-corner-tl" />
            <div className="carousel-corner carousel-corner-br" />
          </div>
        ))}
      </div>
      
      {/* Fade edges */}
      <div className="carousel-fade carousel-fade-left" />
      <div className="carousel-fade carousel-fade-right" />
    </div>
  )
}

/* ============================================================================
   MEETINGS TERMINAL — Full Terminal Window Redesign
   ============================================================================ */

function MeetingsTerminal() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedMeeting, setSelectedMeeting] = useState<Date | null>(null)
  const [popoverPosition, setPopoverPosition] = useState<{ vertical: 'below' | 'above'; horizontal: 'left' | 'center' | 'right' }>({ vertical: 'below', horizontal: 'center' })
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [progress, setProgress] = useState(0)
  const [mounted, setMounted] = useState(false)
  const today = new Date()

  // Third Thursday calculation
  function getThirdThursday(year: number, month: number): Date {
  let count = 0
  for (let day = 1; day <= 31; day++) {
  const d = new Date(year, month, day)
  if (d.getMonth() !== month) break
  if (d.getDay() === 4) {
  count++
  if (count === 3) {
  d.setHours(19, 0, 0, 0) // 7:00 PM CST
  return d
  }
  }
  }
  return new Date(year, month, 15, 19, 0)
  }

  // Memoize meeting dates to prevent infinite re-renders
  const nextMeeting = useMemo(() => {
    const now = new Date()
    const thisMonth = getThirdThursday(now.getFullYear(), now.getMonth())
    if (thisMonth > now) return thisMonth
    const nextMonth = now.getMonth() === 11 ? 0 : now.getMonth() + 1
    const nextYear = now.getMonth() === 11 ? now.getFullYear() + 1 : now.getFullYear()
    return getThirdThursday(nextYear, nextMonth)
  }, [])

  const prevMeeting = useMemo(() => {
    const now = new Date()
    const thisMonth = getThirdThursday(now.getFullYear(), now.getMonth())
    if (thisMonth <= now) return thisMonth
    const prevMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1
    const prevYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()
    return getThirdThursday(prevYear, prevMonth)
  }, [])

  // Live countdown
  useEffect(() => {
    setMounted(true)
    
    const updateCountdown = () => {
      const now = new Date()
      const diff = nextMeeting.getTime() - now.getTime()
      
      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      
      setCountdown({ days, hours, minutes, seconds })

      // Progress calculation
      const totalDuration = nextMeeting.getTime() - prevMeeting.getTime()
      const elapsed = now.getTime() - prevMeeting.getTime()
      setProgress(Math.min(100, Math.max(0, (elapsed / totalDuration) * 100)))
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [nextMeeting, prevMeeting])

  // Calendar logic
  function getCalendarDays() {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startPadding = firstDay.getDay()
    const days: { date: Date; isCurrentMonth: boolean }[] = []
    for (let i = startPadding - 1; i >= 0; i--) days.push({ date: new Date(year, month, -i), isCurrentMonth: false })
    for (let d = 1; d <= lastDay.getDate(); d++) days.push({ date: new Date(year, month, d), isCurrentMonth: true })
    const remaining = 42 - days.length
    for (let d = 1; d <= remaining; d++) days.push({ date: new Date(year, month + 1, d), isCurrentMonth: false })
    return days
  }

  const thirdThursday = getThirdThursday(currentDate.getFullYear(), currentDate.getMonth())
  const calendarDays = getCalendarDays()
  const isSameDay = (a: Date, b: Date) => a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()
  const isPast = (date: Date) => { const d = new Date(date); d.setHours(23, 59, 59, 999); return d < today }
  const formatMonthYear = (date: Date) => date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()

  // Popover boundary detection
  const handleMeetingClick = useCallback((date: Date, buttonElement: HTMLButtonElement) => {
    if (selectedMeeting && date.getTime() === selectedMeeting.getTime()) {
      setSelectedMeeting(null)
      return
    }
    
    const rect = buttonElement.getBoundingClientRect()
    const popoverHeight = 200
    const popoverWidth = 260
    const viewportHeight = window.innerHeight
    const viewportWidth = window.innerWidth
    
    const vertical = (viewportHeight - rect.bottom) < popoverHeight ? 'above' : 'below'
    let horizontal: 'left' | 'center' | 'right' = 'center'
    if (rect.left < popoverWidth / 2) horizontal = 'left'
    else if (viewportWidth - rect.right < popoverWidth / 2) horizontal = 'right'
    
    setPopoverPosition({ vertical, horizontal })
    setSelectedMeeting(date)
  }, [selectedMeeting])

  const googleMapsUrl = "https://www.google.com/maps/search/?api=1&query=208+E+Main+St+Lewisville+TX+75057"

  // Format helpers
  const formatLongDate = (date: Date) => date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

  return (
    <div className="terminal-window">
      {/* Scanline overlay */}
      <div className="terminal-scanlines" aria-hidden="true" />
      
      {/* Terminal chrome bar */}
      <div className="terminal-chrome">
        <div className="terminal-title">&gt; MEETINGS</div>
        <div className="terminal-buttons">
          <span className="terminal-btn terminal-btn-minimize">&#9472;</span>
          <span className="terminal-btn terminal-btn-maximize">&#9723;</span>
          <span className="terminal-btn terminal-btn-close">&#10005;</span>
        </div>
      </div>

      {/* Main content panels */}
      <div className="terminal-content">
        {/* Left panel — Meeting details */}
        <div className="terminal-panel terminal-panel-left">
          <div className="terminal-left-section">
            <div className="terminal-headline">&gt; Meets every 3rd Thursday</div>
            
            <div className="terminal-section" style={{ marginBottom: 0 }}>
              <div className="terminal-label">DATE &amp; TIME</div>
              <div className="terminal-date">{mounted ? formatLongDate(nextMeeting) : '---'}</div>
              <div className="terminal-time">7:00 PM – 9:00 PM CST</div>
            </div>
          </div>

          <div className="terminal-left-section">
            <div className="terminal-section" style={{ marginBottom: 0 }}>
              <div className="terminal-label">LOCATION</div>
              <div className="terminal-venue">{meetingConfig.location.name}</div>
              <div className="terminal-address">208 E Main St, Lewisville, TX 75057</div>
              <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="terminal-btn-directions">
                Get Directions &rarr;
              </a>
            </div>
          </div>
        </div>

        {/* Right panel — Calendar */}
        <div className="terminal-panel terminal-panel-right">
          <div className="terminal-calendar">
            <div className="terminal-calendar-header">
              <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="terminal-calendar-nav">&lt;</button>
              <span className="terminal-calendar-month">{formatMonthYear(currentDate)}</span>
              <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="terminal-calendar-nav">&gt;</button>
            </div>
            
            <div className="terminal-calendar-weekdays">
              {['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'].map((day) => (
                <span key={day} className={`terminal-weekday ${day === 'TH' ? 'highlight' : ''}`}>{day}</span>
              ))}
            </div>
            
            <div className="terminal-calendar-grid">
              {calendarDays.map(({ date, isCurrentMonth }, i) => {
                const isMeeting = isCurrentMonth && isSameDay(date, thirdThursday)
                const isToday = isSameDay(date, today)
                const past = isPast(date)
                let className = "terminal-day"
                if (!isCurrentMonth) className += " other-month"
                else if (past && !isToday) className += " past"
                if (isToday) className += " today"
                if (isMeeting) className += " meeting"

                return (
                  <button 
                    key={i}
                    className={className} 
                    onClick={(e) => isMeeting && handleMeetingClick(date, e.currentTarget)} 
                    disabled={!isMeeting}
                  >
                    {date.getDate()}
                    {isMeeting && selectedMeeting && isSameDay(selectedMeeting, date) && (
                      <div 
                        className={`terminal-popover ${popoverPosition.vertical} ${popoverPosition.horizontal}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="terminal-popover-title">Monthly Meetup</div>
                        <div className="terminal-popover-date">{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                        <div className="terminal-popover-time">7:00 PM CST</div>
                        <a href={eventsUrl} target="_blank" rel="noopener noreferrer" className="terminal-popover-rsvp">
                          RSVP &rarr;
                        </a>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Legend */}
            <div className="terminal-legend">
              <div className="terminal-legend-item">
                <span className="terminal-legend-dot" />
                <span>Monthly Meeting</span>
              </div>
            </div>
            
            {/* Today indicator */}
            <div className="terminal-today-indicator">
              &darr; Today
            </div>
          </div>
        </div>
      </div>

      {/* Bottom countdown bar */}
      <div className="terminal-countdown-bar">
        <div className="terminal-countdown-row">
          <div className="terminal-countdown-label">&bull; TIME UNTIL MEETING</div>
          <div className="terminal-countdown-value">
            {mounted ? `${countdown.days}d ${countdown.hours}h ${countdown.minutes}m ${countdown.seconds}s` : '---'}
          </div>
        </div>
        <div className="terminal-progress-track">
          <div className="terminal-progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  )
}

/* ============================================================================
   SHIELD SVG
   ============================================================================ */

function ShieldSVG({ onClick, illuminated }: { onClick?: () => void; illuminated?: boolean }) {
  return (
  <div className={`shield-container ${illuminated ? 'shield-illuminated' : ''}`} onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
  <div className="shield-bracket shield-bracket-tr" />
  <div className="shield-bracket shield-bracket-br" />
  <div className="shield-bracket shield-bracket-bl" />
  <svg viewBox="0 0 200 240" className="w-full h-full" aria-hidden="true">
  {/*
  ╔══════════════════════════════════════════════════╗
  ║  NTXCSG INTERNAL  //  NODE: DFW-NORTH            ║
  ║  If you're reading the source, you're one of us  ║
  ║  flag{s0urc3_d1v3r_d3t3ct3d}                     ║
  ║  See you the 3rd Thursday.                        ║
  ╚══════════════════════════════════════════════════╝
  */}
  <g>
  {/* Outer shield trace */}
  <path className="shield-trace" d="M100,10 L180,40 L180,130 Q180,180 100,230 Q20,180 20,130 L20,40 Z" stroke="#0D200D" strokeWidth="3" fill="none" />
  </g>
  <g>
  {/* Inner shield trace */}
  <path className="shield-trace shield-trace-delay-1" d="M100,25 L165,50 L165,125 Q165,170 100,215 Q35,170 35,125 L35,50 Z" stroke="#1A4A1A" strokeWidth="1.5" fill="none" />
  </g>
  <g>
  {/* Circuit traces */}
  <path className="shield-trace shield-trace-delay-2" d="M55,75 L100,75 L100,120 L145,120" stroke="#1A4A1A" strokeWidth="1" fill="none" />
  <path className="shield-trace shield-trace-delay-3" d="M75,95 L75,145 L125,145 L125,170" stroke="#1A4A1A" strokeWidth="1" fill="none" />
  {/* Signal trace with glow */}
  <path className="shield-signal-trace" d="M55,75 L100,75 L100,120 L145,120" strokeWidth="1.5" fill="none" />
  {/* Circuit nodes */}
  <circle className="shield-node shield-node-delay-1" cx="55" cy="75" r="4" fill="#1A4A1A" />
  <circle className="shield-node shield-node-delay-2" cx="100" cy="75" r="3" fill="#39FF14" />
  <circle className="shield-node shield-node-delay-3" cx="145" cy="120" r="4" fill="#1A4A1A" />
  <circle className="shield-node shield-node-delay-4" cx="125" cy="170" r="4" fill="#39FF14" />
  </g>
  </svg>
  </div>
  )
}

/* ============================================================================
   CURSOR TRACE
   ============================================================================ */

function CursorTrace() {
  const dotRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (window.matchMedia('(hover: none)').matches) return
    const dot = dotRef.current
    if (!dot) return
    
    let mouseX = 0, mouseY = 0, dotX = 0, dotY = 0, fadeTimer: ReturnType<typeof setTimeout>, visible = false, animationId: number
    
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX; mouseY = e.clientY
      if (!visible) { dot.style.opacity = '0.35'; visible = true }
      clearTimeout(fadeTimer)
      fadeTimer = setTimeout(() => { dot.style.opacity = '0'; visible = false }, 800)
    }
    
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t
    const loop = () => {
      dotX = lerp(dotX, mouseX, 0.12); dotY = lerp(dotY, mouseY, 0.12)
      dot.style.left = dotX + 'px'; dot.style.top = dotY + 'px'
      animationId = requestAnimationFrame(loop)
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    loop()
    return () => { document.removeEventListener('mousemove', handleMouseMove); cancelAnimationFrame(animationId); clearTimeout(fadeTimer) }
  }, [])
  
  return <div ref={dotRef} className="cursor-trace" />
}

/* ============================================================================
   UPTIME COUNTER
   ============================================================================ */

function UptimeCounter() {
  const [uptime, setUptime] = useState({ years: 0, months: 0, days: 0 })
  
  useEffect(() => {
    const calculate = () => {
      const founded = new Date('2013-02-01')
      const now = new Date()
      const diffMs = now.getTime() - founded.getTime()
      setUptime({
        years: Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365.25)),
        months: Math.floor((diffMs % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24 * 30.44)),
        days: Math.floor((diffMs % (1000 * 60 * 60 * 24 * 30.44)) / (1000 * 60 * 60 * 24))
      })
    }
    calculate()
    const interval = setInterval(calculate, 60000)
    return () => clearInterval(interval)
  }, [])
  
  return (
    <div className="uptime-line py-6 border-b" style={{ borderColor: "var(--green-dim)" }}>
      UPTIME: {uptime.years} YRS · {String(uptime.months).padStart(2, '0')} MONTHS · {String(uptime.days).padStart(2, '0')} DAYS{"  "}//{"  "}EVENTS LOGGED: {orgInfo.pastEvents}{"  "}//{"  "}MEMBERS: {orgInfo.members}
    </div>
  )
}

/* ============================================================================
   HISTORY ACCORDION
   ============================================================================ */

function HistoryAccordion() {
  const [openEra, setOpenEra] = useState<string>("2013") // First era open by default

  const toggleEra = (year: string) => {
    setOpenEra(openEra === year ? "" : year)
  }

  return (
    <div className="history-accordion">
      {historyEras.map((era) => {
        const isActive = openEra === era.year
        return (
          <div key={era.year} className={`era-item ${isActive ? 'active' : ''}`}>
            <div className="era-header" onClick={() => toggleEra(era.year)}>
              <div className="era-node" />
              <div className="era-content">
                <div className="era-year-tag">// {era.year}</div>
                <div className="era-headline">{era.headline}</div>
              </div>
              <div className="era-toggle">[{isActive ? '−' : '+'}]</div>
            </div>
            <div className="era-body-wrapper">
              <div className="era-body-content">
                <p className="era-body">{era.description}</p>
                <div className="era-log">// PERIOD: {era.year.includes('-') ? era.year.replace('-', ' – ') : `FEB ${era.year} – DEC ${era.year}`} · STATUS: ARCHIVED · {era.logEntry}</div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ============================================================================
   MAIN PAGE
   ============================================================================ */

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [showIntro, setShowIntro] = useState(true) // Start true to prevent flash
  const [introComplete, setIntroComplete] = useState(false)
  const [daysUntil, setDaysUntil] = useState(0)
  const nextMeeting = useMemo(() => getNextMeetingDate(), [])
  const heroRef = useRef<HTMLElement>(null)

  useEffect(() => {
    setMounted(true)
    const now = new Date()
    const diff = Math.ceil((nextMeeting.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    setDaysUntil(diff)
    
    // Check if intro was already seen this session
    if (sessionStorage.getItem('ntxcsg-intro-seen')) {
      setShowIntro(false)
      setIntroComplete(true)
    }
    


    // FLAG 1 — Console Message (fire exactly once per session)
    if (!sessionStorage.getItem('ntxcsg-console-fired')) {
      sessionStorage.setItem('ntxcsg-console-fired', '1')
      
      const style = {
        header: 'color:#39FF14;font-family:"Share Tech Mono",monospace;font-size:14px;font-weight:bold;',
        body: 'color:#39FF14;font-family:"Share Tech Mono",monospace;font-size:11px;line-height:1.6;',
      }

      console.log('%c[NTXCSG]', style.header)
      console.log(
        '%c v2.0.0-stable\n'
        + '[SYSTEM]  All nodes active.\n'
        + '[SYSTEM]  Uptime: ' + calcUptimeString() + ', counting.\n'
        + '[INFO]    If you\'re reading this, you\'re our kind of people.\n'
        + '[INFO]    meetup.com/NTXCSG — 3rd Thursday, 7PM\n'
        + '[WARN]    Curiosity is not a vulnerability.\n'
        + '[DEBUG]   flag{y0u_0pened_th3_c0ns0l3}',
        style.body
      )
        recordFlag(1) // Flag 1: Console
      
      // L0WJ4CK ASCII art credit (fires with the console easter egg)
      const l0wj4ckAscii = `
888      .d8888b.  888      888 888888  d8888  .d8888b.  888   d8P  
888     d88P  Y88b 888  o   888   "88b d8P888 d88P  Y88b 888  d8P   
888     888    888 888 d8b  888    888 d8P 888 888    888 888d88K    
888     888    888 888d888b 888    888 d8P  888 888    888 8888888b   
888     888    888 8888P Y8888    888 d88   888 888    888 888  Y88b  
888     888    888 888P   Y888   d88P d8888888888 888    888 888   Y88b 
888     Y88b  d88P 888    Y88  .d88P d8P     888 Y88b  d88P 888    Y88b
88888888 "Y8888P"  888     Y8 888P  d8P       888 "Y8888P"  8888888P"  
                                        .d88P                         
                                       .d88P"                          
                                      888P"                            
`
      console.log('%c' + l0wj4ckAscii, 'color:#39FF14;font-family:monospace;font-size:8px;line-height:1;')
      console.log('%c// site by L0WJ4CK — if you found this, you\'re already thinking like a hacker.', 'color:#39FF14;font-family:monospace;font-size:11px;')
    }

    // FLAG 8 — Network Tab fetch (silent, also session-guarded)
    if (!sessionStorage.getItem('ntxcsg-network-fired')) {
      sessionStorage.setItem('ntxcsg-network-fired', '1')
      fetch('/api/status')
        .then(r => r.json())
        .then(data => {
          if (data.flag) recordFlag(8) // Flag 8: Network
        })
        .catch(() => {})
    }
  }, [nextMeeting])

  const handleIntroComplete = useCallback(() => {
    setShowIntro(false)
    setIntroComplete(true)
    sessionStorage.setItem('ntxcsg-intro-seen', '1')
  }, [])

  // FLAG 3 — Konami Code
  const [showKonamiOverlay, setShowKonamiOverlay] = useState(false)
  useEffect(() => {
    const KONAMI = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]
    let konamiProgress = 0

    const handleKeydown = (e: KeyboardEvent) => {
      if (e.keyCode === KONAMI[konamiProgress]) {
        konamiProgress++
        if (konamiProgress === KONAMI.length) {
          konamiProgress = 0
          recordFlag(3) // Flag 3: Konami
          setShowKonamiOverlay(true)
          setTimeout(() => setShowKonamiOverlay(false), 2500)
        }
      } else {
        konamiProgress = e.keyCode === KONAMI[0] ? 1 : 0
      }
    }

    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [])

  // FLAG 5 — Shield rapid clicks
  const [shieldClicks, setShieldClicks] = useState(0)
  const [showShieldOverlay, setShowShieldOverlay] = useState(false)
  const shieldClickTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleShieldClick = useCallback(() => {
    setShieldClicks(prev => {
      const newCount = prev + 1
      if (shieldClickTimer.current) clearTimeout(shieldClickTimer.current)
      shieldClickTimer.current = setTimeout(() => setShieldClicks(0), 2000)
      
      if (newCount >= 10) {
        recordFlag(5) // Flag 5: Persistence
        setShowShieldOverlay(true)
        setTimeout(() => setShowShieldOverlay(false), 2500)
        return 0
      }
      return newCount
    })
  }, [])

  // FLAG 4 — Footer terminus click
  const handleFooterNodeClick = useCallback(() => {
    console.log('%c[NTXCSG]', 'color: #39FF14; font-family: monospace;')
    console.log('%c' + [
      'You found the end of the circuit.',
      'flag{b0tt0m_0f_th3_stack}',
      'Most people never scroll this far.',
    ].join('\n'), 'color: #39FF14; font-family: monospace; font-size: 11px;')
        recordFlag(4) // Flag 4: Hidden (footer circuit)
  }, [])

  // PASSIVE EASTER EGG — Tab title on idle
  useEffect(() => {
    const idleTitles = [
      'NTXCSG — North Texas Cybersecurity Group',
      'NTXCSG — Are you still there?',
      'NTXCSG — ...',
      'NTXCSG — 3rd Thursday. 7PM. Be there.',
      'NTXCSG — North Texas Cybersecurity Group',
    ]
    let idleTimer: ReturnType<typeof setTimeout>
    let titleInterval: ReturnType<typeof setInterval>
    let titleIndex = 0
    const originalTitle = document.title

    const resetIdle = () => {
      clearTimeout(idleTimer)
      clearInterval(titleInterval)
      document.title = originalTitle
      titleIndex = 0
      
      idleTimer = setTimeout(() => {
        titleInterval = setInterval(() => {
          document.title = idleTitles[titleIndex]
          titleIndex = (titleIndex + 1) % idleTitles.length
        }, 3000)
      }, 45000)
    }

    resetIdle()
    window.addEventListener('mousemove', resetIdle)
    window.addEventListener('keydown', resetIdle)

    return () => {
      clearTimeout(idleTimer)
      clearInterval(titleInterval)
      window.removeEventListener('mousemove', resetIdle)
      window.removeEventListener('keydown', resetIdle)
    }
  }, [])



  return (
    <>
      {showIntro && <IntroAnimation onComplete={handleIntroComplete} />}
      
      {/* Hide all content until intro completes to prevent flash */}
      <div style={{ visibility: introComplete ? 'visible' : 'hidden' }}>
        <div className="grain-overlay" aria-hidden="true" />
        <CursorTrace />
        
        {/* Navigation */}
        <header className="fixed top-0 left-0 right-0 z-50 nav-header">
        <div className="container mx-auto max-w-[1100px] px-6 md:px-10">
          <nav className="flex items-center justify-between h-14 md:h-16" aria-label="Main navigation">
            <a href="#" aria-label="NTXCSG Home">
              <img src="/NTXCSG_ONLYLETTERS.svg" alt="NTXCSG" className="h-7 md:h-8 w-auto" />
            </a>
            <div className="hidden md:flex items-center gap-6">
              <a href="#calendar" className="nav-link">Meetings</a>
              <a href="#history" className="nav-link">History</a>
              <a href="#faq" className="nav-link">Briefing</a>
              <a href={socialLinks.meetup.url} target="_blank" rel="noopener noreferrer" className="btn-nav">Join</a>
            </div>
            <button className="md:hidden p-2 -mr-2" aria-label="Open menu" onClick={() => document.getElementById('mobile-nav')?.classList.toggle('hidden')}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
            </button>
          </nav>
          <div id="mobile-nav" className="hidden md:hidden pb-4 border-t" style={{ borderColor: "var(--green-dim)" }}>
            <div className="flex flex-col gap-3 pt-4">
              <a href="#calendar" className="nav-link py-2">Meetings</a>
              <a href="#history" className="nav-link py-2">History</a>
              <a href="#faq" className="nav-link py-2">Briefing</a>
              <a href={socialLinks.meetup.url} target="_blank" rel="noopener noreferrer" className="btn-nav inline-block text-center mt-2">Join on Meetup</a>
            </div>
          </div>
        </div>
      </header>

      <main id="main-content" className="min-h-screen pt-14 md:pt-16">
        {/* ================================================================ */}
        {/* 1. HERO — Background A (primary)                                */}
        {/* ================================================================ */}
        <section ref={heroRef} className="relative min-h-[90vh] flex items-center clip-corner-double overflow-hidden" style={{ background: "var(--bg-primary)" }}>
          <div className="hero-pcb-bg" aria-hidden="true" />
          
          {/* Shield - absolutely positioned on md+ screens */}
          <div className="hidden md:block">
            <ShieldSVG onClick={handleShieldClick} illuminated={showKonamiOverlay || showShieldOverlay} />
          </div>
          
          {/* Konami Code Overlay (FLAG 3) */}
          {showKonamiOverlay && (
            <div className="ctf-overlay">
              <div className="ctf-overlay-text" style={{ color: "#39FF14" }}>// ACCESS GRANTED</div>
              <div className="ctf-overlay-flag" style={{ color: "#1C4A1A" }}>flag&#123;k0nam1_h4ck3r&#125;</div>
            </div>
          )}
          
          {/* Shield Rapid Click Overlay (FLAG 5) */}
          {showShieldOverlay && (
            <div className="ctf-overlay">
{/* Intentional: CTF overlay uses fixed sizes for dramatic effect */}
                  <div className="ctf-overlay-text" style={{ color: "var(--red)", fontSize: "var(--text-label)" }}>UNAUTHORIZED ACCESS ATTEMPT DETECTED</div>
                  <div className="ctf-overlay-close">[×]</div>
                  <div className="ctf-overlay-text" style={{ color: "var(--gray-dim)", fontStyle: "italic", fontSize: "var(--text-caption)" }}>nice persistence though</div>
            </div>
          )}
          
          <div className="container mx-auto max-w-[1100px] px-6 md:px-10 py-20 relative z-10">
            
            {/* Shield - in flow on mobile, hidden on md+ */}
            <div className="md:hidden flex justify-center">
              <ShieldSVG onClick={handleShieldClick} illuminated={showKonamiOverlay || showShieldOverlay} />
            </div>
            
            <div className="status-badge mb-8">
              <span className="status-node" />
              <span className="status-trace" />
              <span className="status-label">[ {heroContent.badgeLabel} ]</span>
            </div>
            
            <div className="mb-8 w-full max-w-[480px] md:max-w-[560px] lg:max-w-[640px]">
              <img 
                src="/NTXCSG_LETTERSwithSUBTEXT.svg" 
                alt="NTXCSG - North Texas Cybersecurity Group" 
                className="w-full h-auto"
                style={{ opacity: 0.92 }}
              />
            </div>
            
            <div className="tagline-rail mb-10 w-full max-w-[480px] md:max-w-[560px] lg:max-w-[640px]">
              <p className="text-[17px] md:text-[18px]" style={{ color: "var(--gray)", lineHeight: 1.75 }}>{heroContent.tagline}</p>
              <span className="end-node" />
            </div>
            
            <div className="flex flex-wrap gap-4 mb-12 w-full max-w-[480px] md:max-w-[560px] lg:max-w-[640px]">
              <a href={socialLinks.meetup.url} target="_blank" rel="noopener noreferrer" className="btn-primary">{heroContent.ctaPrimary}</a>
              <a href="#calendar" className="btn-secondary">NEXT MEETING <span className="arrow" aria-hidden="true">&#8595;</span></a>
            </div>
          </div>
          
          {/* Hero bottom fade + circuit trace divider */}
          <div className="hero-fade-divider" aria-hidden="true">
            <svg className="hero-circuit-trace" viewBox="0 0 1200 24" preserveAspectRatio="none">
              <path d="M0,12 L200,12 L220,6 L280,6 L300,12 L500,12 L510,18 L540,18 L550,12 L700,12 L720,6 L760,6 L780,12 L1000,12 L1020,6 L1080,6 L1100,12 L1200,12" 
                    stroke="var(--green-dim)" strokeWidth="1" fill="none" opacity="0.4" />
              <circle cx="220" cy="6" r="2" fill="var(--green-dim)" opacity="0.5" />
              <circle cx="550" cy="12" r="2" fill="var(--green)" opacity="0.6" />
              <circle cx="780" cy="12" r="2" fill="var(--green-dim)" opacity="0.5" />
              <circle cx="1100" cy="12" r="2" fill="var(--green-dim)" opacity="0.5" />
            </svg>
          </div>
        </section>

        {/* ================================================================ */}
        {/* 2. MEETINGS — Background B (elevated)                            */}
        {/* ================================================================ */}
        <SectionDivider position="left" />
        <section id="calendar" className="relative py-16 md:py-20 px-4 md:px-10 scroll-mt-20" style={{ background: "var(--bg-primary)" }}>
          <div className="container mx-auto max-w-[1100px] relative z-10">
            <MeetingsTerminal />
          </div>
        </section>

        {/* ================================================================ */}
        {/* 3. BUILT BY PRACTITIONERS — Background A (primary)               */}
        {/* ================================================================ */}
        <SectionDivider position="right" />
        <section className="relative px-6 md:px-10 section--standard overflow-hidden" style={{ background: "var(--bg-primary)" }}>
          <div className="section-pcb-grid" aria-hidden="true" />

          {/* Sub-section: WHY WE EXIST — Background B (elevated) */}
          <div className="practitioners-subsection" style={{ background: "var(--bg-elevated)" }}>
            <SectionDivider position="left" />
            <div className="container mx-auto max-w-[1100px] py-16 md:py-20">
              <TraceDivider />
              <Section>
                <SectionLabel>{sectionLabels.mission}</SectionLabel>
                <h3 className="text-2xl md:text-3xl font-bold mb-10" style={{ fontFamily: "var(--font-display)" }}>WHY WE EXIST</h3>
              </Section>
              
              <WhyWeExistCarousel />
            </div>
          </div>

          {/* Sub-section: THE RECORD — Background A (primary) */}
  <div id="history" className="practitioners-subsection scroll-mt-20" style={{ background: "var(--bg-primary)" }}>
  <SectionDivider position="right" />
  <div className="container mx-auto max-w-[1100px] py-16 md:py-20">
  <TraceDivider />
              <Section>
                <SectionLabel>{sectionLabels.history}</SectionLabel>
                <h3 className="text-2xl md:text-3xl font-bold mb-10" style={{ fontFamily: "var(--font-display)" }}>THE RECORD</h3>
              </Section>
              
              <HistoryAccordion />
              
              <Section delay={300}>
                {/* Intentional: Caption text for section closing */}
                <div className="text-center mt-12" style={{ fontFamily: "var(--font-data)", fontSize: "var(--text-caption)", color: "var(--green-dim)" }}>
                  // {historyClosing}
                </div>
              </Section>
            </div>
          </div>

          {/* Sub-section: CTF — Background B (elevated) */}
          <div className="practitioners-subsection ctf-section" style={{ background: "var(--bg-elevated)" }}>
            {/* CRT scanline overlay scoped to this section */}
            <div className="ctf-scanlines" aria-hidden="true" />
            <SectionDivider position="left" />
            <div className="container mx-auto max-w-[1100px] py-16 md:py-20">
              <TraceDivider />
              <Section>
                <SectionLabel>// CHALLENGE</SectionLabel>
                <h3 className="text-2xl md:text-3xl font-bold mb-10" style={{ fontFamily: "var(--font-display)" }}>CAPTURE THE FLAG</h3>
              </Section>
              
              {/* Terminal + CTA as one cohesive unit */}
              <Section delay={100}>
                <div className="ctf-unit">
                  <div className="ctf-terminal">
                    <div className="ctf-terminal-header">
                      <span className="ctf-terminal-dot ctf-dot-red" />
                      <span className="ctf-terminal-dot ctf-dot-yellow" />
                      <span className="ctf-terminal-dot ctf-dot-green" />
                    </div>
                    <div className="ctf-terminal-body">
                      <div className="ctf-prompt">
                        <span className="ctf-prompt-user">root@ntxcsg</span>
                        <span className="ctf-prompt-separator">:</span>
                        <span className="ctf-prompt-path">~</span>
                        <span className="ctf-prompt-symbol">$</span>
                        <span className="ctf-prompt-command"> ./ctf --status</span>
                      </div>
                      <div className="ctf-output">
                        <div className="ctf-output-line">&gt; 9 flags. Hidden in plain sight.</div>
                        <div className="ctf-output-line">&gt; Can you find them all?<span className="ctf-cursor" /></div>
                      </div>
                    </div>
                  </div>
                  
                  <a href="/ctf" className="ctf-cta-full">
                    <span className="ctf-cta-full-prompt">&gt;</span>
                    <span className="ctf-cta-full-text">Enter the CTF</span>
                    <span className="ctf-cta-full-arrow">&rarr;</span>
                  </a>
                </div>
              </Section>
            </div>
          </div>

          {/* Sub-section: MEET THE ORGANIZER — Background A (primary) */}
          <div className="practitioners-subsection" style={{ background: "var(--bg-primary)" }}>
            <SectionDivider position="right" />
            <div className="container mx-auto max-w-[1100px] py-16 md:py-20">
              <TraceDivider />
              <Section>
                <SectionLabel>// LEADERSHIP</SectionLabel>
                <h3 className="text-2xl md:text-3xl font-bold mb-10" style={{ fontFamily: "var(--font-display)" }}>MEET THE ORGANIZER</h3>
              </Section>
              
              <Section delay={100}>
                <div className="organizer-card">
                  {/* Photo */}
                  <div className="organizer-photo">
                    <img 
                      src="/images/darin-fredde.png" 
                      alt="Darin Fredde" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Info */}
                  <div className="organizer-info">
                    <div className="organizer-name">Darin Fredde</div>
                    <div className="organizer-title">NTXCSG Founder &amp; Host</div>
  <p className="organizer-bio">
  Security practitioner with over two decades in the industry. Founded NTXCSG in 2013 to give DFW security professionals a space to learn, share, and connect.
  </p>
                  </div>
                  
                  {/* LinkedIn button — positioned on right side on desktop */}
                  <a 
                    href="https://www.linkedin.com/in/darinfredde/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="organizer-linkedin"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="organizer-linkedin-icon">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    <span>Connect on LinkedIn</span>
                  </a>
                </div>
              </Section>
            </div>
          </div>

          {/* Sub-section: THE NETWORK — Background B (elevated) */}
          <div className="practitioners-subsection" style={{ background: "var(--bg-elevated)" }}>
            <SectionDivider position="left" />
            <div className="container mx-auto max-w-[1100px] py-16 md:py-20">
              <TraceDivider />
              <Section>
                <SectionLabel>{sectionLabels.connect}</SectionLabel>
                <h3 className="text-2xl md:text-3xl font-bold mb-10" style={{ fontFamily: "var(--font-display)" }}>THE NETWORK</h3>
              </Section>
              
              <div className="network-grid">
                {/* Left column — NTXCSG Social Links */}
                <div className="network-social">
                  <div className="network-social-label">Connect with NTXCSG</div>
                  <div className="network-social-icons" style={{ gap: "20px" }}>
                    {/* LinkedIn */}
                    <a href={socialLinks.linkedin.url} target="_blank" rel="noopener noreferrer" className="social-icon-btn" aria-label="LinkedIn">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </a>
                    {/* X/Twitter */}
                    <a href={socialLinks.twitter.url} target="_blank" rel="noopener noreferrer" className="social-icon-btn" aria-label="X / Twitter">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    </a>
                    {/* Facebook */}
                    <a href={socialLinks.facebook.url} target="_blank" rel="noopener noreferrer" className="social-icon-btn" aria-label="Facebook">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </a>
                  </div>
                </div>

                {/* Right column — DFW Infosec Community */}
                <div className="network-community">
                  <div className="network-community-label">DFW Infosec Community</div>
                  <div className="community-grid">
                    {/* DC940 */}
                    <a href="https://dc940.org" target="_blank" rel="noopener noreferrer" className="community-tile community-tile-logo" aria-label="DC940 - DEF CON Group 940">
                      <img src="/logos/dc940.png" alt="" className="community-logo" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('sr-only') }} />
                      <span className="community-tile-text community-fallback sr-only">DC940</span>
                      <span className="community-tile-label">DC940</span>
                    </a>
                    {/* DC214 */}
                    <a href="https://dc214.org" target="_blank" rel="noopener noreferrer" className="community-tile community-tile-logo" aria-label="DC214 - DEF CON Group 214">
                      <img src="/logos/dc214.png" alt="" className="community-logo" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('sr-only') }} />
                      <span className="community-tile-text community-fallback sr-only">DC214</span>
                      <span className="community-tile-label">DC214</span>
                    </a>
                    {/* Dallas Hackers Association */}
                    <a href="https://www.meetup.com/dallas-hackers-association/events/" target="_blank" rel="noopener noreferrer" className="community-tile community-tile-logo" aria-label="Dallas Hackers Association">
                      <img src="/logos/dha.png" alt="" className="community-logo" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('sr-only') }} />
                      <span className="community-tile-text community-fallback sr-only">DHA</span>
                      <span className="community-tile-label">Dallas Hackers</span>
                    </a>
                    {/* UNT Cyber Club */}
                    <a href="https://untcsc.github.io/" target="_blank" rel="noopener noreferrer" className="community-tile community-tile-logo" aria-label="UNT Cyber Security Club">
                      <img src="/logos/unt-cyber.png" alt="" className="community-logo" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('sr-only') }} />
                      <span className="community-tile-text community-fallback sr-only">UNT Cyber</span>
                      <span className="community-tile-label">UNT Cyber</span>
                    </a>
                    {/* NTXISSA */}
                    <a href="https://ntxissa.org" target="_blank" rel="noopener noreferrer" className="community-tile community-tile-logo" aria-label="North Texas ISSA Chapter">
                      <img src="/logos/ntxissa.png" alt="" className="community-logo" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('sr-only') }} />
                      <span className="community-tile-text community-fallback sr-only">NTXISSA</span>
                      <span className="community-tile-label">NTXISSA</span>
                    </a>
                    {/* WOSEC Dallas */}
                    <a href="https://www.womenofsecurity.com/" target="_blank" rel="noopener noreferrer" className="community-tile community-tile-logo" aria-label="Women of Security Dallas">
                      <img src="/logos/wosec.png" alt="" className="community-logo" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('sr-only') }} />
                      <span className="community-tile-text community-fallback sr-only">WOSEC</span>
                      <span className="community-tile-label">WOSEC Dallas</span>
                    </a>
                    {/* Dallas 2600 */}
                    <a href="https://2600.com" target="_blank" rel="noopener noreferrer" className="community-tile community-tile-logo" aria-label="Dallas 2600 Meeting">
                      <img src="/logos/2600.png" alt="" className="community-logo" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('sr-only') }} />
                      <span className="community-tile-text community-fallback sr-only">2600</span>
                      <span className="community-tile-label">Dallas 2600</span>
                    </a>
                    {/* UTD Cyber Club */}
                    <a href="https://www.linkedin.com/company/cscutd/" target="_blank" rel="noopener noreferrer" className="community-tile community-tile-logo" aria-label="UTD Cyber Security Club">
                      <img src="/logos/utd.png" alt="" className="community-logo" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('sr-only') }} />
                      <span className="community-tile-text community-fallback sr-only">UTD CSC</span>
                      <span className="community-tile-label">UTD Cyber</span>
                    </a>
                  </div>
                  <a href="https://t.co/PAjYnF6EdX" target="_blank" rel="noopener noreferrer" className="community-more">
                    + And many more &rarr;
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Sub-section: BRIEFING — Background A (primary) */}
          <div id="faq" className="practitioners-subsection scroll-mt-20" style={{ background: "var(--bg-primary)" }}>
            <SectionDivider position="right" />
            <div className="container mx-auto max-w-[1100px] py-16 md:py-20">
              <TraceDivider />
              <Section>
                <SectionLabel>{sectionLabels.faq}</SectionLabel>
                <h3 className="text-2xl md:text-3xl font-bold mb-10" style={{ fontFamily: "var(--font-display)" }}>BRIEFING</h3>
              </Section>
              
              <div className="briefing-grid">
                {faqItems.map((item, i) => (
                  <Section key={i} delay={i * 40} type="snap">
                    <div className="briefing-card">
                      <div className="briefing-card-accent" />
                      <h4 className="briefing-card-question">{item.question}</h4>
                      <p className="briefing-card-answer">
                        {item.answer}
                        {item.link && (
                          <>
                            {" "}
                            <a href={item.link.url} target="_blank" rel="noopener noreferrer" className="briefing-card-link">
                              {item.link.text} &rarr;
                            </a>
                          </>
                        )}
                      </p>
                    </div>
                  </Section>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* FOOTER — Background B (elevated)                                */}
        {/* ================================================================ */}
        <SectionDivider position="left" />
        <footer className="pt-16 pb-12 md:pt-16 md:pb-12 px-6 md:px-10" style={{ background: "var(--bg-elevated)" }}>
          <div className="container mx-auto max-w-[1100px]">
            
            {/* Upper Footer — Two Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-12 md:gap-12 mb-10">
              
              {/* Left Column — Logo + Mission */}
              <div>
                <img 
                  src="/NTXCSG_fulllogo_white.png" 
                  alt="NTXCSG - North Texas Cybersecurity Group" 
                  className="w-[180px] h-auto mb-5"
                />
                <p className="text-[13px] leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
                  A practitioner-led cybersecurity community in the Dallas-Fort Worth area. Open to all skill levels. Travelers welcome.
                </p>
              </div>
              
              {/* Right Column — Nav + Community */}
              <div className="grid grid-cols-2 gap-8 md:gap-12">
                
                {/* Sub-column A — Navigate */}
                <div>
                  <h4 
                    className="text-[11px] uppercase tracking-[0.15em] mb-4" 
                    style={{ fontFamily: "var(--font-display)", color: "rgba(57, 255, 20, 0.6)" }}
                  >
                    Navigate
                  </h4>
                  <nav className="flex flex-col gap-3">
                    <a href="#calendar" className="text-[14px] transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.7)" }}>Meetings</a>
                    <a href="#practitioners" className="text-[14px] transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.7)" }}>Why We Exist</a>
                    <a href="#history" className="text-[14px] transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.7)" }}>Our History</a>
                    <a href="#ctf" className="text-[14px] transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.7)" }}>CTF</a>
                    <a href="#network" className="text-[14px] transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.7)" }}>The Network</a>
                  </nav>
                </div>
                
                {/* Sub-column B — Community */}
                <div>
                  <h4 
                    className="text-[11px] uppercase tracking-[0.15em] mb-4" 
                    style={{ fontFamily: "var(--font-display)", color: "rgba(57, 255, 20, 0.6)" }}
                  >
                    Community
                  </h4>
                  <nav className="flex flex-col gap-3">
                    {Object.values(socialLinks).map((link) => (
                      <a 
                        key={link.label} 
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-[14px] transition-colors hover:text-white" 
                        style={{ color: "rgba(255,255,255,0.7)" }}
                      >
                        {link.label}
                      </a>
                    ))}
                  </nav>
                </div>
              </div>
            </div>
            
            {/* Circuit Trace Divider */}
            <div className="relative my-10">
              <div className="w-full h-px" style={{ background: "rgba(57, 255, 20, 0.2)" }} />
              {/* CTF FLAG 4 TRIGGER — DO NOT REMOVE */}
              <button 
                onClick={handleFooterNodeClick}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full cursor-pointer transition-all hover:scale-150"
                style={{ background: "rgba(57, 255, 20, 0.4)" }}
                aria-label="Circuit node"
              />
            </div>
            
            {/* Bottom Bar */}
            <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
              
              {/* Left — Copyright (centered on mobile, left on desktop) */}
              <span className="text-[12px] order-2 md:order-1 text-center md:text-left" style={{ color: "rgba(255,255,255,0.4)" }}>
                &copy; {new Date().getFullYear()} NTXCSG &middot; All rights reserved
              </span>
              
              {/* Center — L0WJ4CK Signature */}
              <div className="flex flex-col items-center justify-center order-1 md:order-2 text-center">
                <a 
                  href="https://www.linkedin.com/in/jacksongiddens/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="group flex flex-col items-center transition-all"
                >
                  <img 
                    src="/l0wj4ck_signature.svg" 
                    alt="L0WJ4CK" 
                    className="w-[260px] md:w-[340px] h-auto opacity-50 transition-all duration-300 group-hover:opacity-100"
                    style={{ filter: "drop-shadow(0 0 0px transparent)" }}
                    onMouseEnter={(e) => e.currentTarget.style.filter = "drop-shadow(0 0 8px rgba(57, 255, 20, 0.6))"}
                    onMouseLeave={(e) => e.currentTarget.style.filter = "drop-shadow(0 0 0px transparent)"}
                  />
                  <span 
                    className="text-[11px] mt-2 text-center" 
                    style={{ fontFamily: "var(--font-mono)", color: "rgba(255,255,255,0.3)" }}
                  >
                    // designed &amp; built by L0WJ4CK
                  </span>
                </a>
              </div>
              
              {/* Right — Placeholder for future link (hidden on mobile) */}
              <span className="text-[12px] order-3 hidden md:block md:text-right" style={{ color: "rgba(255,255,255,0.2)", minWidth: "140px" }}>
                {/* Reserved for privacy policy or similar */}
              </span>
            </div>
          </div>
        </footer>
      </main>
      </div>
    </>
  )
}
