import { useState } from "react";
import { useThemeContext } from "./hooks/useTheme";
import { useSystem } from "./hooks/useSystem";

import Header from "./components/Header";
import TimeCategory from "./components/TimeCategory";
import Countdown from "./components/Countdown";
import WordWrapper from "./components/WordWrapper";
import WordContainer from "./components/WordContainer";
import UserTyped from "./components/UserTyped";
import Restart from "./components/Restart";
import Footer from "./components/Footer";
import ModalComponent from "./components/Modal";
import ModalContent from "./components/ModalContent";
import FullLeaderboard from "./components/FullLeaderboard";
import { FaList } from "react-icons/fa";

import { useDetectDevice } from "./hooks/useDetectDevice";
import MobileNotSupported from "./components/MobileNotSupported";

function App() {
  const { systemTheme } = useThemeContext();
  const [showFullLeaderboard, setShowFullLeaderboard] = useState(false);
  const isMobile = useDetectDevice();
  const {
    charTyped,
    countdown,
    modalIsOpen,
    results,
    time,
    history,
    word,
    wordContainerFocused,
    setWordContainerFocused,
    setTime,
    resetCountdown,
    setLocalStorageValue,
    restartTest,
    checkCharacter,
    closeModal,
  } = useSystem();

  return (
    <div
      className="h-screen w-full overflow-y-auto"
      style={{
        backgroundColor: systemTheme.background.primary,
        color: systemTheme.text.primary,
      }}
    >
      <main
        className="mx-auto flex h-full max-w-5xl flex-col gap-4 px-4 xl:px-0"
        style={{}}
      >
        {isMobile ? (
          <MobileNotSupported />
        ) : (
          <>
            <div className="flex items-center justify-between">
              <Header restart={restartTest} />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFullLeaderboard(!showFullLeaderboard)}
                  className="flex items-center gap-2 rounded-lg px-4 py-2 transition-all hover:opacity-80"
                  style={{
                    backgroundColor: systemTheme.background.secondary,
                    color: systemTheme.text.primary,
                  }}
                >
                  <FaList className="text-xl" />
                  <span>Leaderboard</span>
                </button>
              </div>
            </div>

            <TimeCategory
              time={time}
              setLocalStorage={setLocalStorageValue}
              setTime={setTime}
              restart={restartTest}
            />
            <Countdown countdown={countdown} />
            <WordWrapper
              focused={wordContainerFocused}
              setFocused={setWordContainerFocused}
            >
              <WordContainer word={word} />
              <UserTyped
                word={word}
                check={checkCharacter}
                charTyped={charTyped}
              />
            </WordWrapper>
            <Restart restart={restartTest} />
            <Footer />

            <ModalComponent
              type="result"
              isOpen={modalIsOpen}
              onRequestClose={closeModal}
            >
              <ModalContent
                totalTime={time}
                results={results}
                history={history}
              />
            </ModalComponent>

            <ModalComponent
              type="fullLeaderboard"
              isOpen={showFullLeaderboard}
              onRequestClose={() => setShowFullLeaderboard(false)}
            >
              <FullLeaderboard />
            </ModalComponent>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
