import React from "react";

function IntroCard({ setStage }) {
  function handleContinue() {
    setStage("select");
  }

  return (
    <div className="flex-grow z-10 flex items-center justify-center px-4 py-6">
      <div className="bg-[#FFFFC1] w-full max-w-md p-8 rounded-2xl shadow-xl text-center">

        <h1 className="text-2xl font-semibold text-[#15351E] mb-4 title-ar ">
        اختبار حفظ القرآن
        </h1>

        <h1 className="text-2xl font-semibold text-[#15351E] mb-4">
          Qur'an Memorization Quiz
        </h1>

       
        <h2>حَدَّثَنَا مُحَمَّدُ بْنُ الْعَلاَءِ، حَدَّثَنَا أَبُو أُسَامَةَ، عَنْ بُرَيْدٍ، عَنْ أَبِي بُرْدَةَ، عَنْ أَبِي مُوسَى، عَنِ النَّبِيِّ صلى الله عليه وسلم قَالَ ‏ <strong>"تَعَاهَدُوا الْقُرْآنَ فَوَالَّذِي نَفْسِي بِيَدِهِ لَهُوَ أَشَدُّ تَفَصِّيًا مِنَ الإِبِلِ فِي عُقُلِهَا"</strong>‏.‏</h2>
        <h2>Narrated Abu Musa: The Prophet (ﷺ) said, <strong>"Commit yourself to the Qur'an, for by Him in whose Hand is my soul, it is surely more prone to break away than a camel in its bind."</strong></h2>
        <h2>[Sahih al-Bukhari 5033]</h2>
        <br></br>
        <p className="text-[#15351E]/90 text-sm leading-relaxed mb-6 text-left ml-4">
            <li>Select how many Chapters of the Qur'an you have memorized.</li>
            <li>Test how well your memorization of the Qur'an is.</li>
            
            <li>See how well you do.</li>
            <li>Revise, and hold on strong to the Qur'an and Sunnah.</li>
            <li>Share goodness with your friends and family.</li>
        
        </p>

        <button
          onClick={handleContinue}
          className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-3 rounded-full shadow-md transition duration-300"
        >
          Begin
        </button>
      </div>
    </div>
  );
}

export default IntroCard;
