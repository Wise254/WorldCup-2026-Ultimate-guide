import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { matchId } = body;

    if (!matchId) {
      return NextResponse.json({ error: "matchId is required" }, { status: 400 });
    }

    const schedulePath = path.join(process.cwd(), "data", "schedule.json");
    const content = fs.readFileSync(schedulePath, "utf8");
    const data = JSON.parse(content);

    const matchIndex = data.matches.findIndex((m: any) => m.id === matchId);
    if (matchIndex === -1) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    const removedMatch = data.matches[matchIndex];
    data.matches.splice(matchIndex, 1);
    fs.writeFileSync(schedulePath, JSON.stringify(data, null, 2));

    return NextResponse.json({ success: true, removedMatch }, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting match:", error);
    return NextResponse.json({ error: error.message || "Failed to delete match" }, { status: 500 });
  }
}