// import React from 'react';
// import ThreeBodyAnimation from "../physics/ThreeBodyAnimation";

interface CanvasProps {
  isTextPanelOpen: boolean;
}

function Canvas({ isTextPanelOpen }: CanvasProps) {
  return (
    <div
      className={`fixed top-0 right-0 h-screen transition-all duration-700 ease-in-out ${
        isTextPanelOpen ? "md:w-5/8" : "w-full"
      }`}
    >
      {/* Container for ThreeJS */}
      <div className="w-full h-full bg-black">
        <p className="text-white text-left text-5xl">Start of Canvas</p>
        {/* <ThreeBodyAnimation /> */}
      </div>
    </div>
  );
}

export default Canvas;
