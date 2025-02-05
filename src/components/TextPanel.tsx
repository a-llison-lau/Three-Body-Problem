import { MathJax, MathJaxContext } from "better-react-mathjax";
import { BsArrowLeftCircle, BsArrowBarRight } from "react-icons/bs";
import { useEffect, useState } from "react";
import { ContentNode } from "../types/types";
import { parseMarkdown } from "../utils/parseMarkdown";

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

// Handle collapse and expand
interface TextPanelProps {
  isOpen: boolean;
  onToggle: () => void;
}

const RenderContent = ({ node }: { node: ContentNode }) => {
  switch (node.type) {
    case "h1":
      return (
        <div className="mb-0">
          <div className="sticky -top-4 p-3 z-10 -mx-4 supports-backdrop-blur:bg-gray-50/80 backdrop-blur-sm border-b-1 border-zinc-300">
            <h1 className="text-xl font-bold text-left opacity-100">
              {node.content}
            </h1>
          </div>
          <div className="mt-4 text-left">
            {node.children.map((child, index) => (
              <RenderContent key={index} node={child} />
            ))}
          </div>
        </div>
      );
    case "h2":
      return (
        <div className="mt-4">
          <h2 className="text-lg font-semibold mt-4 mb-2">{node.content}</h2>
          {node.children.map((child, index) => (
            <RenderContent key={index} node={child} />
          ))}
        </div>
      );
    case "h3":
      return (
        <div className="mt-3">
          <h3 className="text-md font-medium mt-3 mb-2">{node.content}</h3>
          {node.children.map((child, index) => (
            <RenderContent key={index} node={child} />
          ))}
        </div>
      );
    case "h4":
      return (
        <div className="mt-2">
          <h4 className="text-sm font-medium mt-2 mb-2">{node.content}</h4>
          {node.children.map((child, index) => (
            <RenderContent key={index} node={child} />
          ))}
        </div>
      );
    case "text":
      return (
        <div className="overflow-x-auto">
          <MathJax hideUntilTypeset={"first"}>
            {node.content.split("\n").map(
              (paragraph, index) =>
                paragraph.trim() && (
                  <p key={index} className="mb-4">
                    {paragraph}
                  </p>
                )
            )}
          </MathJax>
        </div>
      );
    default:
      return null;
  }
};

function TextPanel({ isOpen, onToggle }: TextPanelProps) {
  const [content, setContent] = useState<ContentNode[]>([]);

  useEffect(() => {
    fetch("/content.md")
      .then((response) => response.text())
      .then((text) => {
        const parsedContent = parseMarkdown(text);
        setContent(parsedContent);
      })
      .catch((error) => console.error("Error loading markdown:", error));
  }, []);

  return (
    <div className="relative">
      {!isOpen && (
        <div
          className="fixed top-4 left-4 text-3xl cursor-pointer z-20 block"
          onClick={onToggle}
        >
          <BsArrowBarRight color="white" />
        </div>
      )}

      <div
        className={`relative supports-backdrop-blur:bg-white/50 backdrop-blur-2xl text-zinc-300 p-4 h-full overflow-x-hidden overflow-y-auto rounded-lg shadow-lg transform transition-all duration-1000 ease-in-out ${
          isOpen
            ? "opacity-100 translate-x-0 md:w-1/3"
            : "opacity-0 -translate-x-full w-0"
        }`}
        style={{
          height: "92vh",
          boxShadow: "6px 6px 17px 2px rgba(49, 49, 49, 0.5)",
          zIndex: 10,
        }}
      >
        {isOpen && (
          <MathJaxContext version={3} config={config}>
            {/* Collapse button */}
            {isOpen && (
              <div
                className="absolute top-5 right-4 text-2xl cursor-pointer z-20"
                onClick={onToggle}
              >
                <BsArrowLeftCircle />
              </div>
            )}
            {content.map((node, index) => (
              <RenderContent key={index} node={node} />
            ))}
          </MathJaxContext>
        )}
      </div>
    </div>
  );
}

export default TextPanel;
