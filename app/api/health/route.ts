import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: "ok",
    version: "1.0.0",
    organization: "NTXCSG",
    uptime: "Since 2013",
  })
}
