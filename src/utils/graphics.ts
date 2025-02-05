import { BodyConfig } from "../types/types";

export const updateBodyTrail = (
    body: BodyConfig,
    trailPositions: number[],
    trailLength: number
  ): { positions: number[]; colors: number[]; sizes: number[] } => {
    // Add current position to trail
    trailPositions.unshift(body.position.x, body.position.y, body.position.z);
  
    // Trim trail to specified length
    if (trailPositions.length > trailLength * 3) {
      trailPositions.splice(trailLength * 3);
    }
  
    // Create color gradient and size arrays
    const colors: number[] = [];
    const sizes: number[] = [];
  
    for (let j = 0; j < trailLength && j * 3 < trailPositions.length; j++) {
      const ratio = j / trailLength;
  
      const baseColor =
        body.color === "red"
          ? [1, 0, 0]
          : body.color === "green"
          ? [0, 1, 0]
          : [0, 0, 1];
  
      colors.push(
        baseColor[0] * (1 - ratio) + ratio,
        baseColor[1] * (1 - ratio) + ratio,
        baseColor[2] * (1 - ratio) + ratio
      );
  
      sizes.push(0.1 * (1 - ratio));
    }
  
    return {
      positions: trailPositions,
      colors,
      sizes,
    };
  };