// This file is for client-side use only - it fetches from our API routes
export interface Venue {
    id: string;
    city: string;
    stadium: string;
    country: string;
    capacity: number;
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
    venue?: Venue;
    group?: string;
  }
  
  // Fetch all matches from API
  export async function getAllMatches(): Promise<Match[]> {
    try {
      const response = await fetch('/api/matches');
      if (!response.ok) throw new Error('Failed to fetch matches');
      return await response.json();
    } catch (error) {
      console.error('Error fetching matches:', error);
      return [];
    }
  }
  
  // Fetch matches by stage
  export async function getMatchesByStage(stage: string): Promise<Match[]> {
    try {
      const response = await fetch(`/api/matches?stage=${encodeURIComponent(stage)}`);
      if (!response.ok) throw new Error('Failed to fetch matches');
      return await response.json();
    } catch (error) {
      console.error('Error fetching matches:', error);
      return [];
    }
  }
  
  // Fetch all venues
  export async function getAllVenues(): Promise<Venue[]> {
    try {
      const response = await fetch('/api/venues');
      if (!response.ok) throw new Error('Failed to fetch venues');
      return await response.json();
    } catch (error) {
      console.error('Error fetching venues:', error);
      return [];
    }
  }
  
  // Get venue by ID (client-side)
  export async function getVenueById(id: string): Promise<Venue | null> {
    const venues = await getAllVenues();
    return venues.find((venue) => venue.id === id) || null;
  }