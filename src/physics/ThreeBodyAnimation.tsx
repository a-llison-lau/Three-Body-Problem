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
  // ruthUpdate,
  neriUpdate,
  // verletUpdate,
  // eulerUpdate,
} from "../utils/computation";
import { updateBodyTrail } from "../utils/graphics";
import {
  FIGURE_8_BODIES,
  // BUMBLEBEE_BODIES,
  // BUTTERFLYI_BODIES,
  // BUTTERFLYII_BODIES,
  // DRAGONFLY_BODIES,
} from "../data/initialConditions";
import { Vector3 } from "../types/types";

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
const TRAIL_LENGTH = 1000;
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

type OrbitProps = {
  onStatsUpdate?: (stats: {
    momentumChange: Vector3;
    energyChange: number;
    velocities: Vector3[];
  }) => void;
};

function Orbit({ onStatsUpdate }: OrbitProps) {
  const [bodies, setBodies] = useState<BodyConfig[]>(FIGURE_8_BODIES);
  const bodiesRef = useRef<(Mesh | null)[]>([null, null, null]);
  const trailRefs = useRef<(BufferGeometry | null)[]>([null, null, null]);
  const trailPositionsRef = useRef<number[][]>([[], [], []]);

  const prevMomentum = useRef<Vector3>({ x: 0, y: 0, z: 0 });
  const prevEnergy = useRef<number>(0);

  useFrame(() => {
    const currentBodies = structuredClone(bodies);

    // Physics logic
    // ruthUpdate(currentBodies, TIME_STEP);
    // verletUpdate(currentBodies, TIME_STEP);
    // eulerUpdate(currentBodies, TIME_STEP);
    neriUpdate(currentBodies, TIME_STEP);

    // Calculate momentum and energy
    let totalMomentum = { x: 0, y: 0, z: 0 };
    let kinetic = 0;

    currentBodies.forEach((body) => {
      totalMomentum.x += body.mass * body.velocity.x;
      totalMomentum.y += body.mass * body.velocity.y;
      totalMomentum.z += body.mass * body.velocity.z;

      kinetic +=
        0.5 *
        body.mass *
        (body.velocity.x ** 2 + body.velocity.y ** 2 + body.velocity.z ** 2);
    });

    // Potential energy
    let potential = 0;
    for (let i = 0; i < currentBodies.length; i++) {
      for (let j = i + 1; j < currentBodies.length; j++) {
        const dx = currentBodies[j].position.x - currentBodies[i].position.x;
        const dy = currentBodies[j].position.y - currentBodies[i].position.y;
        const dz = currentBodies[j].position.z - currentBodies[i].position.z;
        const r = Math.sqrt(dx * dx + dy * dy + dz * dz);
        potential -= (1 * currentBodies[i].mass * currentBodies[j].mass) / r;
      }
    }

    const totalEnergy = kinetic + potential;
    const energyChange = totalEnergy - prevEnergy.current;
    const momentumChange = {
      x: totalMomentum.x - prevMomentum.current.x,
      y: totalMomentum.y - prevMomentum.current.y,
      z: totalMomentum.z - prevMomentum.current.z,
    };

    prevMomentum.current = totalMomentum;
    prevEnergy.current = totalEnergy;
    if (onStatsUpdate) {
      onStatsUpdate({
        momentumChange,
        energyChange,
        velocities: currentBodies.map((b) => ({ ...b.velocity })),
      });
    }

    setBodies(currentBodies);

    // Update body positions and trails
    currentBodies.forEach((body, i) => {
      bodiesRef.current[i]?.position.set(
        body.position.x,
        body.position.y,
        body.position.z
      );

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

export default function ThreeBodySimulation({ onStatsUpdate }: { onStatsUpdate?: OrbitProps["onStatsUpdate"] }) {
  return (
    <Canvas camera={{ position: [0, 0, 2] }}>
      <Orbit onStatsUpdate={onStatsUpdate}/>
      <OrbitControls />
    </Canvas>
  );
}
