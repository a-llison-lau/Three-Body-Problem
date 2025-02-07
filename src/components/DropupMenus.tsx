import { useState } from "react";
import { Check, ChevronUp, Circle } from "lucide-react";

// Orbit options
const orbitOptions = [
  "Bumblebee",
  "Butterfly I",
  "Butterfly II",
  "Butterfly III",
  "Butterfly IV",
  "Dragonfly",
  "Figure of 8",
  "Moth I",
  "Moth II",
  "Moth III",
];

// Integrator options
const integratorOptions = [
  "Neri (4th)",
  "Ruth (3rd)",
  "Verlet (2nd)",
  "Euler (1st)",
];

interface DropupMenusProps {
  onIntegratorChange: (integrator: string) => void;
  onOrbitChange: (orbit: string) => void;
}

function DropupMenus({ onIntegratorChange, onOrbitChange }: DropupMenusProps) {
  const [orbitMenuOpen, setOrbitMenuOpen] = useState(false);
  const [integratorMenuOpen, setIntegratorMenuOpen] = useState(false);
  const [selectedOrbit, setSelectedOrbit] = useState<string | null>(null);
  const [selectedIntegrator, setSelectedIntegrator] = useState<string | null>(
    null
  );

  return (
    <div>
      {/* Orbit Button and Drop-up Menu */}
      <div className="flex flex-col">
        <div className="relative ml-5">
          <button
            className="w-32 h-10 supports-backdrop-blur:bg-white/90 backdrop-blur-xl text-zinc-300 rounded-md mb-2 flex items-center justify-between px-3 hover:bg-gray-950"
            style={{
              boxShadow: "2px 2px 10px 1px rgba(120, 120, 120, 0.5)",
              zIndex: 10,
            }}
            onClick={() => setOrbitMenuOpen(!orbitMenuOpen)}
          >
            {selectedOrbit || "Orbit"}
            {selectedOrbit ? null : orbitMenuOpen ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <Circle className="w-2 h-2" />
            )}
          </button>
          {orbitMenuOpen && (
            <ul className="absolute bottom-full mb-2 w-32 supports-backdrop-blur:bg-white/90 backdrop-blur-xl text-zinc-300 rounded-md overflow-hidden">
              {orbitOptions.map((option, index) => (
                <li
                  key={index}
                  className="px-4 py-2 text-white hover:bg-gray-900 cursor-pointer flex items-center justify-between"
                  onClick={() => {
                    console.log(`Selected Orbit: ${option}`);
                    setSelectedOrbit(option);
                    onOrbitChange(option);
                    setOrbitMenuOpen(false);
                  }}
                >
                  {option}
                  {selectedOrbit === option && (
                    <Check className="w-4 h-4 text-green-500" />
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Integrator Button and Drop-up Menu */}
      <div className="relative ml-5">
        <button
          className="w-32 h-10 supports-backdrop-blur:bg-white/90 backdrop-blur-xl text-zinc-300 rounded-md mb-2 flex items-center justify-between px-3 hover:bg-gray-950"
          style={{
            boxShadow: "2px 2px 10px 1px rgba(120, 120, 120, 0.5)",
            zIndex: 10,
          }}
          onClick={() => setIntegratorMenuOpen(!integratorMenuOpen)}
        >
          {selectedIntegrator || "Integrator"}
          {selectedIntegrator ? null : integratorMenuOpen ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <Circle className="w-2 h-2" />
          )}
        </button>
        {integratorMenuOpen && (
          <ul className="absolute bottom-full mb-2 w-32 supports-backdrop-blur:bg-white/90 backdrop-blur-xl text-zinc-300 rounded-md overflow-hidden">
            {integratorOptions.map((option, index) => (
              <li
                key={index}
                className="px-4 py-2 text-white hover:bg-gray-900 cursor-pointer flex items-center justify-between"
                onClick={() => {
                  console.log(`Selected Integrator: ${option}`);
                  setSelectedIntegrator(option);
                  onIntegratorChange(option);
                  setIntegratorMenuOpen(false);
                }}
              >
                {option}
                {selectedIntegrator === option && (
                  <Check className="w-4 h-4 text-green-500" />
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default DropupMenus;
