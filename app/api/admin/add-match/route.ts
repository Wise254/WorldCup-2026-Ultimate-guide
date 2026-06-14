import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const JSONBIN_BIN_ID = "6a2e7d16da38895dfebdfbee";
const JSONBIN_MASTER_KEY = "$2a$10$WDNAaLBJphDla2zWubx7TOoIo82StPFucg.65ylrtq4RRS1JF33Ju";

async function readSchedule(): Promise<any> {
  try {
    const res = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`, {
      headers: { "X-Master-Key": JSONBIN_MASTER_KEY },
    });
    if (!res.ok) throw new Error(`Bin read failed: ${res.status}`);
    const json = await res.json();
    return json.record;
  } catch {
    const schedulePath = path.join(process.cwd(), "data", "schedule.json");
    return JSON.parse(fs.readFileSync(schedulePath, "utf8"));
  }
}

async function writeSchedule(data: any): Promise<void> {
  await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Master-Key": JSONBIN_MASTER_KEY,
    },
    body: JSON.stringify(data),
  });
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

    const data = await readSchedule();

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
    await writeSchedule(data);

    return NextResponse.json(newMatch, { status: 201 });
  } catch (error: any) {
    console.error("Error adding match:", error);
    return NextResponse.json({ error: error.message || "Failed to add match" }, { status: 500 });
  }
}