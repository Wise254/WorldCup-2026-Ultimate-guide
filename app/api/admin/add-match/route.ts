import { NextRequest, NextResponse } from "next/server";
import { getAllMatches, addMatch } from "@/lib/data-store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { homeTeam, awayTeam, date, time, venueId, stage } = body;

    if (!homeTeam || !awayTeam || !date || !time || !venueId || !stage) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (homeTeam === awayTeam) {
      return NextResponse.json(
        { error: "A team cannot play against itself" },
        { status: 400 }
      );
    }

    // Check for duplicate
    const matches = await getAllMatches();
    const duplicate = matches.find(
      (m: any) =>
        m.stage === stage &&
        ((m.homeTeam === homeTeam && m.awayTeam === awayTeam) ||
          (m.homeTeam === awayTeam && m.awayTeam === homeTeam))
    );

    if (duplicate) {
      return NextResponse.json(
        { error: `A match between ${homeTeam} and ${awayTeam} already exists in ${stage}` },
        { status: 409 }
      );
    }

    const newMatch = await addMatch({
      stage,
      homeTeam,
      awayTeam,
      date,
      time,
      venueId,
    });

    return NextResponse.json(newMatch, { status: 201 });
  } catch (error) {
    console.error("Error adding match:", error);
    return NextResponse.json({ error: "Failed to add match" }, { status: 500 });
  }
}