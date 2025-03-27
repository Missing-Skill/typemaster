import { useEffect, useState } from "react";
import { useThemeContext } from "../hooks/useTheme";
import { api } from "../services/api";
import { FaSync } from "react-icons/fa";

type LeaderboardEntry = {
  name: string;
  usn: string;
  results: {
    wpm: number;
    accuracy: number;
    cpm: number;
    error: number;
    totalTime: number;
    totalCharacters: number;
  };
  createdAt: string;
};

const FullLeaderboard = () => {
  const { systemTheme } = useThemeContext();
  const [allResults, setAllResults] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await api.getResults();

      // Sort by WPM (descending) and use accuracy as tiebreaker
      const sortedData = data.sort(
        (a: LeaderboardEntry, b: LeaderboardEntry) => {
          if (b.results.wpm !== a.results.wpm) {
            return b.results.wpm - a.results.wpm;
          }
          return b.results.accuracy - a.results.accuracy;
        }
      );

      setAllResults(sortedData);
    } catch (err) {
      setError("Failed to load leaderboard");
      console.error("Error fetching leaderboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchLeaderboard();
    setRefreshing(false);
  };

  if (loading && !refreshing) {
    return (
      <div className="flex items-center justify-center p-4">
        <p style={{ color: systemTheme.text.secondary }}>
          Loading leaderboard...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-4">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Full Leaderboard</h2>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 rounded-lg px-4 py-2 transition-all hover:opacity-80"
          style={{
            backgroundColor: systemTheme.background.secondary,
            color: systemTheme.text.primary,
          }}
        >
          <FaSync className={refreshing ? "animate-spin" : ""} />
          <span>Refresh</span>
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr
              className="border-b"
              style={{ borderColor: systemTheme.text.secondary }}
            >
              <th className="px-4 py-3 text-left">Rank</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">USN</th>
              <th className="px-4 py-3 text-right">WPM</th>
              <th className="px-4 py-3 text-right">Accuracy</th>
              <th className="px-4 py-3 text-right">CPM</th>
              <th className="px-4 py-3 text-right">Errors</th>
              <th className="px-4 py-3 text-right">Time</th>
            </tr>
          </thead>
          <tbody>
            {allResults.map((result, index) => (
              <tr
                key={`${result.usn}-${result.createdAt}`}
                className="border-b transition-colors hover:bg-opacity-10"
                style={{
                  borderColor: systemTheme.text.secondary,
                  backgroundColor:
                    index < 3
                      ? index === 0
                        ? "rgba(255, 215, 0, 0.1)" // Gold
                        : index === 1
                        ? "rgba(192, 192, 192, 0.1)" // Silver
                        : "rgba(205, 127, 50, 0.1)" // Bronze
                      : "transparent",
                }}
              >
                <td className="px-4 py-3">
                  {index === 0
                    ? "🥇"
                    : index === 1
                    ? "🥈"
                    : index === 2
                    ? "🥉"
                    : `#${index + 1}`}
                </td>
                <td className="px-4 py-3">{result.name}</td>
                <td className="px-4 py-3">{result.usn}</td>
                <td className="px-4 py-3 text-right">
                  {Math.round(result.results.wpm)}
                </td>
                <td className="px-4 py-3 text-right">
                  {Math.round(result.results.accuracy)}%
                </td>
                <td className="px-4 py-3 text-right">
                  {Math.round(result.results.cpm)}
                </td>
                <td className="px-4 py-3 text-right">
                  {Math.round(result.results.error)}%
                </td>
                <td className="px-4 py-3 text-right">
                  {result.results.totalTime / 1000}s
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FullLeaderboard;
