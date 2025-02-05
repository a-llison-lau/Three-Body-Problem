import { ContentNode } from "../types/types";

export function parseMarkdown(markdown: string): ContentNode[] {
  const lines = markdown.split("\n");
  const root: ContentNode[] = [];
  let currentH1: ContentNode | null = null;
  let currentH2: ContentNode | null = null;
  let currentH3: ContentNode | null = null;
  let currentH4: ContentNode | null = null;

  // Buffer to accumulate text lines before adding them to a section
  let textBuffer: string[] = [];

  function flushTextBuffer() {
    if (textBuffer.length > 0) {
      const text = textBuffer.join("\n").trim();
      if (text) {
        // Add text to the most specific current heading
        const currentNode = currentH4 || currentH3 || currentH2 || currentH1;
        if (currentNode) {
          currentNode.children.push({
            type: "text",
            content: text,
            children: [],
          });
        }
      }
      textBuffer = [];
    }
  }

  lines.forEach((line) => {
    if (line.startsWith("# ")) {
      // Flush text before creating new section
      flushTextBuffer();

      currentH1 = {
        type: "h1",
        content: line.slice(2).trim(),
        children: [],
      };
      root.push(currentH1);
      currentH2 = null;
      currentH3 = null;
      currentH4 = null;
    } else if (line.startsWith("## ")) {
      flushTextBuffer();

      if (currentH1) {
        currentH2 = {
          type: "h2",
          content: line.slice(3).trim(),
          children: [],
        };
        currentH1.children.push(currentH2);
        currentH3 = null;
        currentH4 = null;
      }
    } else if (line.startsWith("### ")) {
      flushTextBuffer();

      if (currentH2) {
        currentH3 = {
          type: "h3",
          content: line.slice(4).trim(),
          children: [],
        };
        currentH2.children.push(currentH3);
        currentH4 = null;
      }
    } else if (line.startsWith("#### ")) {
      flushTextBuffer();

      if (currentH3) {
        currentH4 = {
          type: "h4",
          content: line.slice(5).trim(),
          children: [],
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
