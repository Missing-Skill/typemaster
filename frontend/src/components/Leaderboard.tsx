import { useEffect, useState } from "react";
import styled from "styled-components";
import { useThemeContext } from "../hooks/useTheme";

type LeaderboardEntry = {
  name: string;
  usn: string;
  results: {
    wpm: number;
    accuracy: number;
  };
};

const Leaderboard = () => {
  const { systemTheme } = useThemeContext();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        console.log("Fetching leaderboard data...");
        const response = await fetch("http://localhost:5000/api/results");
        console.log("Response status:", response.status);

        if (!response.ok) {
          throw new Error(
            `Failed to fetch leaderboard data: ${response.status}`
          );
        }

        const data = await response.json();
        console.log("Received data:", data);

        if (!Array.isArray(data)) {
          throw new Error("Received data is not an array");
        }

        // Sort by WPM (descending) and use accuracy as tiebreaker
        const sortedData = data.sort(
          (a: LeaderboardEntry, b: LeaderboardEntry) => {
            if (!a.results || !b.results) {
              console.error("Invalid data structure:", { a, b });
              return 0;
            }
            if (b.results.wpm !== a.results.wpm) {
              return b.results.wpm - a.results.wpm;
            }
            return b.results.accuracy - a.results.accuracy;
          }
        );

        console.log("Sorted data:", sortedData);
        setLeaderboardData(sortedData);
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
        setError(
          err instanceof Error
            ? err.message
            : "An error occurred while fetching the leaderboard"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div
        className="flex h-full items-center justify-center"
        style={{ color: systemTheme.text.primary }}
      >
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="flex h-full flex-col items-center justify-center gap-4 p-4"
        style={{ color: systemTheme.text.primary }}
      >
        <div className="text-xl font-bold text-red-500">Error</div>
        <div className="text-center">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (leaderboardData.length === 0) {
    return (
      <div
        className="flex h-full items-center justify-center"
        style={{ color: systemTheme.text.primary }}
      >
        No data available
      </div>
    );
  }

  return (
    <div
      className="flex h-full flex-col gap-4 p-4"
      style={{ color: systemTheme.text.primary }}
    >
      <h2 className="text-center text-2xl font-bold">Top Performers</h2>
      <ScrollableContainer>
        {leaderboardData.slice(0, 3).map((entry, index) => (
          <TopEntry key={index} rank={index + 1}>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full text-xl font-bold">
                {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
              </div>
              <div>
                <div className="font-bold">{entry.name}</div>
                <div className="text-sm opacity-80">{entry.usn}</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="font-bold">
                  {Math.round(entry.results.wpm)} WPM
                </div>
                <div className="text-sm opacity-80">
                  {Math.round(entry.results.accuracy)}%
                </div>
              </div>
            </div>
          </TopEntry>
        ))}
      </ScrollableContainer>
    </div>
  );
};

const ScrollableContainer = styled.div`
  max-height: 300px;
  overflow-y: auto;
  padding-right: 8px;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.background.secondary};
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.text.secondary};
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.text.primary};
  }
`;

const TopEntry = styled.div<{ rank: number }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  margin-bottom: 0.5rem;
  border-radius: 0.5rem;
  background: ${({ theme, rank }) =>
    rank === 1
      ? "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)"
      : rank === 2
      ? "linear-gradient(135deg, #C0C0C0 0%, #A9A9A9 100%)"
      : "linear-gradient(135deg, #CD7F32 0%, #B87333 100%)"};
  color: ${({ rank }) => (rank <= 3 ? "#000" : "inherit")};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

export default Leaderboard;
