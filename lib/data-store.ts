import { kv } from "@vercel/kv";

const SCHEDULE_KEY = "schedule_data";
const PLAYERS_KEY = "players_data";

// ─── Schedule / Matches ────────────────────────────

export async function getAllMatches(): Promise<any[]> {
  try {
    const data = await kv.get<string>(SCHEDULE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      return parsed.matches || [];
    }
  } catch (error) {
    console.error("KV read error (matches):", error);
  }
  
  // Fallback to local JSON file
  const fs = await import("fs");
  const path = await import("path");
  const filePath = path.join(process.cwd(), "data", "schedule.json");
  const content = fs.readFileSync(filePath, "utf8");
  const parsed = JSON.parse(content);
  return parsed.matches || [];
}

export async function saveAllMatches(matches: any[]): Promise<void> {
  const data = JSON.stringify({ matches });
  await kv.set(SCHEDULE_KEY, data);
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
  try {
    const data = await kv.get<string>(PLAYERS_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (team) {
        return parsed[team] || null;
      }
      return parsed;
    }
  } catch (error) {
    console.error("KV read error (players):", error);
  }
  
  // Fallback to local JSON file
  const fs = await import("fs");
  const path = await import("path");
  const filePath = path.join(process.cwd(), "data", "players.json");
  const content = fs.readFileSync(filePath, "utf8");
  const parsed = JSON.parse(content);
  if (team) {
    return parsed[team] || null;
  }
  return parsed;
}

export async function savePlayers(team: string, data: { formation: string; players: any[] }): Promise<void> {
  let allPlayers: any = {};
  
  try {
    const existing = await kv.get<string>(PLAYERS_KEY);
    if (existing) {
      allPlayers = JSON.parse(existing);
    }
  } catch {
    // Start fresh
  }
  
  allPlayers[team] = data;
  await kv.set(PLAYERS_KEY, JSON.stringify(allPlayers));
}