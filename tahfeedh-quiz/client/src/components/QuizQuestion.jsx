import React, { useEffect, useState } from "react";
import axios from "axios";
import nameMap from "../data/nameMap.json";

/**
 * Props:
 *  - question: { chapter: number, verse: number }   // required
 *  - index: number (optional)
 *  - total: number (optional)
 *  - score: number
 *  - setScore: fn(newOrUpdater)                      // required for updating parent score
 *  - onNext: fn()                                     // call to advance to next question
 */
export default function QuizQuestion({ question, index, total, score, setScore, onNext }) {
  const [step, setStep] = useState(1); // 1 = MCQ, 2 = next2, 3 = prev2
  const [options, setOptions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [locked, setLocked] = useState(false);

  const [verseData, setVerseData] = useState(null);
  const [next2, setNext2] = useState(null);
  const [prev2, setPrev2] = useState(null);
  const [loadingVerse, setLoadingVerse] = useState(false);
  const [error, setError] = useState(null);

  // For showing answers (only visible after clicking "Show Answer")
  const [shownNextAnswer, setShownNextAnswer] = useState(false);
  const [shownPrevAnswer, setShownPrevAnswer] = useState(false);

  // helper constants + utils
  const SURAH_IDS = Object.keys(nameMap).map((k) => Number(k));
  const MIN_SURAH = Math.min(...SURAH_IDS);
  const MAX_SURAH = Math.max(...SURAH_IDS);
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
  const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);
  const pickUniqueFromList = (list, excludeSet) => {
    const candidates = list.filter((x) => !excludeSet.has(x) && SURAH_IDS.includes(x));
    if (!candidates.length) return null;
    return candidates[Math.floor(Math.random() * candidates.length)];
  };

  // build options according to rules: 2 within +/-3, 1 within +/-10, fallback random
  function buildOptions(correctId) {
    const nearbyLo = clamp(correctId - 3, MIN_SURAH, MAX_SURAH);
    const nearbyHi = clamp(correctId + 3, MIN_SURAH, MAX_SURAH);
    const mediumLo = clamp(correctId - 10, MIN_SURAH, MAX_SURAH);
    const mediumHi = clamp(correctId + 10, MIN_SURAH, MAX_SURAH);

    const nearby = SURAH_IDS.filter((id) => id >= nearbyLo && id <= nearbyHi && id !== correctId);
    const medium = SURAH_IDS.filter(
      (id) =>
        id >= mediumLo &&
        id <= mediumHi &&
        !(id >= nearbyLo && id <= nearbyHi) &&
        id !== correctId
    );

    const chosen = [];
    for (let i = 0; i < 2; i++) {
      const pick = pickUniqueFromList(nearby, new Set(chosen.concat([correctId])));
      if (pick) chosen.push(pick);
    }
    const pickMed = pickUniqueFromList(medium, new Set(chosen.concat([correctId])));
    if (pickMed) chosen.push(pickMed);

    // fill with random wrongs if needed
    const allWrongs = SURAH_IDS.filter((id) => id !== correctId && !chosen.includes(id));
    while (chosen.length < 3 && allWrongs.length) {
      const pick = allWrongs[Math.floor(Math.random() * allWrongs.length)];
      if (!chosen.includes(pick)) chosen.push(pick);
    }

    const opts = [
      {
        id: correctId,
        english: nameMap[String(correctId)].english,
        arabic: nameMap[String(correctId)].arabic,
        correct: true,
      },
      ...chosen.map((id) => ({
        id,
        english: nameMap[String(id)].english,
        arabic: nameMap[String(id)].arabic,
        correct: false,
      })),
    ];
    return shuffle(opts);
  }

  // reset when question changes — IMPORTANT: reset shownNext/Prev so answers are hidden per-question
  useEffect(() => {
    setStep(1);
    setOptions([]);
    setSelectedIndex(null);
    setLocked(false);
    setVerseData(null);
    setNext2(null);
    setPrev2(null);
    setError(null);

    // reset the "show answer" flags for the new question
    setShownNextAnswer(false);
    setShownPrevAnswer(false);

    if (!question) return;

    if (question.chapter) {
      setOptions(buildOptions(question.chapter));
    }

    let cancelled = false;
    async function loadVerse() {
      setLoadingVerse(true);
      setError(null);
      try {
        const res = await axios.get(`/api/verse?chapter=${question.chapter}&verse=${question.verse}`);
        if (cancelled) return;
        const data = res.data || {};
        // server expected: { main, next2, prev2 }
        setVerseData(data.main ?? data.verse ?? data);
        setNext2(data.next2 ?? null);
        setPrev2(data.prev2 ?? null);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.error || err.message || "Failed to load verse");
      } finally {
        if (!cancelled) setLoadingVerse(false);
      }
    }

    loadVerse();
    return () => (cancelled = true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question]);

  // MCQ submit — award +25 (uses parent setScore if provided)
  function handleSubmitMCQ() {
    if (locked || selectedIndex === null) return;
    const opt = options[selectedIndex];
    setLocked(true);
    if (opt && opt.correct) {
      if (typeof setScore === "function") setScore((s) => s + 25);
      else console.warn("QuizQuestion: setScore is not a function — parent did not pass it.");
    }
  }

  // recall next: only show yes/no after answer shown; if yes, award +50 and go to step 3
  function handleRecallNext(yes) {
    if (yes) {
      if (typeof setScore === "function") setScore((s) => s + 50);
      else console.warn("QuizQuestion: setScore is not a function — parent did not pass it.");
    }
    // entering step 3: ensure prev-answer hidden until user clicks its Show Answer
    setShownPrevAnswer(false);
    setStep(3);
  }

  // recall prev: if yes award +100 and advance to next question
  function handleRecallPrev(yes) {
    if (yes) {
      if (typeof setScore === "function") setScore((s) => s + 100);
      else console.warn("QuizQuestion: setScore is not a function — parent did not pass it.");
    }
    if (typeof onNext === "function") onNext();
  }

  // UI helpers
  function optionClass(o, i) {
    if (!locked) {
      if (selectedIndex === i) return "bg-yellow-500 border-gray-300 shadow-sm transform";
      return "bg-white hover:bg-green-50 hover:shadow-sm transition transform hover:-translate-y-0.5";
    }
    if (o.correct) return "bg-green-200 border-green-300";
    if (selectedIndex === i && !o.correct) return "bg-red-200 border-red-300";
    return "bg-white";
  }

  // render verse line (supports string or object) — right aligned with verse key at end
  function renderVerseLine(item, idx) {
    if (!item) return null;
    if (typeof item === "object") {
      const text = item.text || item.text_uthmani_simple || item.text_uthmani || item.text_imlaei || "";
      const key = item.key || item.verse_key || item.ayah_key || null;
      return (
        <div key={idx} className="text-3xl text-right leading-relaxed" dir="rtl">
          <span dangerouslySetInnerHTML={{ __html: text }} />{" "}
          {key ? <span className="text-3xl opacity-60"> — {key}</span> : null}
        </div>
      );
    }
    // string
    return (
      <div key={idx} className="text-3xl text-right leading-relaxed" dir="rtl">
        <span dangerouslySetInnerHTML={{ __html: item }} />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-[#15351E]">
      {/* header: question index */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {typeof index === "number" && typeof total === "number" ? `Question ${index + 1} / ${total}` : "Question"}
        </div>
      </div>

      {/* verse card */}
      <div className="bg-white p-4 rounded-xl border min-h-[72px]">
        {loadingVerse ? (
          <div className="text-gray-500">Loading verse…</div>
        ) : error ? (
          <div className="text-red-500">Error: {error}</div>
        ) : (
          <div className="text-right leading-relaxed text-3xl" dir="rtl">
            {typeof verseData === "string" ? (
              <span dangerouslySetInnerHTML={{ __html: verseData }} />
            ) : (
              <span dangerouslySetInnerHTML={{ __html: (verseData && (verseData.text_uthmani_simple || verseData.text_uthmani || verseData.text)) || "Verse not available" }} />
            )}
          </div>
        )}
      </div>

      {/* STEP 1 - MCQ */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="text-xl font-semibold">Which Surah is this verse from?</div>

          <div className="grid grid-cols-2 gap-3">
            {options.map((o, i) => (
              <button
                key={`${o.id}-${i}`}
                onClick={() => { if (locked) return; setSelectedIndex(i); }}
                disabled={locked}
                aria-pressed={selectedIndex === i}
                className={`text-left border rounded-xl p-3 transition ${optionClass(o, i)}`}
              >
                <div className="font-semibold">{o.english}</div>
                <div className="text-sm opacity-70">{o.arabic}</div>
                {locked && o.correct && <div className="mt-2 text-sm text-green-700 font-semibold">Correct</div>}
                {locked && selectedIndex === i && !o.correct && <div className="mt-2 text-sm text-red-700 font-semibold">Incorrect</div>}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 mt-3">
            {!locked ? (
              <button
                onClick={handleSubmitMCQ}
                disabled={selectedIndex === null}
                className={`px-4 py-2 rounded-xl text-white ${selectedIndex === null ? "bg-gray-300 cursor-not-allowed" : "bg-[#15351E] hover:bg-[#12331a]"}`}
              >
                Submit
              </button>
            ) : (
              <button
                onClick={() => { setShownNextAnswer(false); setStep(2); }}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Continue
              </button>
            )}

            <div className="text-sm text-gray-600 ml-auto">{locked ? "MCQ locked" : "Select the correct surah"}</div>
          </div>
        </div>
      )}

      {/* STEP 2 - recall next 2 */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="text-xl font-semibold">Can you recite the NEXT 2 verses properly from memory?</div>

          {!shownNextAnswer && (
            <button
              onClick={() => setShownNextAnswer(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl"
            >
              Show Answer
            </button>
          )}

          {shownNextAnswer && (
            <>
              <div className="bg-white p-3 border rounded-xl text-l opacity-80 space-y-1">
                {next2 && next2.length > 0 ? next2.map((x, i) => renderVerseLine(x, i)) : <div className="text-gray-500">Answer not available</div>}
              </div>

              <div className="flex gap-3">
                <button onClick={() => handleRecallNext(true)} className="bg-green-600 text-white px-4 py-2 rounded-xl">Yes</button>
                <button onClick={() => handleRecallNext(false)} className="bg-gray-300 px-4 py-2 rounded-xl">No</button>
              </div>
            </>
          )}
        </div>
      )}

      {/* STEP 3 - recall prev 2 */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="text-xl font-semibold">Can you recite the PREVIOUS 2 verses from memory?</div>

          {!shownPrevAnswer && (
            <button
              onClick={() => setShownPrevAnswer(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl"
            >
              Show Answer
            </button>
          )}

          {shownPrevAnswer && (
            <>
              <div className="bg-white p-3 border rounded-xl text-l opacity-80 space-y-1">
                {prev2 && prev2.length > 0 ? prev2.map((x, i) => renderVerseLine(x, i)) : <div className="text-gray-500">Answer not available</div>}
              </div>

              <div className="flex gap-3">
                <button onClick={() => handleRecallPrev(true)} className="bg-green-600 text-white px-4 py-2 rounded-xl">Yes</button>
                <button onClick={() => handleRecallPrev(false)} className="bg-gray-300 px-4 py-2 rounded-xl">No</button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
