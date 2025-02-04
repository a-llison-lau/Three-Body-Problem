import React, { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Mesh, BufferGeometry, BufferAttribute, AdditiveBlending } from "three";
import { OrbitControls } from "@react-three/drei";

const G = 1; // Gravitational constant

interface BodyConfig {
  position: [number, number, number];
  velocity: [number, number, number];
  mass: number;
  color: string;
  size: number;
}

// Precise initial conditions for figure-8 orbit
const FIGURE_8_BODIES: BodyConfig[] = [
  {
    position: [0.97000436, -0.24308753, 0],
    velocity: [0.93240737 / 2, 0.86473146 / 2, 0],
    mass: 1,
    color: "red",
    size: 0.1,
  },
  {
    position: [-0.97000436, 0.24308753, 0],
    velocity: [0.93240737 / 2, 0.86473146 / 2, 0],
    mass: 1,
    color: "green",
    size: 0.1,
  },
  {
    position: [0, 0, 0],
    velocity: [-0.93240737, -0.86473146, 0],
    mass: 1,
    color: "blue",
    size: 0.1,
  },
];

function computeForces(bodies: BodyConfig[]): [number, number, number][] {
  const forces: [number, number, number][] = bodies.map(() => [0, 0, 0]);

  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const body1 = bodies[i];
      const body2 = bodies[j];

      // Compute vector between bodies
      const dx = body2.position[0] - body1.position[0];
      const dy = body2.position[1] - body1.position[1];
      const dz = body2.position[2] - body1.position[2];

      // Compute distance
      const r = Math.sqrt(dx * dx + dy * dy + dz * dz);

      // Compute force magnitude
      const forceMagnitude = (G * body1.mass * body2.mass) / (r * r);

      // Compute force components
      const fx = (forceMagnitude * dx) / r;
      const fy = (forceMagnitude * dy) / r;
      const fz = (forceMagnitude * dz) / r;

      // Update forces
      forces[i][0] += fx;
      forces[i][1] += fy;
      forces[i][2] += fz;
      forces[j][0] -= fx;
      forces[j][1] -= fy;
      forces[j][2] -= fz;
    }
  }

  return forces;
}

function FigureEightOrbit() {
  const [bodies, setBodies] = useState<BodyConfig[]>(FIGURE_8_BODIES);
  const bodiesRef = useRef<(Mesh | null)[]>([null, null, null]);
  const trailRefs = useRef<(BufferGeometry | null)[]>([null, null, null]);
  const trailPositionsRef = useRef<number[][]>([[], [], []]);
  const trailLength = 400;

  // Vertex shader for trail rendering
  const vertexShader = `
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

  // Fragment shader for gradient and transparency
  const fragmentShader = `
    varying vec3 vColor;
    
    void main() {
      gl_FragColor = vec4(vColor, 1.0 - length(gl_PointCoord - vec2(0.5)) * 2.0);
    }
  `;

  useFrame(() => {
    const dt = 0.01;
    const currentBodies = JSON.parse(JSON.stringify(bodies)); // Deep copy

    // Compute forces
    const forces = computeForces(currentBodies);

    // Verlet integration
    currentBodies.forEach((body: BodyConfig, i: number) => {
      // Update position
      body.position[0] += body.velocity[0] * dt;
      body.position[1] += body.velocity[1] * dt;
      body.position[2] += body.velocity[2] * dt;

      // Update velocity
      body.velocity[0] += (forces[i][0] / body.mass) * dt;
      body.velocity[1] += (forces[i][1] / body.mass) * dt;
      body.velocity[2] += (forces[i][2] / body.mass) * dt;
    });

    // Update body positions in scene
    bodiesRef.current.forEach((bodyRef, i) => {
      if (bodyRef) {
        bodyRef.position.set(
          currentBodies[i].position[0],
          currentBodies[i].position[1],
          currentBodies[i].position[2]
        );
      }
    });

    // Update trails
    currentBodies.forEach((body: BodyConfig, i: number) => {
      const trailPositions = trailPositionsRef.current[i];

      // Add current position to trail
      trailPositions.unshift(...body.position);

      // Trim trail to specified length
      if (trailPositions.length > trailLength * 3) {
        trailPositions.splice(trailLength * 3);
      }

      // Update trail geometry
      if (trailRefs.current[i]) {
        const positions = new Float32Array(trailPositions);
        const colors = new Float32Array(trailLength * 3);
        const sizes = new Float32Array(trailLength);

        // Create color gradient and size reduction
        for (let j = 0; j < trailLength; j++) {
          const ratio = j / trailLength;

          // Color gradient based on body's original color
          const baseColor =
            body.color === "red"
              ? [1, 0, 0]
              : body.color === "green"
              ? [0, 1, 0]
              : [0, 0, 1];

          // Interpolate from full color to white
          colors[j * 3] = baseColor[0] * (1 - ratio) + ratio;
          colors[j * 3 + 1] = baseColor[1] * (1 - ratio) + ratio;
          colors[j * 3 + 2] = baseColor[2] * (1 - ratio) + ratio;

          // Reduce point size towards the end of the trail
          sizes[j] = 0.1 * (1 - ratio);
        }

        trailRefs.current[i]?.setAttribute(
          "position",
          new BufferAttribute(positions, 3)
        );
        trailRefs.current[i]?.setAttribute(
          "color",
          new BufferAttribute(colors, 3)
        );
        trailRefs.current[i]?.setAttribute(
          "size",
          new BufferAttribute(sizes, 1)
        );

        trailRefs.current[i]!.attributes.position.needsUpdate = true;
        trailRefs.current[i]!.attributes.color.needsUpdate = true;
        trailRefs.current[i]!.attributes.size.needsUpdate = true;
      }
    });

    setBodies(currentBodies);
  });

  return (
    <>
      {bodies.map((body, i) => (
        <React.Fragment key={`body-${i}`}>
          {/* Body */}
          <mesh
            ref={(el) => (bodiesRef.current[i] = el as Mesh)}
            position={body.position}
          >
            <sphereGeometry args={[body.size, 32, 32]} />
            <meshStandardMaterial color={body.color} />
          </mesh>

          {/* Trail */}
          <points>
            <bufferGeometry
              ref={(el) => (trailRefs.current[i] = el as BufferGeometry)}
            />
            <shaderMaterial
              vertexShader={vertexShader}
              fragmentShader={fragmentShader}
              transparent={true}
              depthWrite={false}
              blending={AdditiveBlending}
            />
          </points>
        </React.Fragment>
      ))}

      {/* Lighting */}
      <ambientLight intensity={8} />
      <directionalLight position={[5, 5, 5]} intensity={15} />
    </>
  );
}

function ThreeBodyAnimation() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
      <FigureEightOrbit />
      <OrbitControls />
    </Canvas>
  );
}

export default ThreeBodyAnimation;
