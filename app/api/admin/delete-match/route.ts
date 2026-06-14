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
    const { matchId } = body;

    if (!matchId) {
      return NextResponse.json({ error: "matchId is required" }, { status: 400 });
    }

    const data = await readSchedule();
    const matchIndex = data.matches.findIndex((m: any) => m.id === matchId);

    if (matchIndex === -1) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    data.matches.splice(matchIndex, 1);
    await writeSchedule(data);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting match:", error);
    return NextResponse.json({ error: error.message || "Failed to delete match" }, { status: 500 });
  }
}