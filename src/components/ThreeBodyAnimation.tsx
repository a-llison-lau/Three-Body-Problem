import { useEffect, useRef, useState } from "react";
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
  getCoMVelocity,
  ruthUpdate,
  neriUpdate,
  verletUpdate,
  eulerUpdate,
} from "../utils/computation";
import { updateBodyTrail } from "../utils/graphics";
import {
  FIGURE_8_BODIES,
  BUMBLEBEE_BODIES,
  BUTTERFLYI_BODIES,
  BUTTERFLYII_BODIES,
  BUTTERFLYIII_BODIES,
  BUTTERFLYIV_BODIES,
  DRAGONFLY_BODIES,
  MOTHI_BODIES,
  MOTHII_BODIES,
  MOTHIII_BODIES,
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
const TRAIL_LENGTH = 1200;
const TIME_STEP = 0.01;
const UPDATES_PER_FRAME = 1;

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
  integrator: string;
  orbit: string;
};

function Orbit({ onStatsUpdate, integrator, orbit }: OrbitProps) {
  const getInitialBodies = (orbitType: string) => {
    switch (orbitType) {
      case "Butterfly I":
        return BUTTERFLYI_BODIES;
      case "Butterfly II":
        return BUTTERFLYII_BODIES;
      case "Butterfly III":
        return BUTTERFLYIII_BODIES;
      case "Butterfly IV":
        return BUTTERFLYIV_BODIES;
      case "Bumblebee":
        return BUMBLEBEE_BODIES;
      case "Moth I":
        return MOTHI_BODIES;
      case "Moth II":
        return MOTHII_BODIES;
      case "Moth III":
        return MOTHIII_BODIES;
      case "Figure of 8":
        return FIGURE_8_BODIES;
      case "Dragonfly":
        return DRAGONFLY_BODIES;
      default:
        return FIGURE_8_BODIES;
    }
  };

  const [bodies, setBodies] = useState<BodyConfig[]>(() =>
    getInitialBodies(orbit)
  );

  // Centre-of-mass corrections to avoid undesirable drift during long simulations
  const CoMVelocity = getCoMVelocity(bodies);
  bodies.forEach((body) => {
    body.velocity.x -= CoMVelocity.x;
    body.velocity.y -= CoMVelocity.y;
    body.velocity.z -= CoMVelocity.z;
  });

  // Add useEffect to handle orbit changes
  useEffect(() => {
    setBodies(getInitialBodies(orbit));
    // Reset trail positions
    trailPositionsRef.current = [[], [], []];
    // Reset momentum and energy references
    prevMomentum.current = { x: 0, y: 0, z: 0 };
    prevEnergy.current = 0;
  }, [orbit]);

  const bodiesRef = useRef<(Mesh | null)[]>([null, null, null]);
  const trailRefs = useRef<(BufferGeometry | null)[]>([null, null, null]);
  const trailPositionsRef = useRef<number[][]>([[], [], []]);

  const prevMomentum = useRef<Vector3>({ x: 0, y: 0, z: 0 });
  const prevEnergy = useRef<number>(0);

  useFrame(() => {
    for (let i = 0; i < UPDATES_PER_FRAME; i++) {
      const currentBodies = structuredClone(bodies);

      // Physics logic
      switch (integrator) {
        case "Neri (4th)":
          neriUpdate(currentBodies, TIME_STEP);
          console.log("neri is chosen");
          break;
        case "Ruth (3rd)":
          ruthUpdate(currentBodies, TIME_STEP);
          console.log("ruth is chosen");
          break;
        case "Verlet (2nd)":
          verletUpdate(currentBodies, TIME_STEP);
          console.log("verlet is chosen");
          break;
        case "Euler (1st)":
          eulerUpdate(currentBodies, TIME_STEP);
          console.log("euler is chosen");
          break;
        default:
          neriUpdate(currentBodies, TIME_STEP);
      }

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
    }
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

export default function ThreeBodySimulation({
  onStatsUpdate,
  integrator,
  orbit,
}: {
  onStatsUpdate?: OrbitProps["onStatsUpdate"];
  integrator: string;
  orbit: string;
}) {
  return (
    <Canvas camera={{ position: [0, 0, 2] }}>
      <Orbit
        onStatsUpdate={onStatsUpdate}
        integrator={integrator}
        orbit={orbit}
      />
      <OrbitControls />
    </Canvas>
  );
}
