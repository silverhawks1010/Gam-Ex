import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    clientId: process.env.TWITCH_CLIENT_ID ? "Défini" : "Non défini",
    clientSecret: process.env.TWITCH_CLIENT_SECRET ? "Défini" : "Non défini",
  });
} 