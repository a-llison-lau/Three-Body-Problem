// import { useState } from "react";
import { MathJax, MathJaxContext } from "better-react-mathjax";
import { BsArrowLeftCircle, BsArrowBarRight } from "react-icons/bs";

interface TextPanelProps {
  isOpen: boolean;
  onToggle: () => void;
}

const config = {
  loader: { load: ["[tex]/html"] },
  tex: {
    packages: { "[+]": ["html"] },
    inlineMath: [
      ["$", "$"],
      ["\\(", "\\)"],
    ],
    displayMath: [
      ["$$", "$$"],
      ["\\[", "\\]"],
    ],
  },
};

const content = `
Inside a MathJax block element, one might use both Latex inline math, such as \\(x\\) or \\(\\frac{25x}{10} = 2^{10}\\), but then also switch to Latex display math, like
\\[\\sum_{n = 100}^{1000}\\left(\\frac{10\\sqrt{n}}{n}\\right)  + \\sum_{n = 100}^{1000}\\left(\\frac{10\\sqrt{n}}{n}\\right) + \\sum_{n = 100}^{1000}\\left(\\frac{10\\sqrt{n}}{n}\\right)\\]
and then continue with inline math.

Inside a MathJax block element, one might use both Latex inline math, such as \\(x\\) or \\(\\frac{25x}{10} = 2^{10}\\), but then also switch to Latex display math, like
\\[\\sum_{n = 100}^{1000}\\left(\\frac{10\\sqrt{n}}{n}\\right)\\]
and then continue with inline math.

Inside a MathJax block element, one might use both Latex inline math, such as \\(x\\) or \\(\\frac{25x}{10} = 2^{10}\\), but then also switch to Latex display math, like
\\[\\sum_{n = 100}^{1000}\\left(\\frac{10\\sqrt{n}}{n}\\right)\\]
and then continue with inline math.

Inside a MathJax block element, one might use both Latex inline math, such as \\(x\\) or \\(\\frac{25x}{10} = 2^{10}\\), but then also switch to Latex display math, like
\\[\\sum_{n = 100}^{1000}\\left(\\frac{10\\sqrt{n}}{n}\\right)\\]
and then continue with inline math.
`;

function TextPanel({ isOpen, onToggle }: TextPanelProps) {
  return (
    <div className="relative">
      {/* Collapse button */}
      {!isOpen && (
        <div
          className="fixed top-4 left-4 text-3xl cursor-pointer z-20 block"
          onClick={onToggle}
        >
          <BsArrowBarRight color="white" />
        </div>
      )}

      <div
        className={`relative bg-gray-50 p-4 h-screen overflow-x-hidden overflow-y-auto rounded-lg shadow-lg transform transition-all duration-1000 ease-in-out ${
          isOpen
            ? "opacity-100 translate-x-0 md:w-1/3 w-full"
            : "opacity-0 -translate-x-full w-0"
        }`}
        style={{
          height: "90vh",
          boxShadow: "4px 6px 17px 2px rgba(255, 255, 255, 0.5)",
          zIndex: 10,
        }}
      >
        {/* Expand button */}
        {isOpen && (
          <div
            className="absolute top-4 right-4 text-2xl cursor-pointer z-20"
            onClick={onToggle}
          >
            <BsArrowLeftCircle />
          </div>
        )}

        {isOpen && (
          <>
            {/* Header for Section 1 */}
            <div className="sticky -top-4 bg-gray-100 p-4 z-10 -mx-4 -mt-4 opacity-92 border-b-1">
              <h2 className="text-xl font-bold text-left">Section 1</h2>
            </div>
            {/* Content of Section 1 */}
            <div className="mt-4 text-left">
              <MathJaxContext version={3} config={config}>
                {content.split("\n").map((paragraph, index) => (
                  <div key={index} className="mb-4">
                    <div className="overflow-x-auto">
                      <MathJax hideUntilTypeset={"first"}>{paragraph}</MathJax>
                    </div>
                  </div>
                ))}
              </MathJaxContext>
            </div>

            {/* Header for Section 2 */}
            <div className="sticky -top-4 bg-gray-100 p-4 z-10 -mx-4 -mt-4 opacity-92">
              <h2 className="text-xl font-bold text-left">Section 2</h2>
            </div>
            {/* Content of Section 2 */}
            <div className="mt-4 text-left">
              <MathJaxContext version={3} config={config}>
                {content.split("\n").map((paragraph, index) => (
                  <div key={index} className="mb-4">
                    <div className="overflow-x-auto">
                      <MathJax hideUntilTypeset={"first"}>{paragraph}</MathJax>
                    </div>
                  </div>
                ))}
              </MathJaxContext>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default TextPanel;
