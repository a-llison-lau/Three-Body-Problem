import DropupMenus from "./DropupMenus";
import ThreeBodyAnimation from "../physics/ThreeBodyAnimation";
import StatsDisplay from "./StatsDisplay";
import { useState } from "react";
import { Vector3 } from "../types/types";

interface CanvasProps {
  isTextPanelOpen: boolean;
}

function Canvas({ isTextPanelOpen }: CanvasProps) {
  const [simulationStats, setSimulationStats] = useState<{
    momentumChange: Vector3;
    energyChange: number;
    velocities: Vector3[];
  } | null>(null);

  return (
    <div
      className={`fixed top-0 right-0 h-full transition-all duration-700 ease-in-out ${
        isTextPanelOpen ? "md:w-2/3" : "w-full"
      }`}
      style={{ zIndex: 0 }}
    >
      <div className="w-full h-full bg-black">
        <ThreeBodyAnimation onStatsUpdate={setSimulationStats} />
      </div>
      <div className="absolute bottom-0 left-0 flex h-32 w-full p-4 gap-4">
        <DropupMenus />
        <StatsDisplay stats={simulationStats} />
      </div>
    </div>
  );
}

export default Canvas;
