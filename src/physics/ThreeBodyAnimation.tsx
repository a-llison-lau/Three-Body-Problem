import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Mesh,
  BufferGeometry,
  NormalBufferAttributes,
  BufferAttribute,
  AdditiveBlending,
} from "three";
import { OrbitControls } from "@react-three/drei";
import { BodyConfig } from "../types/simulation";
import { computeBodyForces, updateBodyTrail } from "../utils/physics";

// Shader constants
const VERTEX_SHADER = `
  attribute float size;
  attribute vec3 color;
  varying vec3 vColor;

  void main() {
    vColor = color;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const FRAGMENT_SHADER = `
  varying vec3 vColor;
    
  void main() {
    gl_FragColor = vec4(vColor, 1.0 - length(gl_PointCoord - vec2(0.5)) * 2.0);
  }
`;

// Initial conditions for figure-8 orbit
const FIGURE_8_BODIES: BodyConfig[] = [
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

// Constants
const TRAIL_LENGTH = 400;
const TIME_STEP = 0.01;

type SimulationBodyProps = {
  body: BodyConfig;
  trailRef: (node: BufferGeometry<NormalBufferAttributes> | null) => void;
  trailPositionsRef: number[];
};

// Individual Body Component
function SimulationBody({ body, trailRef }: SimulationBodyProps) {
  return (
    <>
      {/* Body Sphere */}
      <mesh position={[body.position.x, body.position.y, body.position.z]}>
        <sphereGeometry args={[body.size, 32, 32]} />
        <meshStandardMaterial color={body.color} />
      </mesh>

      {/* Trail */}
      <points>
        <bufferGeometry ref={trailRef} />
        <shaderMaterial
          vertexShader={VERTEX_SHADER}
          fragmentShader={FRAGMENT_SHADER}
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </points>
    </>
  );
}

// Main Simulation Component
function FigureEightOrbit() {
  const [bodies, setBodies] = useState<BodyConfig[]>(FIGURE_8_BODIES);
  const bodiesRef = useRef<(Mesh | null)[]>([null, null, null]);
  const trailRefs = useRef<(BufferGeometry | null)[]>([null, null, null]);
  const trailPositionsRef = useRef<number[][]>([[], [], []]);

  useFrame(() => {
    const currentBodies = structuredClone(bodies); // Modern deep copy

    // Compute forces
    const forces = computeBodyForces(currentBodies);

    // Update bodies using Verlet integration
    currentBodies.forEach((body) => {
      // Update position
      body.position.x += body.velocity.x * TIME_STEP;
      body.position.y += body.velocity.y * TIME_STEP;
      body.position.z += body.velocity.z * TIME_STEP;

      // Update velocity
      body.velocity.x += (forces[body.id].x / body.mass) * TIME_STEP;
      body.velocity.y += (forces[body.id].y / body.mass) * TIME_STEP;
      body.velocity.z += (forces[body.id].z / body.mass) * TIME_STEP;
    });

    // Update body positions and trails
    currentBodies.forEach((body, i) => {
      // Update body position in scene
      bodiesRef.current[i]?.position.set(
        body.position.x,
        body.position.y,
        body.position.z
      );

      // Update trail
      const { positions, colors, sizes } = updateBodyTrail(
        body,
        trailPositionsRef.current[i],
        TRAIL_LENGTH
      );

      if (trailRefs.current[i]) {
        const trail = trailRefs.current[i];
        trail?.setAttribute(
          "position",
          new BufferAttribute(new Float32Array(positions), 3)
        );
        trail?.setAttribute(
          "color",
          new BufferAttribute(new Float32Array(colors), 3)
        );
        trail?.setAttribute(
          "size",
          new BufferAttribute(new Float32Array(sizes), 1)
        );

        trail!.attributes.position.needsUpdate = true;
        trail!.attributes.color.needsUpdate = true;
        trail!.attributes.size.needsUpdate = true;
      }
    });

    setBodies(currentBodies);
  });

  return (
    <>
      {bodies.map((body, i) => (
        <SimulationBody
          key={body.id}
          body={body}
          trailRef={(el) => {
            trailRefs.current[i] = el;
          }}
          trailPositionsRef={trailPositionsRef.current[i]}
        />
      ))}

      {/* Lighting */}
      <ambientLight intensity={5} />
      <directionalLight position={[5, 5, 5]} intensity={17} />
    </>
  );
}

// Main Animation Wrapper
export default function ThreeBodySimulation() {
  return (
    <Canvas camera={{ position: [0, 0, 2] }}>
      <FigureEightOrbit />
      <OrbitControls />
    </Canvas>
  );
}
