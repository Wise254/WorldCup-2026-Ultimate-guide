import { NextRequest, NextResponse } from "next/server";
import { updateMatchScore } from "@/lib/data-store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { matchId, homeScore, awayScore } = body;

    if (!matchId) {
      return NextResponse.json({ error: "matchId is required" }, { status: 400 });
    }

    const updated = await updateMatchScore(matchId, homeScore, awayScore);
    
    if (!updated) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("Error updating score:", error);
    return NextResponse.json({ error: "Failed to update score" }, { status: 500 });
  }
}