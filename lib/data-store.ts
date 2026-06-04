import { put, list, del } from "@vercel/blob";

const SCHEDULE_FILENAME = "schedule-data.json";
const PLAYERS_FILENAME = "players-data.json";

// ─── Helpers ────────────────────────────────────────

async function readBlob(filename: string): Promise<any | null> {
  try {
    const { blobs } = await list({ prefix: filename });
    if (blobs.length > 0) {
      const response = await fetch(blobs[0].url);
      if (!response.ok) return null;
      return await response.json();
    }
  } catch (error) {
    console.error(`Blob read error (${filename}):`, error);
  }
  return null;
}

async function writeBlob(filename: string, data: any): Promise<void> {
  try {
    const json = JSON.stringify(data, null, 2);
    // Delete old versions to keep storage clean
    const { blobs } = await list({ prefix: filename });
    for (const blob of blobs) {
      await del(blob.url);
    }
    await put(filename, json, {
      access: "public",
      contentType: "application/json",
    });
  } catch (error) {
    console.error(`Blob write error (${filename}):`, error);
    throw error;
  }
}

function readLocalFile(filename: string): any {
  const fs = require("fs");
  const path = require("path");
  const filePath = path.join(process.cwd(), "data", filename);
  const content = fs.readFileSync(filePath, "utf8");
  return JSON.parse(content);
}

// ─── Schedule / Matches ────────────────────────────

export async function getAllMatches(): Promise<any[]> {
  const data = await readBlob(SCHEDULE_FILENAME);
  if (data && data.matches) {
    return data.matches;
  }
  
  // Fallback to local file
  const local = readLocalFile("schedule.json");
  return local.matches || [];
}

export async function saveAllMatches(matches: any[]): Promise<void> {
  await writeBlob(SCHEDULE_FILENAME, { matches });
}

export async function addMatch(match: any): Promise<any> {
  const matches = await getAllMatches();
  const maxId = matches.reduce((max: number, m: any) => {
    const num = parseInt(m.id);
    return num > max ? num : max;
  }, 0);
  
  const newMatch = {
    ...match,
    id: String(maxId + 1),
    homeScore: null,
    awayScore: null,
  };
  
  matches.push(newMatch);
  await saveAllMatches(matches);
  return newMatch;
}

export async function updateMatchScore(matchId: string, homeScore: number | null, awayScore: number | null): Promise<any> {
  const matches = await getAllMatches();
  const index = matches.findIndex((m: any) => m.id === matchId);
  
  if (index === -1) return null;
  
  matches[index] = {
    ...matches[index],
    homeScore,
    awayScore,
    status: homeScore !== null && awayScore !== null ? "finished" : "upcoming",
  };
  
  await saveAllMatches(matches);
  return matches[index];
}

export async function deleteMatch(matchId: string): Promise<boolean> {
  const matches = await getAllMatches();
  const index = matches.findIndex((m: any) => m.id === matchId);
  
  if (index === -1) return false;
  
  matches.splice(index, 1);
  await saveAllMatches(matches);
  return true;
}

// ─── Players ────────────────────────────────────────

export async function getPlayers(team?: string): Promise<any> {
  const data = await readBlob(PLAYERS_FILENAME);
  if (data) {
    if (team) return data[team] || null;
    return data;
  }
  
  // Fallback to local file
  const local = readLocalFile("players.json");
  if (team) return local[team] || null;
  return local;
}

export async function savePlayers(team: string, data: { formation: string; players: any[] }): Promise<void> {
  let allPlayers: any = {};
  
  const existing = await readBlob(PLAYERS_FILENAME);
  if (existing) {
    allPlayers = existing;
  }
  
  allPlayers[team] = data;
  await writeBlob(PLAYERS_FILENAME, allPlayers);
}