import { BodyConfig } from "../types/types";

export const FIGURE_8_BODIES: BodyConfig[] = [
  {
    id: "0",
    position: { x: 0.97000436, y: -0.24308753, z: 0 },
    velocity: { x: 0.93240737 / 2, y: 0.86473146 / 2, z: 0 },
    mass: 1,
    color: "red",
    size: 0.1,
  },
  {
    id: "1",
    position: { x: -0.97000436, y: 0.24308753, z: 0 },
    velocity: { x: 0.93240737 / 2, y: 0.86473146 / 2, z: 0 },
    mass: 1,
    color: "green",
    size: 0.1,
  },
  {
    id: "2",
    position: { x: 0, y: 0, z: 0 },
    velocity: { x: -0.93240737, y: -0.86473146, z: 0 },
    mass: 1,
    color: "blue",
    size: 0.1,
  },
];
