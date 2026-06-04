"use client";

import { useState, useEffect } from "react";
import MatchCard from "@/components/MatchCard";

interface Match {
  id: string;
  stage: string;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number | null;
  awayScore?: number | null;
  date: string;
  time: string;
  venueId: string;
  venue?: {
    stadium: string;
    city: string;
    country: string;
  };
  group?: string;
}

export default function SchedulePage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedStage, setSelectedStage] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const stages = ["All", "Group Stage", "Round of 32", "Round of 16", "Quarter-finals", "Semi-finals", "Third-place Match", "Final"];

  useEffect(() => {
    fetchMatches();
  }, [selectedStage]);

  const fetchMatches = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = selectedStage === "All" 
        ? "/api/matches" 
        : `/api/matches?stage=${encodeURIComponent(selectedStage)}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setMatches(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching matches:", error);
      setError("Failed to load matches. Please try again later.");
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  // Group matches by date
  const matchesByDate = matches.reduce((acc, match) => {
    if (!acc[match.date]) {
      acc[match.date] = [];
    }
    acc[match.date].push(match);
    return acc;
  }, {} as Record<string, Match[]>);

  // Sort dates
  const sortedDates = Object.keys(matchesByDate).sort();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-4">Loading schedule...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-lg">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Match Schedule
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Full fixture list for FIFA World Cup 2026
          </p>
        </div>

        {/* Stage Filter */}
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {stages.map((stage) => (
            <button
              key={stage}
              onClick={() => setSelectedStage(stage)}
              className={`px-4 py-2 rounded-full font-medium transition-colors ${
                selectedStage === stage
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {stage}
            </button>
          ))}
        </div>

        {matches.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No matches scheduled for this stage yet.
            </p>
            <p className="text-gray-400 dark:text-gray-500 mt-2">
              The full schedule will be released closer to the tournament.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {sortedDates.map((date) => (
              <div key={date}>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {new Date(date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </h2>
                <div className="space-y-4">
                  {matchesByDate[date].map((match) => (
                    <MatchCard
                      key={match.id}
                      homeTeam={match.homeTeam}
                      awayTeam={match.awayTeam}
                      homeScore={match.homeScore}
                      awayScore={match.awayScore}
                      date={match.date}
                      time={match.time}
                      venue={match.venue?.stadium || match.venueId}
                      stage={match.stage}
                      group={match.group}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}