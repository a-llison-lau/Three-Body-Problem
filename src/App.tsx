import "./App.css";
import { useState } from "react";
import TextPanel from "./components/TextPanel";
import Canvas from "./components/Canvas";
import Authors from "./components/Authors";
import Info from "./components/Info";

function App() {
  // On phones the panel would cover the whole animation, so it starts closed there.
  const [isTextPanelOpen, setIsTextPanelOpen] = useState(
    () => window.innerWidth >= 768
  );

  const handleTogglePanel = () => {
    setIsTextPanelOpen(!isTextPanelOpen);
  };

  return (
    <>
      <div>
        <div className="relative w-full h-full overflow-hidden">
          <Info />
          <TextPanel isOpen={isTextPanelOpen} onToggle={handleTogglePanel} />
          <Canvas isTextPanelOpen={isTextPanelOpen} />
          <Authors />
        </div>
      </div>
    </>
  );
}

export default App;
