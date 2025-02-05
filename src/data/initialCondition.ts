import { BodyConfig } from "../types/types";

export const FIGURE_8_BODIES: BodyConfig[] = [
  {
    id: "0",
    position: { x: -1, y: 0, z: 0 },
    velocity: { x: 0.3471128135672417, y: 0.532726851767674, z: 0 },
    mass: 1,
    color: "red",
    size: 0.1,
  },
  {
    id: "1",
    position: { x: 1, y: 0, z: 0 },
    velocity: { x: 0.3471128135672417, y: 0.532726851767674, z: 0 },
    mass: 1,
    color: "green",
    size: 0.1,
  },
  {
    id: "2",
    position: { x: 0, y: 0, z: 0 },
    velocity: { x: -2 * 0.3471128135672417, y: -2 * 0.532726851767674, z: 0 },
    mass: 1,
    color: "blue",
    size: 0.1,
  },
];
