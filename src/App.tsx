import "./App.css";
import { useState } from "react";
import TextPanel from "./components/TextPanel";
import Canvas from "./components/Canvas";

function App() {
  const [isTextPanelOpen, setIsTextPanelOpen] = useState(true);

  const handleTogglePanel = () => {
    setIsTextPanelOpen(!isTextPanelOpen);
  };

  return (
    <>
      <div>
        <div className="relative w-full h-screen overflow-hidden">
        <TextPanel isOpen={isTextPanelOpen} onToggle={handleTogglePanel} />
        <Canvas isTextPanelOpen={isTextPanelOpen} />
        </div>
      </div>
    </>
  );
}

export default App;
