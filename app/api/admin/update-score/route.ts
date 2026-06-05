import { NextRequest, NextResponse } from "next/server";
import { updateMatchScore } from "@/lib/data-store";
import fs from "fs";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { matchId, homeScore, awayScore } = body;

    if (!matchId) {
      return NextResponse.json({ error: "matchId is required" }, { status: 400 });
    }

    // Try Blob first
    try {
      const updated = await updateMatchScore(matchId, homeScore, awayScore);
      if (updated) {
        return NextResponse.json(updated, { status: 200 });
      }
    } catch (blobError) {
      console.error("Blob update failed, falling back to local file:", blobError);
    }

    // Fallback: update local schedule.json directly
    const schedulePath = path.join(process.cwd(), "data", "schedule.json");
    const content = fs.readFileSync(schedulePath, "utf8");
    const data = JSON.parse(content);
    
    const matchIndex = data.matches.findIndex((m: any) => m.id === matchId);
    if (matchIndex === -1) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    data.matches[matchIndex].homeScore = homeScore;
    data.matches[matchIndex].awayScore = awayScore;
    data.matches[matchIndex].status = homeScore !== null && awayScore !== null ? "finished" : "upcoming";

    fs.writeFileSync(schedulePath, JSON.stringify(data, null, 2));

    return NextResponse.json(data.matches[matchIndex], { status: 200 });
  } catch (error) {
    console.error("Error updating score:", error);
    return NextResponse.json({ error: "Failed to update score" }, { status: 500 });
  }
}