import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { homeTeam, awayTeam, date, time, venueId, stage } = body;

    if (!homeTeam || !awayTeam || !date || !time || !venueId || !stage) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (homeTeam === awayTeam) {
      return NextResponse.json({ error: "A team cannot play against itself" }, { status: 400 });
    }

    const schedulePath = path.join(process.cwd(), "data", "schedule.json");
    const content = fs.readFileSync(schedulePath, "utf8");
    const data = JSON.parse(content);

    const duplicate = data.matches.find(
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

    const maxId = data.matches.reduce((max: number, m: any) => {
      const num = parseInt(m.id);
      return num > max ? num : max;
    }, 0);

    const newMatch = {
      id: String(maxId + 1),
      stage,
      homeTeam,
      awayTeam,
      homeScore: null,
      awayScore: null,
      date,
      time,
      venueId,
    };

    data.matches.push(newMatch);
    fs.writeFileSync(schedulePath, JSON.stringify(data, null, 2));

    return NextResponse.json(newMatch, { status: 201 });
  } catch (error: any) {
    console.error("Error adding match:", error);
    return NextResponse.json({ error: error.message || "Failed to add match" }, { status: 500 });
  }
}