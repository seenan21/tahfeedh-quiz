import { useState } from 'react';
import Silk from './components/Silk';
import './index.css';
import IntroCard from './components/IntroCard';
import SelectGrid from './components/SelectGrid';
import QuizCard from './components/QuizCard';

function App() {
  const [stage, setStage] = useState("intro");
  const [selectedChapters, setSelectedChapters] = useState(Array(30).fill(false));

  function toggleSelectAll() {
    const allSelected = selectedChapters.every(Boolean);
    setSelectedChapters(Array(30).fill(!allSelected));
  }

  function toggleRange(range) {
    setSelectedChapters(prev => {
      const anyFalse = range.some(index => !prev[index]);
      return prev.map((val, i) => (range.includes(i) ? anyFalse : val));
    });
  }

  function toggleChapter(index) {
    setSelectedChapters(prev =>
      prev.map((val, i) => (i === index ? !val : val))
    );
  }


  function resetAll() {
    setStage("intro");
    setSelectedChapters(Array(30).fill(false));
    // reset other top-level state here
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <>
      <div className="fixed inset-0 -z-10">
        <Silk
          speed={8}
          scale={0.8}
          color="#15351E"
          noiseIntensity={0.5}
          rotation={4}
        />
      </div>

      <div className="relative min-h-screen w-full overflow-x-hidden">
        {stage !== "intro" && (
          <div className="flex justify-center">
            <div className="inline-block bg-[#FFFFC1] text-[#15351E] px-16 py-4 rounded-xl shadow-lg text-center mt-2">
              <div className="text-3xl font-semibold mb-1 title-ar">اختبار القرآن</div>
              <div className="text-3xl title-en">Qur'an Quiz</div>
            </div>
          </div>
        )}

        {stage === "intro" && (
          <IntroCard setStage={setStage} />
        )}

        {stage === "select" && (
          <SelectGrid
            selectedChapters={selectedChapters}
            toggleChapter={toggleChapter}
            toggleRange={toggleRange}
            toggleSelectAll={toggleSelectAll}
            stage={stage}
            setStage={setStage}
          />
        )}

         {stage === "quiz" && (
          <QuizCard setStage={setStage} selectedChapters={selectedChapters} resetAll={resetAll} />
        )}

        
      </div>
    </>
  );
}

export default App;
