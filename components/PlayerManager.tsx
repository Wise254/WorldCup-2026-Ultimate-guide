"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/Toast";
import teamsData from "@/data/teams.json";

interface Player {
  position: string;
  name: string;
  number: number;
}

const POSITIONS = ["GK", "RB", "CB", "LB", "CDM", "CM", "CAM", "RM", "LM", "RW", "LW", "ST"];
const FORMATIONS = ["4-3-3", "4-2-3-1", "4-4-2", "3-4-3", "3-5-2", "5-3-2", "4-1-4-1"];

export default function PlayerManager() {
  const [selectedTeam, setSelectedTeam] = useState("");
  const [teamData, setTeamData] = useState<any>(null);
  const [formation, setFormation] = useState("4-3-3");
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayerPosition, setNewPlayerPosition] = useState("CM");
  const [newPlayerNumber, setNewPlayerNumber] = useState(1);
  const { addToast } = useToast();

  const allTeams = teamsData.allTeams.sort();

  useEffect(() => {
    if (!selectedTeam) {
      setTeamData(null);
      setPlayers([]);
      setFormation("4-3-3");
      return;
    }

    setLoading(true);
    fetch(`/api/admin/players?team=${encodeURIComponent(selectedTeam)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setTeamData(data);
          setFormation(data.formation || "4-3-3");
          setPlayers(
            (data.players || []).map((p: any) => ({
              position: p.position || "CM",
              name: p.name || "",
              number: Number(p.number) || 1,
            }))
          );
        } else {
          setTeamData(null);
          setFormation("4-3-3");
          setPlayers([]);
        }
      })
      .catch(() => {
        setTeamData(null);
        setFormation("4-3-3");
        setPlayers([]);
      })
      .finally(() => setLoading(false));
  }, [selectedTeam]);

  const addPlayer = () => {
    if (!newPlayerName.trim()) return;
    setPlayers([
      ...players,
      {
        position: newPlayerPosition,
        name: newPlayerName.trim(),
        number: newPlayerNumber,
      },
    ]);
    setNewPlayerName("");
    setNewPlayerPosition("CM");
    setNewPlayerNumber(1);
  };

  const removePlayer = (index: number) => {
    setPlayers(players.filter((_, i) => i !== index));
  };

  const updatePlayer = (index: number, field: "name" | "position" | "number", value: string | number) => {
    const updated = [...players];
    updated[index] = {
      ...updated[index],
      [field]: field === "number" ? Number(value) : value,
    };
    setPlayers(updated);
  };

  const savePlayers = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          team: selectedTeam,
          formation,
          players,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        addToast("success", `${selectedTeam} squad saved!`);
        setTeamData(data.team);
      } else {
        addToast("error", data.error || "Failed to save");
      }
    } catch {
      addToast("error", "Failed to save players");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-700">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span>👥</span> Manage Team Squads
        </h2>
        <p className="text-green-200 text-sm mt-0.5">Edit formations and player lineups for any team</p>
      </div>

      <div className="p-6">
        {/* Team Selector */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Select Team
          </label>
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="w-full md:w-80 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:border-green-500 focus:outline-none transition-colors"
          >
            <option value="">Choose a team...</option>
            {allTeams.map((team) => (
              <option key={team} value={team}>
                {team}
              </option>
            ))}
          </select>
        </div>

        {loading && (
          <div className="text-center py-8">
            <motion.div
              className="w-8 h-8 border-3 border-green-500 border-t-transparent rounded-full mx-auto"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p className="text-gray-500 mt-2 text-sm">Loading squad...</p>
          </div>
        )}

        {!loading && selectedTeam && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {/* Formation */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Formation
              </label>
              <div className="flex flex-wrap gap-2">
                {FORMATIONS.map((f) => (
                  <motion.button
                    key={f}
                    onClick={() => setFormation(f)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      formation === f
                        ? "bg-green-500 text-white shadow-md"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {f}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Players List */}
            <div className="mb-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-3">
                Players ({players.length})
              </h3>

              {players.length > 0 ? (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {players.map((player, idx) => (
                                        <motion.div
                                        key={idx}
                                        className="flex flex-wrap items-center gap-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-2 sm:p-3 group"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.03 }}
                                      >
                                        <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-400 flex-shrink-0">
                                          {idx + 1}
                                        </span>
                                        <input
                                          type="number"
                                          value={player.number}
                                          onChange={(e) => updatePlayer(idx, "number", e.target.value)}
                                          className="w-14 sm:w-16 px-1.5 sm:px-2 py-1.5 text-sm text-center border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                                          min={1}
                                          max={99}
                                        />
                                        <select
                                          value={player.position}
                                          onChange={(e) => updatePlayer(idx, "position", e.target.value)}
                                          className="w-16 sm:w-20 px-1 sm:px-2 py-1.5 text-xs sm:text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                                        >
                                          {POSITIONS.map((p) => (
                                            <option key={p} value={p}>
                                              {p}
                                            </option>
                                          ))}
                                        </select>
                                        <input
                                          type="text"
                                          value={player.name}
                                          onChange={(e) => updatePlayer(idx, "name", e.target.value)}
                                          className="flex-1 min-w-[100px] px-2 sm:px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                                          placeholder="Player name"
                                        />
                                        <button
                                          onClick={() => removePlayer(idx)}
                                          className="opacity-100 sm:opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600 p-1 transition-opacity flex-shrink-0 ml-auto sm:ml-0"
                                          aria-label="Remove player"
                                        >
                                          ✕
                                        </button>
                                      </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm py-4 text-center border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-xl">
                  No players yet. Add your first player below.
                </p>
              )}
            </div>

            {/* Add New Player */}
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4 mb-6">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 text-sm">Add New Player</h4>
              <div className="flex flex-wrap items-end gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">#</label>
                  <input
                    type="number"
                    value={newPlayerNumber}
                    onChange={(e) => setNewPlayerNumber(parseInt(e.target.value) || 1)}
                    className="w-16 px-2 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                    min={1}
                    max={99}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Position</label>
                  <select
                    value={newPlayerPosition}
                    onChange={(e) => setNewPlayerPosition(e.target.value)}
                    className="w-20 px-2 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                  >
                    {POSITIONS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 min-w-[150px]">
                  <label className="block text-xs text-gray-500 mb-1">Name</label>
                  <input
                    type="text"
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                    placeholder="Player name"
                    onKeyDown={(e) => e.key === "Enter" && addPlayer()}
                  />
                </div>
                <button
                  onClick={addPlayer}
                  disabled={!newPlayerName.trim()}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg font-medium text-sm transition-colors"
                >
                  + Add
                </button>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <motion.button
                onClick={savePlayers}
                disabled={saving}
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold shadow-lg disabled:opacity-50"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <motion.span
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    Saving...
                  </span>
                ) : (
                  "💾 Save Squad"
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}