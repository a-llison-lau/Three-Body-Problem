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
import { BodyConfig } from "../types/types";
import {
  ruthUpdate,
  // neriUpdate,
  // verletUpdate,
  // eulerUpdate,
} from "../utils/computation";
import { updateBodyTrail } from "../utils/graphics";
import { FIGURE_8_BODIES } from "../data/initialCondition";

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

// Constants
const TRAIL_LENGTH = 400;
const TIME_STEP = 0.01;

type SimulationBodyProps = {
  body: BodyConfig;
  trailRef: (node: BufferGeometry<NormalBufferAttributes> | null) => void;
  trailPositionsRef: number[];
};

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
    const currentBodies = structuredClone(bodies);

    // Physics logic
    ruthUpdate(currentBodies, TIME_STEP);
    // verletUpdate(currentBodies, TIME_STEP);
    // eulerUpdate(currentBodies, TIME_STEP);
    // neriUpdate(currentBodies, TIME_STEP);

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
