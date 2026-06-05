import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const TMP_SCHEDULE = "/tmp/schedule.json";
const LOCAL_SCHEDULE = path.join(process.cwd(), "data", "schedule.json");

function readSchedule(): any {
  if (fs.existsSync(TMP_SCHEDULE)) {
    return JSON.parse(fs.readFileSync(TMP_SCHEDULE, "utf8"));
  }
  return JSON.parse(fs.readFileSync(LOCAL_SCHEDULE, "utf8"));
}

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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const stage = searchParams.get("stage");
    
    const data = readSchedule();
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