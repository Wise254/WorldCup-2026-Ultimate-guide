import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const TMP_SCHEDULE = "/tmp/schedule.json";
const LOCAL_SCHEDULE = path.join(process.cwd(), "data", "schedule.json");

function readSchedule(): any {
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
    const { homeTeam, awayTeam, date, time, venueId, stage } = body;

    if (!homeTeam || !awayTeam || !date || !time || !venueId || !stage) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (homeTeam === awayTeam) {
      return NextResponse.json({ error: "A team cannot play against itself" }, { status: 400 });
    }

    const data = readSchedule();

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
    writeSchedule(data);

    return NextResponse.json(newMatch, { status: 201 });
  } catch (error: any) {
    console.error("Error adding match:", error);
    return NextResponse.json({ error: error.message || "Failed to add match" }, { status: 500 });
  }
}