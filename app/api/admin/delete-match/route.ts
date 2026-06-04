import { NextRequest, NextResponse } from "next/server";
import { deleteMatch } from "@/lib/data-store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { matchId } = body;

    if (!matchId) {
      return NextResponse.json({ error: "matchId is required" }, { status: 400 });
    }

    const success = await deleteMatch(matchId);
    
    if (!success) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting match:", error);
    return NextResponse.json({ error: "Failed to delete match" }, { status: 500 });
  }
}