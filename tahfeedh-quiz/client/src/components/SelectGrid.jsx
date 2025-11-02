import React, { useState, useEffect } from "react";

function SelectGrid({
  selectedChapters,
  toggleChapter,
  toggleRange,
  toggleSelectAll,
  setStage,
}) {
  const groups = Array.from({ length: 6 }, (_, g) =>
    Array.from({ length: 5 }, (_, i) => g * 5 + i)
  );

  const [openGroups, setOpenGroups] = useState(() => Array(6).fill(true));
  const [showToast, setShowToast] = useState(false);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    setOpenGroups(() =>
      groups.map((group) => {
        const allSelected = group.every((idx) => !!selectedChapters[idx]);
        return !allSelected;
      })
    );
  }, [selectedChapters]);

  function toggleGroupOpen(gi) {
    setOpenGroups((prev) => {
      const next = prev.slice();
      next[gi] = !next[gi];
      return next;
    });
  }

  const allSelected = selectedChapters.every(Boolean);

  const toArabicNumerals = (num) =>
    String(num).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[parseInt(d, 10)]);

  const baseButton =
    "flex items-center gap-3 px-3 py-1 rounded-md border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-200";
  const unselectedButton =
    "bg-white text-green-600 border-green-300 hover:bg-green-50 hover:border-green-400";
  const selectedButton =
    "bg-green-600 text-white border-green-600 hover:bg-green-700";

  function handleStart() {
    const ready = selectedChapters.some((item) => Boolean(item));
    if (!ready) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
      return;
    }

    // fade-out transition before switching stage
    setIsFading(true);
    setTimeout(() => {
      setStage("quiz");
    }, 600);
  }

  return (
    <div
      className={`flex-grow z-20 flex items-center justify-center px-4 py-6 transition-opacity duration-700 ${
        isFading ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="bg-[#FFFFC1] w-full max-w-xl p-6 rounded-2xl shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            How much of the Qur'an have you memorized?
          </h2>

          {/* Top toggle-all button */}
          <button
            onClick={toggleSelectAll}
            className={`${baseButton} ${
              allSelected ? selectedButton : unselectedButton
            }`}
            aria-pressed={allSelected}
          >
            <span
              className={`flex items-center justify-center w-4 h-4 rounded-sm border-2 transition-colors duration-200 ${
                allSelected
                  ? "border-white bg-transparent"
                  : "border-green-600 bg-white"
              }`}
              aria-hidden
            >
              {allSelected && (
                <svg
                  className="w-3 h-3 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20 6L9 17L4 12"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </span>
            <span className="text-sm font-medium">
              I memorized the whole Qur'an
            </span>
          </button>
        </div>

        {/* Groups */}
        <div className="grid grid-cols-1 gap-4 mb-6">
          {groups.map((group, gi) => {
            const groupStart = group[0] + 1;
            const groupEnd = group[group.length - 1] + 1;
            const groupAllSelected = group.every(
              (idx) => selectedChapters[idx]
            );
            const isOpen = !!openGroups[gi];
            const buttonText = `I memorized Juz ${groupStart} - ${groupEnd}`;

            return (
              <div
                key={gi}
                className="bg-white rounded-xl p-3 shadow-sm border border-gray-100"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-medium">
                    جُزْء {toArabicNumerals(groupStart)} -{" "}
                    {toArabicNumerals(groupEnd)}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleRange(group)}
                      className={`${baseButton} ${
                        groupAllSelected ? selectedButton : unselectedButton
                      }`}
                      aria-pressed={groupAllSelected}
                    >
                      <span
                        className={`flex items-center justify-center w-4 h-4 rounded-sm border-2 transition-colors duration-200 ${
                          groupAllSelected
                            ? "border-white bg-transparent"
                            : "border-green-600 bg-white"
                        }`}
                      >
                        {groupAllSelected && (
                          <svg
                            className="w-3 h-3 text-white"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M20 6L9 17L4 12"
                              stroke="white"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </span>
                      <span className="text-sm font-medium">{buttonText}</span>
                    </button>

                    <button
                      onClick={() => toggleGroupOpen(gi)}
                      className="p-2 rounded-full hover:bg-gray-100 transition"
                    >
                      <svg
                        className={`w-4 h-4 transition-transform ${
                          isOpen ? "rotate-180" : "rotate-0"
                        }`}
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M5 8L10 13L15 8"
                          stroke="#333"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div className="grid grid-cols-5 gap-2">
                    {group.map((idx) => {
                      const isSelected = !!selectedChapters[idx];
                      const chapterNum = idx + 1;
                      const arabicTop = `جُزْء ${toArabicNumerals(chapterNum)}`;
                      const englishLine = `Juz ${chapterNum}`;

                      return (
                        <button
                          key={idx}
                          onClick={() => toggleChapter(idx)}
                          className={`relative rounded-lg p-3 text-xs text-center transition-colors duration-200 cursor-pointer ${
                            isSelected
                              ? "bg-green-100 text-green-800 border border-green-300 hover:bg-green-200"
                              : "bg-white text-gray-800 border border-gray-200 hover:bg-green-50"
                          }`}
                        >
                          <span
                            className={`absolute top-2 right-2 w-4 h-4 rounded-sm flex items-center justify-center border ${
                              isSelected
                                ? "bg-white border-white"
                                : "bg-white border-gray-300"
                            }`}
                          >
                            {isSelected && (
                              <svg
                                className="w-3 h-3 text-green-700"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M20 6L9 17L4 12"
                                  stroke="#16A34A"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                          </span>

                          <div className="flex flex-col items-center justify-between h-full min-h-[56px]">
                            <div className="card-header-ar text-[13px] leading-tight mb-1">
                              {arabicTop}
                            </div>
                            <div className="card-header-en text-[12px] font-medium mt-2">
                              {englishLine}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Start Button */}
        <div className="flex justify-center">
          <button
            onClick={handleStart}
            className="bg-[#15351E] text-[#FFFFC1] text-lg font-semibold py-3 px-12 rounded-full shadow-lg hover:bg-[#1b4225] transition-transform transform hover:scale-105"
          >
            Start the Quiz
          </button>
        </div>

        {/* Toast Notification */}
        <div
          className={`fixed top-6 left-1/2 transform -translate-x-1/2 bg-[#15351E] text-[#FFFFC1] px-6 py-3 rounded-full shadow-xl text-sm font-medium transition-all duration-500 ${
            showToast
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10 pointer-events-none"
          }`}
        >
          You must have at least one Juz memorized to start the quiz.
        </div>
      </div>
    </div>
  );
}

export default SelectGrid;
