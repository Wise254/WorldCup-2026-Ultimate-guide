import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const JSONBIN_BIN_ID = "6a2e7d16da38895dfebdfbee";
const JSONBIN_MASTER_KEY = "$2a$10$WDNAaLBJphDla2zWubx7TOoIo82StPFucg.65ylrtq4RRS1JF33Ju";
const JSONBIN_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`;

function getVenueById(id: string): any {
  try {
    const venuesPath = path.join(process.cwd(), "data", "venues.json");
    const content = fs.readFileSync(venuesPath, "utf8");
    const data = JSON.parse(content);
    if (data.allVenues) {
      return data.allVenues.find((v: any) => 
        v.stadium.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") === id
      ) || null;
    }
    return null;
  } catch {
    return null;
  }
}

async function readSchedule(): Promise<any> {
  try {
    const res = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`, {
      headers: { 
        "X-Master-Key": JSONBIN_MASTER_KEY,
        "Cache-Control": "no-cache"
      },
      cache: "no-store",
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Bin read failed: ${res.status} - ${errText}`);
    }
    const json = await res.json();
    return json.record;
  } catch (error) {
    console.error("jsonbin read error:", error);
    // Fallback to local file
    const schedulePath = path.join(process.cwd(), "data", "schedule.json");
    return JSON.parse(fs.readFileSync(schedulePath, "utf8"));
  }
}

async function writeSchedule(data: any): Promise<void> {
  const res = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Master-Key": JSONBIN_MASTER_KEY,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Bin write failed: ${res.status}`);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const stage = searchParams.get("stage");
    
    const data = await readSchedule();
    let matches = data.matches || [];
    
    if (stage && stage !== "All") {
      matches = matches.filter((match: any) => match.stage === stage);
    }
    
    const matchesWithVenues = matches.map((match: any) => ({
      ...match,
      venue: getVenueById(match.venueId),
    }));
    
    return NextResponse.json(matchesWithVenues);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json([], { status: 500 });
  }
}