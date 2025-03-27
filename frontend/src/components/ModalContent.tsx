import { useState } from "react";
import { useThemeContext } from "../hooks/useTheme";
import ResultCard from "./ResultCard";
import type { Results } from "../types";
import type { HistoryType } from "../types";
import { api } from "../services/api";

type ModalContentProps = {
  totalTime: number;
  history: HistoryType;
  results: Results;
};

const ModalContent = ({ totalTime, history, results }: ModalContentProps) => {
  const { systemTheme } = useThemeContext();
  const [name, setName] = useState("");
  const [usn, setUsn] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const resultData = {
        name,
        usn,
        results: {
          wpm: results.wpm,
          cpm: results.cpm,
          accuracy: Math.round(results.accuracy),
          error: Math.round(results.error),
          totalTime: totalTime / 1000,
          totalCharacters: history.typedHistory.length,
        },
      };

      console.log("Submitting result data:", resultData);
      await api.saveResult(resultData);
      setSubmitted(true);
    } catch (error: unknown) {
      console.error("Error submitting results:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to submit results. Please try again.";

      // Show more specific error messages
      if (errorMessage.includes("Network error")) {
        setError(
          "Unable to connect to the server. Please check your internet connection and try again."
        );
      } else if (errorMessage.includes("timeout")) {
        setError("Request timed out. Please try again.");
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="mx-auto flex h-full w-[95%] flex-col gap-10 pb-10 pt-8 font-mono"
      style={{
        color: systemTheme.text.primary,
      }}
    >
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-xl lg:text-2xl">test results</h2>
        </div>

        <div className="grid grid-flow-col grid-rows-6 justify-center gap-4 sm:grid-rows-4 sm:justify-normal lg:grid-rows-2 lg:justify-normal lg:gap-10">
          <ResultCard
            title="wpm/cpm"
            tooltipId="wpm"
            tooltipContent="words per minute / characters per minute"
            tooltipPlace="top"
            results={`${results.wpm} / ${results.cpm}`}
          />
          <ResultCard
            title="acc."
            tooltipId="accuracy"
            tooltipContent="accuracy percentage"
            tooltipPlace="bottom"
            results={`${Math.round(results.accuracy)}%`}
          />
          <ResultCard
            title="character"
            tooltipId="character"
            tooltipContent="correct/incorrect"
            tooltipPlace="top"
            results={`${Math.round(
              history.typedHistory.length * (results.accuracy / 100)
            )} / ${Math.round(
              history.typedHistory.length * (results.error / 100)
            )}`}
          />
          <ResultCard
            title="err."
            tooltipId="error"
            tooltipContent="error percentage"
            tooltipPlace="bottom"
            results={`${Math.round(results.error)}%`}
          />
          <ResultCard
            title="time"
            tooltipId="time"
            tooltipContent="time taken to complete the test"
            tooltipPlace="top"
            results={`${totalTime / 1000}s`}
          />
          <ResultCard
            title="total"
            tooltipId="total"
            tooltipContent="total character typed"
            tooltipPlace="bottom"
            results={`${history.typedHistory.length}`}
          />
        </div>
      </div>

      {!submitted ? (
        <div
          className="mt-4 rounded-lg p-5"
          style={{ backgroundColor: systemTheme.background.secondary }}
        >
          <h2 className="mb-4 text-xl">Submit Your Details</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="mb-2 block">Name:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded border border-gray-600 bg-white bg-opacity-20 p-2 text-inherit"
                required
                style={{ backgroundColor: systemTheme.background.primary }}
              />
            </div>
            <div>
              <label className="mb-2 block">USN:</label>
              <input
                type="text"
                value={usn}
                onChange={(e) => setUsn(e.target.value)}
                className="w-full rounded border border-gray-600 bg-white bg-opacity-20 p-2 text-inherit"
                required
                style={{ backgroundColor: systemTheme.background.primary }}
              />
            </div>
            {error && (
              <div className="rounded-lg bg-red-500 bg-opacity-20 p-3 text-red-500">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 rounded px-4 py-2 font-semibold disabled:opacity-50"
              style={{
                backgroundColor: systemTheme.text.primary,
                color: systemTheme.background.primary,
              }}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </form>
        </div>
      ) : (
        <div
          className="mt-4 rounded-lg p-5 text-center"
          style={{ backgroundColor: systemTheme.background.secondary }}
        >
          <p className="text-lg">Thank you for submitting your results!</p>
        </div>
      )}
    </div>
  );
};

export default ModalContent;
