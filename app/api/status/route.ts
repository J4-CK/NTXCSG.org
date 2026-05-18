import { NextResponse } from "next/server"

export async function GET() {
  // Calculate uptime from Feb 2013
  const founded = new Date("2013-02-01")
  const now = new Date()
  const uptimeDays = Math.floor((now.getTime() - founded.getTime()) / (1000 * 60 * 60 * 24))

  // Get next 3rd Thursday
  function getNextThirdThursday(): string {
    const today = new Date()
    let year = today.getFullYear()
    let month = today.getMonth()

    for (let i = 0; i < 12; i++) {
      let count = 0
      for (let day = 1; day <= 31; day++) {
        const d = new Date(year, month, day)
        if (d.getMonth() !== month) break
        if (d.getDay() === 4) {
          count++
          if (count === 3) {
            d.setHours(19, 0, 0, 0)
            if (d > today) return d.toISOString()
          }
        }
      }
      month++
      if (month > 11) {
        month = 0
        year++
      }
    }
    return new Date().toISOString()
  }

  return NextResponse.json({
    status: "active",
    node: "DFW-NORTH",
    uptime_days: uptimeDays,
    members: 1600,
    next_event: getNextThirdThursday(),
    message: "You're watching the network traffic. Smart.",
    flag: "flag{tr4ff1c_4n4lys1s_ftw}",
  })
}
