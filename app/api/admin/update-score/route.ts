import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const TMP_SCHEDULE = "/tmp/schedule.json";
const LOCAL_SCHEDULE = path.join(process.cwd(), "data", "schedule.json");

function readSchedule(): any {
  // Read from /tmp first (has latest changes), fall back to committed file
  if (fs.existsSync(TMP_SCHEDULE)) {
    const content = fs.readFileSync(TMP_SCHEDULE, "utf8");
    return JSON.parse(content);
  }
  const content = fs.readFileSync(LOCAL_SCHEDULE, "utf8");
  return JSON.parse(content);
}

function writeSchedule(data: any): void {
  fs.writeFileSync(TMP_SCHEDULE, JSON.stringify(data, null, 2));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { matchId, homeScore, awayScore } = body;

    if (!matchId) {
      return NextResponse.json({ error: "matchId is required" }, { status: 400 });
    }

    const data = readSchedule();
    
    const matchIndex = data.matches.findIndex((m: any) => m.id === matchId);
    if (matchIndex === -1) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    data.matches[matchIndex].homeScore = homeScore;
    data.matches[matchIndex].awayScore = awayScore;
    data.matches[matchIndex].status = homeScore !== null && awayScore !== null ? "finished" : "upcoming";

    writeSchedule(data);

    return NextResponse.json(data.matches[matchIndex], { status: 200 });
  } catch (error: any) {
    console.error("Error updating score:", error);
    return NextResponse.json({ error: error.message || "Failed to update score" }, { status: 500 });
  }
}