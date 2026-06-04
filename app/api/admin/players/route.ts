import { NextRequest, NextResponse } from "next/server";
import { getPlayers, savePlayers } from "@/lib/data-store";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const team = searchParams.get("team");
    
    const data = await getPlayers(team || undefined);
    
    if (team && !data) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    return NextResponse.json(team ? data : data);
  } catch (error) {
    console.error("Error fetching players:", error);
    return NextResponse.json({ error: "Failed to fetch players" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { team, formation, players } = body;

    if (!team) {
      return NextResponse.json({ error: "Team is required" }, { status: 400 });
    }

    await savePlayers(team, { formation: formation || "4-3-3", players: players || [] });

    return NextResponse.json({
      success: true,
      team: { team, formation: formation || "4-3-3", players: players || [] },
    });
  } catch (error) {
    console.error("Error saving players:", error);
    return NextResponse.json({ error: "Failed to save players" }, { status: 500 });
  }
}