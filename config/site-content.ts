/**
 * NTXCSG Website Content Configuration
 * "Live Circuit" PCB Theme
 *
 * North Texas Cyber Security Group (NTXCSG)
 * Every element connected. Just like the community.
 */


// ============================================================================
// ORGANIZATION INFO
// ============================================================================

export const orgInfo = {
  name: "North Texas Cyber Security Group",
  shortName: "NTXCSG",
  founded: 2013,
  foundedMonth: "February 2013",
  location: "Lewisville, TX",
  region: "Dallas-Fort Worth",
  members: "1,600+",
  pastEvents: "128+",
  rating: "4.8",
  organizer: "Darin F.",
  founder: "Don Ngo",
}

// ============================================================================
// HERO CONTENT (Circuit Theme)
// ============================================================================

export const heroContent = {
  badgeLabel: "ACTIVE",
  tagline: "A practitioner-led information security community in the Dallas-Fort Worth area. Monthly meetups. Real talks. Real community.",
  ctaPrimary: "JOIN THE GROUP",
  ctaScroll: "NEXT MEETING",
}

// ============================================================================
// MEETING INFORMATION
// ============================================================================

export const meetingConfig = {
  schedule: {
    dayOfWeek: "Thursday" as const,
    weekOfMonth: 3, // 3rd Thursday
    time: "7:00 PM CDT",
    description: "3rd Thursday of each month",
  },
  location: {
    name: "Greater DFW / Lewisville area",
    note: "Exact address visible to Meetup members",
  },
}

// Helper to get next 3rd Thursday
export function getNextMeetingDate(): Date {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  function getThirdThursday(year: number, month: number): Date {
    const firstDay = new Date(year, month, 1)
    const firstThursday = new Date(firstDay)
    const daysUntilThursday = (4 - firstDay.getDay() + 7) % 7
    firstThursday.setDate(1 + daysUntilThursday)
    const thirdThursday = new Date(firstThursday)
    thirdThursday.setDate(firstThursday.getDate() + 14)
    thirdThursday.setHours(19, 0, 0, 0)
    return thirdThursday
  }

  let nextMeeting = getThirdThursday(currentYear, currentMonth)

  if (now > nextMeeting) {
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear
    nextMeeting = getThirdThursday(nextYear, nextMonth)
  }

  return nextMeeting
}

// ============================================================================
// UPCOMING EVENTS
// ============================================================================

export const upcomingEvents = [
  { date: "MAR 19, 2026", title: "NTXCSG Monthly Meetup", url: "https://www.meetup.com/NTXCSG/events/" },
  { date: "APR 16, 2026", title: "NTXCSG Monthly Meetup", url: "https://www.meetup.com/NTXCSG/events/" },
  { date: "MAY 21, 2026", title: "NTXCSG Monthly Meetup", url: "https://www.meetup.com/NTXCSG/events/" },
]

// ============================================================================
// MISSION PILLARS (Carousel Cards)
// ============================================================================

export const missionPillars = [
  { 
    title: "Learn", 
    text: "Learn offensive and defensive cybersecurity concepts",
    icon: "terminal" // Terminal/command prompt icon
  },
  { 
    title: "Enrich", 
    text: "Enrich professional skills through collaborative and interactive forums",
    icon: "chip" // Circuit/chip icon
  },
  { 
    title: "Stay Current", 
    text: "Stay current on security industry trends and developments",
    icon: "radar" // Radar/scanning icon
  },
  { 
    title: "Promote", 
    text: "Promote awareness of sound privacy and security practices",
    icon: "shield" // Shield/security icon
  },
  { 
    title: "Share", 
    text: "Share employment and project opportunities",
    icon: "network" // Network/connection icon
  },
  { 
    title: "Community First", 
    text: "Supporting our local community — and travelers are always welcome",
    icon: "nodes" // Node cluster icon
  },
]

// ============================================================================
// SOCIAL LINKS (as channels)
// ============================================================================

export const socialLinks = {
  meetup: {
    url: "https://www.meetup.com/NTXCSG/",
    label: "Meetup",
    channel: "CH-01",
  },
  linkedin: {
    url: "https://www.linkedin.com/groups/12028350/",
    label: "LinkedIn",
    channel: "CH-02",
  },
  twitter: {
    url: "https://x.com/ntxcsg",
    label: "X / Twitter",
    channel: "CH-03",
  },
  facebook: {
    url: "https://www.facebook.com/groups/316780319566510/",
    label: "Facebook",
    channel: "CH-04",
  },
}

export const eventsUrl = "https://www.meetup.com/NTXCSG/events/"

// ============================================================================
// HISTORY ERAS (Circuit Log Format)
// ============================================================================

export const historyEras = [
  {
    year: "2013",
    headline: "FIRST MEETING",
    description:
      "Don Ngo and a small group of DFW security professionals decided the metroplex needed its own practitioner-led community. The first meetups were small, technically dense, and intentionally practitioner-focused. The Meetup group and Twitter account both launched in February 2013.",
    logEntry: "EVENTS: 12",
    isHighlight: true,
  },
  {
    year: "2014-2016",
    headline: "MONTHLY CADENCE ESTABLISHED",
    description:
      "The monthly cadence locked in. Topics ranged from offensive techniques to defensive architecture to the emerging ransomware threat landscape. The group began live-streaming on Twitter/Periscope, extending reach beyond the room.",
    logEntry: "FIRETALK FORMAT",
  },
  {
    year: "2017-2019",
    headline: "GAINING GROUND",
    description:
      "NTXCSG became a fixture in the North Texas security community—the place where practitioners went to hear real talks from people doing the work. Topics expanded into ICS/SCADA, API security, cloud architecture, and social engineering.",
    logEntry: "TOPICS EXPANDED",
  },
  {
    year: "2020-2022",
    headline: "THROUGH THE DISRUPTION",
    description:
      "The group adapted and continued through challenging times. Monthly meetups persisted. The community that had been built over seven years proved resilient—members kept showing up, kept sharing knowledge, kept supporting each other.",
    logEntry: "CADENCE HELD",
  },
  {
    year: "2023-NOW",
    headline: "STILL RUNNING",
    description:
      "Leadership transitioned to Darin F. and the current organizer team. The group crossed 1,600 members. 128+ events logged. The community that started in 2013 has now outlasted most of the companies, tools, and threats discussed at the first meetings.",
    logEntry: "1,600+ MEMBERS · 128+ EVENTS · ACTIVE",
  },
]

export const historyClosing = "13 years · 128+ events · 1,600+ members · still active"

// ============================================================================
// SECTION LABELS
// ============================================================================

export const sectionLabels = {
  upcomingMeetups: "[ 02 / UPCOMING MEETUPS ]",
  mission: "[ 03 / WHY WE EXIST ]",
  history: "[ 04 / THE RECORD ]",
  connect: "[ 05 / THE NETWORK ]",
  faq: "[ 06 / BRIEFING ]",
}

// ============================================================================
// FAQ
// ============================================================================

export const faqItems = [
  {
    question: "Is there a cost to attend?",
    answer: "No. NTXCSG meetups are completely free. We're a volunteer-run community group.",
  },
  {
    question: "Do I need to be an expert?",
    answer: "Not at all. We welcome everyone from students to seasoned pros. Just bring genuine interest.",
  },
  {
    question: "What happens at a meetup?",
    answer: "Technical presentations from community members, followed by open discussion and networking.",
  },
  {
    question: "What's the vibe like?",
    answer: "Casual and welcoming. We meet at Main Street Cafe in downtown Lewisville — food, drinks, and good company included.",
    link: { text: "View the menu", url: "https://mainstreetcafe.ai/#menu-list" },
  },
  {
    question: "Where do you meet?",
    answer: "Main Street Cafe in downtown Lewisville. The exact address is shared with Meetup members before each event.",
  },
  {
    question: "How do I present a topic?",
    answer: "We're always looking for speakers. Reach out via Meetup or any of our social channels.",
  },
]
