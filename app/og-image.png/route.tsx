import { ImageResponse } from "next/og"

export const runtime = "edge"

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0A0A0A",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Background grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.05,
            backgroundImage: "linear-gradient(#39FF14 1px, transparent 1px), linear-gradient(90deg, #39FF14 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        
        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 24,
          }}
        >
          {/* Wordmark */}
          <div
            style={{
              fontSize: 120,
              fontWeight: 900,
              letterSpacing: "-0.02em",
              display: "flex",
            }}
          >
            <span style={{ color: "#FFFFFF" }}>NTX</span>
            <span style={{ color: "#CC0000" }}>CSG</span>
          </div>
          
          {/* Tagline */}
          <div
            style={{
              fontSize: 28,
              color: "#666666",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            North Texas Cyber Security Group
          </div>
          
          {/* Stats line */}
          <div
            style={{
              display: "flex",
              gap: 32,
              marginTop: 20,
              fontSize: 18,
              color: "#39FF14",
              letterSpacing: "0.1em",
            }}
          >
            <span>EST. 2013</span>
            <span>•</span>
            <span>1,600+ MEMBERS</span>
            <span>•</span>
            <span>128+ EVENTS</span>
          </div>
        </div>
        
        {/* Circuit node decoration */}
        <div
          style={{
            position: "absolute",
            bottom: 60,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#39FF14",
            }}
          />
          <div
            style={{
              width: 100,
              height: 1,
              background: "#1A4A1A",
            }}
          />
          <div
            style={{
              fontSize: 14,
              color: "#1A4A1A",
              letterSpacing: "0.15em",
            }}
          >
            MONTHLY MEETUPS IN DFW
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
