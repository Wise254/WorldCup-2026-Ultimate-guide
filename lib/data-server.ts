// SERVER-ONLY file - uses Node.js fs module
import fs from "fs";
import path from "path";

export interface Venue {
  id?: string;
  city: string;
  stadium: string;
  country?: string;
  capacity?: number;
}

export interface Match {
  id: string;
  stage: string;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number | null;
  awayScore?: number | null;
  date: string;
  time: string;
  venueId: string;
  group?: string;
}

// Helper function to read JSON files
function readJSONFile(filename: string): any {
  const filePath = path.join(process.cwd(), "data", filename);
  const fileContents = fs.readFileSync(filePath, "utf8");
  return JSON.parse(fileContents);
}

// Get all venues
export function getAllVenues(): Venue[] {
  const venuesData = readJSONFile("venues.json");
  if (venuesData.allVenues) {
    return venuesData.allVenues.map((venue: any) => ({
      ...venue,
      id: venue.stadium.toLowerCase().replace(/\s+/g, "-"),
    }));
  }
  if (venuesData.countries) {
    const flattened: Venue[] = [];
    venuesData.countries.forEach((country: any) => {
      country.venues.forEach((venue: any) => {
        flattened.push({
          id: venue.stadium.toLowerCase().replace(/\s+/g, "-"),
          city: venue.city,
          stadium: venue.stadium,
          country: country.name,
          capacity: venue.capacity,
        });
      });
    });
    return flattened;
  }
  return [];
}

// Get venue by ID
export function getVenueById(id: string): Venue | null {
  const venues = getAllVenues();
  return venues.find((venue) => venue.id === id) || null;
}

// Get all matches
export function getAllMatches(): Match[] {
  try {
    const matchesData = readJSONFile("schedule.json");
    if (matchesData.matches) {
      return matchesData.matches;
    }
    if (Array.isArray(matchesData)) {
      return matchesData;
    }
  } catch (error) {
    console.log("Schedule file not found, returning empty array");
  }
  return [];
}