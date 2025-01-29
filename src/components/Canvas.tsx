// import React from 'react';
// import ThreeBodyAnimation from "../physics/ThreeBodyAnimation";

import ThreeBodyAnimation from "../physics/ThreeBodyAnimation";

interface CanvasProps {
  isTextPanelOpen: boolean;
}

function Canvas({ isTextPanelOpen }: CanvasProps) {
  return (
    <div
      className={`fixed top-0 right-0 h-full transition-all duration-700 ease-in-out ${
        isTextPanelOpen ? "md:w-2/3" : "w-full"
      }
      }`}
      style={{ zIndex: 0 }}
    >
      Container for ThreeJS
      <div className="w-full h-full bg-black">
        <ThreeBodyAnimation />
      </div>
    </div>
  );
}

export default Canvas;
