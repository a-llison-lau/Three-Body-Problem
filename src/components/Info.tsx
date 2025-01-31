import { useState } from "react";
import { IoInformationCircleOutline } from "react-icons/io5";
import { FiGithub, FiX } from "react-icons/fi";

function Info() {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="absolute top-1 right-1 z-10">
      {/* Info button */}
      <div
        className="text-xl cursor-pointer hover:opacity-70 transition-opacity"
        onClick={() => setShowInfo(!showInfo)}
      >
        <IoInformationCircleOutline color="gray" />
      </div>

      {/* Info panel */}
      {showInfo && (
        <div className="absolute top-8 right-0 supports-backdrop-blur:bg-white/90 backdrop-blur-2xl text-white p-4 rounded-lg shadow-lg w-64">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold">Navigation</h3>
            {/* Close button */}
            <button
              onClick={() => setShowInfo(false)}
              className="text-gray-500 hover:text-white"
            >
              <FiX />
            </button>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <strong>Rotate:</strong> Left click + Drag
            </div>
            <div>
              <strong>Pan:</strong> Ctrl + Left click + Drag
            </div>
            <div>
              <strong>Zoom:</strong> Scroll wheel
            </div>
          </div>

          {/* Github button */}
          <div className="mt-3 flex justify-center">
            <a
              href="https://github.com/a-llison-lau/three-body-problem"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 transition-colors"
            >
              <FiGithub />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default Info;
