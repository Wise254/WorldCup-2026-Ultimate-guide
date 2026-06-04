"use client";

import { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";

interface Fact {
  id: number;
  category: string;
  fact: string;
  icon: string;
}

export default function FunFacts() {
  const [facts, setFacts] = useState<Fact[]>([]);
  const [currentFact, setCurrentFact] = useState<Fact | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/facts.json")
      .then((res) => res.json())
      .then((data) => {
        setFacts(data.facts);
        const randomIndex = Math.floor(Math.random() * data.facts.length);
        setCurrentFact(data.facts[randomIndex]);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const getRandomFact = () => {
    if (facts.length === 0) return;
    let newIndex = Math.floor(Math.random() * facts.length);
    while (facts.length > 1 && currentFact && facts[newIndex].id === currentFact.id) {
      newIndex = Math.floor(Math.random() * facts.length);
    }
    setCurrentFact(facts[newIndex]);
  };

  if (isLoading || !currentFact) {
    return (
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="animate-pulse">Loading fun facts...</div>
      </div>
    );
  }

  const categoryColors: Record<string, string> = {
    tournament: "bg-yellow-500",
    history: "bg-orange-500",
    host: "bg-green-500",
    stadium: "bg-blue-500",
    player: "bg-purple-500",
    goal: "bg-red-500",
    attendance: "bg-indigo-500",
    scoring: "bg-pink-500",
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{currentFact.icon}</span>
          <div>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${categoryColors[currentFact.category] || "bg-gray-500"} bg-opacity-80`}>
              {currentFact.category.toUpperCase()}
            </span>
          </div>
        </div>
        <button
          onClick={getRandomFact}
          className="p-2 hover:bg-white/20 rounded-full transition-all duration-300"
          title="Show another fact"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      <p className="text-lg md:text-xl font-medium leading-relaxed mb-4">
        {currentFact.fact}
      </p>

      <div className="text-sm text-white/70 mt-2">
        💡 Did you know?
      </div>
    </div>
  );
}