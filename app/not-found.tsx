import Link from "next/link"

export default function NotFound() {
  return (
    <main 
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: "var(--black)" }}
    >
      <div className="text-center max-w-md">
        {/* Error code */}
        <div 
          className="text-8xl md:text-9xl font-black mb-4"
          style={{ 
            fontFamily: "var(--font-hero)", 
            color: "var(--green-dim)",
            letterSpacing: "-0.02em"
          }}
        >
          404
        </div>
        
        {/* Message */}
        <h1 
          className="text-2xl md:text-3xl font-bold mb-4"
          style={{ fontFamily: "var(--font-display)", color: "var(--white)" }}
        >
          SIGNAL NOT FOUND
        </h1>
        
        <p 
          className="mb-8"
          style={{ color: "var(--gray)", fontSize: "15px", lineHeight: 1.7 }}
        >
          The page you are looking for does not exist or has been moved.
        </p>
        
        {/* Back link */}
        <Link 
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 font-bold text-sm tracking-wider uppercase transition-all"
          style={{ 
            fontFamily: "var(--font-data)",
            background: "var(--green)",
            color: "var(--black)",
          }}
        >
          Return to Home
        </Link>
        
        {/* Circuit decoration */}
        <div 
          className="mt-12 mx-auto"
          style={{ width: "60px" }}
        >
          <div 
            className="h-px mb-2"
            style={{ background: "var(--green-dim)" }}
          />
          <div 
            className="w-2 h-2 rounded-full mx-auto"
            style={{ background: "var(--green)" }}
          />
        </div>
      </div>
    </main>
  )
}
