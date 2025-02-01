// types.ts
interface ContentNode {
  type: 'h1' | 'h2' | 'h3' | 'h4' | 'text';
  content: string;
  children: ContentNode[];
}

interface TextPanelProps {
  isOpen: boolean;
  onToggle: () => void;
}

// parseMarkdown.ts
function parseMarkdown(markdown: string): ContentNode[] {
  const lines = markdown.split('\n');
  const root: ContentNode[] = [];
  let currentH1: ContentNode | null = null;
  let currentH2: ContentNode | null = null;
  let currentH3: ContentNode | null = null;
  let currentH4: ContentNode | null = null;
  let textBuffer: string[] = [];

  function flushTextBuffer() {
    if (textBuffer.length > 0) {
      const text = textBuffer.join('\n').trim();
      if (text) {
        // Add text to the most specific current heading
        const currentNode = currentH4 || currentH3 || currentH2 || currentH1;
        if (currentNode) {
          currentNode.children.push({
            type: 'text',
            content: text,
            children: []
          });
        }
      }
      textBuffer = [];
    }
  }

  lines.forEach((line) => {
    if (line.startsWith('# ')) {
      // Flush text before creating new section
      flushTextBuffer();
      
      currentH1 = {
        type: 'h1',
        content: line.slice(2).trim(),
        children: []
      };
      root.push(currentH1);
      currentH2 = null;
      currentH3 = null;
      currentH4 = null;
    } else if (line.startsWith('## ')) {
      flushTextBuffer();
      
      if (currentH1) {
        currentH2 = {
          type: 'h2',
          content: line.slice(3).trim(),
          children: []
        };
        currentH1.children.push(currentH2);
        currentH3 = null;
        currentH4 = null;
      }
    } else if (line.startsWith('### ')) {
      flushTextBuffer();
      
      if (currentH2) {
        currentH3 = {
          type: 'h3',
          content: line.slice(4).trim(),
          children: []
        };
        currentH2.children.push(currentH3);
        currentH4 = null;
      }
    } else if (line.startsWith('#### ')) {
      flushTextBuffer();
      
      if (currentH3) {
        currentH4 = {
          type: 'h4',
          content: line.slice(5).trim(),
          children: []
        };
        currentH3.children.push(currentH4);
      }
    } else {
      // Accumulate text content
      if (line.trim()) {
        textBuffer.push(line);
      }
    }
  });

  // Flush any remaining text at the end
  flushTextBuffer();

  return root;
}

// TextPanel.tsx
import { MathJax, MathJaxContext } from "better-react-mathjax";
import { BsArrowLeftCircle, BsArrowBarRight } from "react-icons/bs";
import { useEffect, useState } from "react";

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

const RenderContent: React.FC<{ node: ContentNode }> = ({ node }) => {
  switch (node.type) {
    case 'h1':
      return (
        <div className="mb-0">
          <div className="sticky -top-4 p-3 z-10 -mx-4 supports-backdrop-blur:bg-gray-50/80 backdrop-blur-md border-b-1">
            <h1 className="text-xl font-bold text-left opacity-100">{node.content}</h1>
          </div>
          <div className="mt-4 text-left">
            {node.children.map((child, index) => (
              <RenderContent key={index} node={child} />
            ))}
          </div>
        </div>
      );
    case 'h2':
      return (
        <div className="mt-4">
          <h2 className="text-lg font-semibold mt-4 mb-2">{node.content}</h2>
          {node.children.map((child, index) => (
            <RenderContent key={index} node={child} />
          ))}
        </div>
      );
    case 'h3':
      return (
        <div className="mt-3">
          <h3 className="text-md font-medium mt-3 mb-2">{node.content}</h3>
          {node.children.map((child, index) => (
            <RenderContent key={index} node={child} />
          ))}
        </div>
      );
    case 'h4':
      return (
        <div className="mt-2">
          <h4 className="text-sm font-medium mt-2 mb-2">{node.content}</h4>
          {node.children.map((child, index) => (
            <RenderContent key={index} node={child} />
          ))}
        </div>
      );
    case 'text':
      return (
        <div className="overflow-x-auto">
          <MathJax hideUntilTypeset={"first"}>
            {node.content.split('\n').map((paragraph, index) => 
              paragraph.trim() && (
                <p key={index} className="mb-4">{paragraph}</p>
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
        <div className="fixed top-4 left-4 text-3xl cursor-pointer z-20 block" onClick={onToggle}>
          <BsArrowBarRight color="white" />
        </div>
      )}

      <div
        className={`relative bg-gray-50 p-4 h-full overflow-x-hidden overflow-y-auto rounded-lg shadow-lg transform transition-all duration-1000 ease-in-out ${
          isOpen ? "opacity-100 translate-x-0 md:w-1/3 w-full" : "opacity-0 -translate-x-full w-0"
        }`}
        style={{
          height: "92vh",
          boxShadow: "4px 6px 17px 2px rgba(255, 255, 255, 0.5)",
          zIndex: 10,
        }}
      >
        {isOpen && (
          <MathJaxContext version={3} config={config}>
            {isOpen && (
              <div className="absolute top-3 right-4 text-2xl cursor-pointer z-20" onClick={onToggle}>
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