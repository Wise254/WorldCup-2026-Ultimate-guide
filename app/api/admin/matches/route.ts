import { NextResponse } from "next/server";
import { getAllMatches } from "@/lib/data-store";

function getVenueById(id: string): any {
  try {
    const fs = require("fs");
    const path = require("path");
    const filePath = path.join(process.cwd(), "data", "venues.json");
    const content = fs.readFileSync(filePath, "utf8");
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
    
    let matches = await getAllMatches();
    
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