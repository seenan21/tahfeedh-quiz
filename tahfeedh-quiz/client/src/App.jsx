import { useState } from 'react'
import Silk from './components/Silk';
import './index.css'; // make sure Tailwind is imported here
import ContainerCard from './components/ContainerCard';


function App() {
  const [stage, setStage] = useState("intro");
  const [selectedParts, setSelectedParts] = useState(new Set());
  

  return (
    <>
    
    <div className="absolute inset-0 -z-10">
        <Silk 
          speed={2}
          scale={0.5}
          color="#15351E"
          noiseIntensity={0.5}
          rotation={4}
        />
      </div>

    {/* Static Title  */}
      {stage !== "intro" && (
        <div className="flex justify-center">
          <div className="inline-block bg-[#FFFFC1] text-[#15351E] px-16 py-4 rounded-xl shadow-lg text-center mt-2">
            <div className="text-3xl font-semibold mb-1 title-ar">اختبار القرآن</div>
            <div className="text-3xl title-en">Qur'an Quiz</div>
          </div>
        </div>

      )}


      {stage == "select" && (
      <ContainerCard stage={stage} setStage={setStage}/>
    )}
      
      {stage !== "intro" && (
      <ContainerCard stage={stage} setStage={setStage}/>
    )}







      
   
    </>
  )
}

export default App
