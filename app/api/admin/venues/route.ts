import { NextResponse } from "next/server";
import { getAllVenues } from "@/lib/data-server";

export async function GET() {
  try {
    const venues = getAllVenues();
    return NextResponse.json(venues);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json([], { status: 500 });
  }
}