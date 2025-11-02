// components/QuizCard.jsx
import React, { useEffect, useState } from "react";
import QuizQuestion from "./QuizQuestion"; 
import * as juzData from "../data/juzMap.json";
import * as pagesData from "../data/pagesMap.json";

function QuizCard({  selectedChapters, resetAll }) {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0)
  

  const juzMap = juzData.default || juzData;
  const pagesMap = pagesData.default || pagesData;

  function shuffleInPlace(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

  useEffect(() => {
    const generateQuestionsFromJuz = () => {
      if (!selectedChapters || selectedChapters.length === 0) {
        setQuestions([]);
        setCurrentIndex(0);
        setIsLoading(false);
        return;
      }

      const selectedJuz = selectedChapters
        .map((isSelected, idx) => (isSelected ? idx + 1 : null))
        .filter(Boolean);

      let allSelectedPages = [];
      selectedJuz.forEach((juzNumber) => {
        const juz = juzMap[String(juzNumber)];
        if (!juz) return;
        for (let i = juz.start; i <= juz.end; i++) allSelectedPages.push(i);
      });

      if (allSelectedPages.length === 0) {
        setQuestions([]);
        setCurrentIndex(0);
        setIsLoading(false);
        return;
      }

      // Divide pages into 10 sections
      const sections = [];
      const baseSectionSize = Math.floor(allSelectedPages.length / 10);
      let remainder = allSelectedPages.length % 10;
      let cur = 0;
      for (let i = 0; i < 10; i++) {
        const size = baseSectionSize + (remainder > 0 ? 1 : 0);
        remainder--;
        sections.push(allSelectedPages.slice(cur, cur + size));
        cur += size;
      }

      // Pick 1 random page and 1 random verse per section
      let questionsArr = sections
        .map((section) => {
          if (!section || section.length === 0) return null;
          const randomPage = section[Math.floor(Math.random() * section.length)];
          const versesOnPage = pagesMap[String(randomPage)];
          if (!versesOnPage || versesOnPage.length === 0) return null;
          const randomVerseStr = versesOnPage[Math.floor(Math.random() * versesOnPage.length)];
          const [chapter, verse] = randomVerseStr.split(":").map(Number);
          return { chapter, verse, page: randomPage };
        })
        .filter(Boolean);


      questionsArr = shuffleInPlace(questionsArr);
      setQuestions(questionsArr);
      setCurrentIndex(0);
      setIsLoading(false);
      setQuizCompleted(false);
    };

    generateQuestionsFromJuz();
  }, [selectedChapters]);

  const currentQuestion = questions[currentIndex];

  function goNext() {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setQuizCompleted(true);
    }
  }

  function handleTryAgain() {
    setScore(0);
    setCurrentIndex(0);
    setQuestions([]);
    setQuizCompleted(false);
    resetAll(); // parent reset if provided
  }

  // Collect the list of verse keys for results view
  const verseList = questions.map((q) => `${q.chapter}:${q.verse}`);

  return (
    <div className="flex-grow z-20 flex items-center justify-center px-4 py-8">
      <div className="bg-[#FFFFC1] w-full max-w-4xl p-6 md:p-8 rounded-2xl shadow-xl">
        {/* Header with score */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-2xl font-semibold text-[#15351E]">Quiz</div>
            <div className="text-sm text-[#15351E]/80">
              {questions.length} questions • Good luck
            </div>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm text-center border border-gray-100">
            <div className="text-xs text-gray-500">Score</div>
            <div className="text-lg font-semibold text-[#15351E]">{score}</div>
          </div>
        </div>

        <div className="min-h-[280px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-gray-500">
              Preparing quiz…
            </div>
          ) : quizCompleted ? (
            <div className="space-y-4 text-center">
              <div className="text-xl font-semibold text-[#15351E]">Quiz Completed!</div>
              <div className="text-[#15351E]/90">
                Your final score: <span className="font-bold">{score}</span>
              </div>
              <div className="text-left max-h-60 overflow-y-auto bg-white p-4 rounded-xl border shadow-sm text-[#15351E]">
                <div className="font-semibold mb-2">Verses you were quizzed on:</div>
                <ul className="list-disc list-inside">
                  {verseList.map((v, i) => (
                    <li key={i}>{v}</li>
                  ))}
                </ul>
              </div>
              <div className="text-sm opacity-70">
                This quiz was made by Seenan Iftekhar
              </div>
              <button
                
                className="mt-4 bg-[#15351E] text-white px-6 py-2 rounded-xl hover:bg-[#12331a]"
              >
                To try again, just refresh the page!
              </button>
            </div>
          ) : (
            <QuizQuestion
              question={currentQuestion}
              index={currentIndex}
              total={questions.length}
              score={score}
              setScore={setScore}
              onNext={goNext}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default QuizCard;
