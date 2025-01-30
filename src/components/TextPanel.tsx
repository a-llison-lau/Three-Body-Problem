import { MathJax, MathJaxContext } from "better-react-mathjax";
import { BsArrowLeftCircle, BsArrowBarRight } from "react-icons/bs";
import { useEffect, useState } from "react";

interface TextPanelProps {
  isOpen: boolean;
  onToggle: () => void;
}

interface Section {
  h1: string;
  h2: string;
  h3: string;
  h4: string;
  main_text: string;
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

function parseMarkdown(markdown: string): Section[] {
  const sections: Section[] = [];
  let currentSection: Section = {
    h1: "",
    h2: "",
    h3: "",
    h4: "",
    main_text: "",
  };

  const lines = markdown.split("\n");
  let mainTextBuffer: string[] = [];

  lines.forEach((line) => {
    if (line.startsWith("# ")) {
      // If we have a previous section, save it
      if (currentSection.h1) {
        currentSection.main_text = mainTextBuffer.join("\n").trim();
        sections.push({ ...currentSection });
      }
      // Start new section
      currentSection = {
        h1: line.slice(2).trim(),
        h2: "",
        h3: "",
        h4: "",
        main_text: "",
      };
      mainTextBuffer = [];
    } else if (line.startsWith("## ")) {
      currentSection.h2 = line.slice(3).trim();
    } else if (line.startsWith("### ")) {
      currentSection.h3 = line.slice(4).trim();
    } else if (line.startsWith("#### ")) {
      currentSection.h4 = line.slice(5).trim();
    } else {
      mainTextBuffer.push(line);
    }
  });

  // Don't forget to add the last section
  if (currentSection.h1) {
    currentSection.main_text = mainTextBuffer.join("\n").trim();
    sections.push(currentSection);
  }

  return sections;
}

function TextPanel({ isOpen, onToggle }: TextPanelProps) {
  const [sections, setSections] = useState<Section[]>([]);

  useEffect(() => {
    // Load and parse the markdown file
    fetch("/content.md")
      .then((response) => response.text())
      .then((text) => {
        const parsedSections = parseMarkdown(text);
        setSections(parsedSections);
      })
      .catch((error) => console.error("Error loading markdown:", error));
  }, []);

  return (
    <div className="relative">
      {/* Expand button */}
      {!isOpen && (
        <div
          className="fixed top-4 left-4 text-3xl cursor-pointer z-20 block"
          onClick={onToggle}
        >
          <BsArrowBarRight color="white" />
        </div>
      )}

      <div
        className={`relative bg-gray-50 p-4 h-full overflow-x-hidden overflow-y-auto rounded-lg shadow-lg transform transition-all duration-1000 ease-in-out ${
          isOpen
            ? "opacity-100 translate-x-0 md:w-1/3 w-full"
            : "opacity-0 -translate-x-full w-0"
        }`}
        style={{
          height: "92vh",
          boxShadow: "4px 6px 17px 2px rgba(255, 255, 255, 0.5)",
          zIndex: 10,
        }}
      >
        {isOpen && (
          <MathJaxContext version={3} config={config}>
            {sections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="mb-0">
                {/* Sticky H1 Header */}
                <div className="sticky -top-4 p-3 z-10 -mx-4 supports-backdrop-blur:bg-gray-50/80 backdrop-blur-md border-b-1 ">
                  <h1 className="text-xl font-bold text-left opacity-100">
                    {section.h1}
                  </h1>
                  {/* Collapse button */}
                  {isOpen && (
                    <div
                      className="absolute top-3 right-4 text-2xl cursor-pointer z-20"
                      onClick={onToggle}
                    >
                      <BsArrowLeftCircle />
                    </div>
                  )}
                </div>

                {/* Non-sticky headers and content */}
                <div className="mt-4 text-left">
                  {section.h2 && (
                    <h2 className="text-lg font-semibold mt-4 mb-2">
                      {section.h2}
                    </h2>
                  )}
                  {section.h3 && (
                    <h3 className="text-md font-medium mt-3 mb-2">
                      {section.h3}
                    </h3>
                  )}
                  {section.h4 && (
                    <h4 className="text-sm font-medium mt-2 mb-2">
                      {section.h4}
                    </h4>
                  )}
                  <div className="overflow-x-auto">
                    <MathJax hideUntilTypeset={"first"}>
                      {section.main_text.split("\n").map(
                        (paragraph, index) =>
                          paragraph.trim() && (
                            <p key={index} className="mb-4">
                              {paragraph}
                            </p>
                          )
                      )}
                    </MathJax>
                  </div>
                </div>
              </div>
            ))}
          </MathJaxContext>
        )}
      </div>
    </div>
  );
}

export default TextPanel;
