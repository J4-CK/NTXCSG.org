import type React from "react"
import type { Metadata } from "next"
import { IBM_Plex_Sans, Barlow_Condensed } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
})

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-display",
  display: "swap",
})

export const metadata: Metadata = {
  title: "NTXCSG — North Texas Cyber Security Group",
  description:
    "Join 1,600+ security professionals, students, and enthusiasts in the Dallas-Fort Worth area. Monthly meetups since 2013. Free, community-run, all skill levels welcome.",
  keywords: ["cybersecurity", "infosec", "security", "north texas", "DFW", "Lewisville", "meetup", "community", "hacking", "penetration testing", "blue team", "red team"],
  authors: [{ name: "NTXCSG" }],
  creator: "North Texas Cyber Security Group",
  publisher: "NTXCSG",
  generator: "v0.app",
  metadataBase: new URL("https://ntxcsg.org"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ntxcsg.org",
    siteName: "NTXCSG",
    title: "NTXCSG — North Texas Cyber Security Group",
    description: "Join 1,600+ security professionals in the Dallas-Fort Worth area. Monthly meetups since 2013. Free, community-run, all skill levels welcome.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "NTXCSG - North Texas Cyber Security Group",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@ntxcsg",
    creator: "@ntxcsg",
    title: "NTXCSG — North Texas Cyber Security Group",
    description: "Join 1,600+ security professionals in the Dallas-Fort Worth area. Monthly meetups since 2013.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0A0A0A",
}

// JSON-LD structured data for organization
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "North Texas Cyber Security Group",
  alternateName: "NTXCSG",
  url: "https://ntxcsg.org",
  logo: "https://ntxcsg.org/og-image.png",
  foundingDate: "2013-02",
  description: "A practitioner-led cybersecurity community in the Dallas-Fort Worth area. Monthly meetups since 2013.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Lewisville",
    addressRegion: "TX",
    addressCountry: "US",
  },
  sameAs: [
    "https://www.meetup.com/NTXCSG/",
    "https://x.com/ntxcsg",
    "https://www.linkedin.com/groups/12028350/",
    "https://www.facebook.com/groups/316780319566510/",
  ],
  event: {
    "@type": "Event",
    name: "NTXCSG Monthly Meetup",
    description: "Monthly cybersecurity meetup for practitioners of all skill levels.",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    isAccessibleForFree: true,
    organizer: {
      "@type": "Organization",
      name: "NTXCSG",
      url: "https://ntxcsg.org",
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-[#0A0A0A] scroll-smooth">
      <head>
        {/* JSON-LD structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Audiowide + Share Tech Mono via Google Fonts link (not available in next/font) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Audiowide&family=Share+Tech+Mono&display=swap" 
          rel="stylesheet" 
        />
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/NTXCSG_shield.svg" type="image/svg+xml" />
      </head>
      <body className={`font-sans antialiased ${ibmPlexSans.variable} ${barlowCondensed.variable}`}>
        {/*
        
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

// site by L0WJ4CK — if you found this, you're already thinking like a hacker.

        */}
        {/* Skip to content link for accessibility */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#39FF14] focus:text-black focus:font-bold"
        >
          Skip to main content
        </a>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
