import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useEffect } from "react";
import { OrbitControls } from "@react-three/drei";
import { Mesh, BufferGeometry, BufferAttribute, AdditiveBlending } from "three";

function EarthAndMoon() {
  const earthRef = useRef<Mesh>(null!);
  const moonRef = useRef<Mesh>(null!);
  const trailRef = useRef<BufferGeometry>(null!);
  const trailPositions = useRef<number[]>([]);
  const sizesRef = useRef<Float32Array>(null!);
  const trailLength = 200;
  const initialTrailSize = 0.65;

  const vertexShader = `
  attribute float size;
  attribute vec3 color;
  varying vec3 vColor;
  
  void main() {
    vColor = color;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * (300.0 / -mvPosition.z); // Adjust size attenuation
    gl_Position = projectionMatrix * mvPosition;
  }
`;

  const fragmentShader = `
  varying vec3 vColor;
  
  void main() {
    gl_FragColor = vec4(vColor, 1.0);
  }
`;

  useEffect(() => {
    // Initialize trail with moon's starting position
    const initialX = 4;
    const initialY = 0;
    const initialZ = 0;

    // Fill initial positions array with starting position
    trailPositions.current = Array(trailLength * 3)
      .fill(0)
      .map((_, i) => {
        const index = i % 3;
        if (index === 0) return initialX;
        if (index === 1) return initialY;
        return initialZ;
      });

    // Create initial attributes
    const positions = new Float32Array(trailPositions.current);
    const colors = new Float32Array(trailLength * 3);

    // Initialize sizes array
    const sizes = new Float32Array(trailLength);
    for (let i = 0; i < trailLength; i++) {
      const ratio = i / trailLength;

      // Colors: purple near moon (start) fading to white (end)
      colors[i * 3] = ratio * 0.5 + 0.5; // R: 0.5 -> 1.0
      colors[i * 3 + 1] = ratio * 0.8 + 0.2; // G: 0.2 -> 1.0
      colors[i * 3 + 2] = 1; // B: constant 1.0

      // Sizes decrease from start to end (reversed ratio)
      sizes[i] = initialTrailSize * (1 - ratio);
    }
    sizesRef.current = sizes;

    if (trailRef.current) {
      trailRef.current.setAttribute(
        "position",
        new BufferAttribute(positions, 3)
      );
      trailRef.current.setAttribute("color", new BufferAttribute(colors, 3));
      trailRef.current.setAttribute(
        "size",
        new BufferAttribute(sizesRef.current, 1)
      );
    }
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const radius = 4;
    const speed = 1;

    // Update moon position
    const moonX = radius * Math.cos(speed * t);
    const moonY = radius * Math.sin(speed * t);
    const moonZ = 0;

    moonRef.current.position.set(moonX, moonY, moonZ);

    // Shift all positions back by 3 (one vertex)
    for (let i = trailPositions.current.length - 1; i >= 3; i--) {
      trailPositions.current[i] = trailPositions.current[i - 3];
    }

    // Add new position at the start
    trailPositions.current[0] = moonX;
    trailPositions.current[1] = moonY;
    trailPositions.current[2] = moonZ;

    // Update the trail geometry
    if (trailRef.current) {
      trailRef.current.setAttribute(
        "position",
        new BufferAttribute(new Float32Array(trailPositions.current), 3)
      );
      // The size attribute doesn't need updating as it's static
      trailRef.current.attributes.position.needsUpdate = true;
    }
  });

  return (
    <>
      {/* Earth */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="blue" />
      </mesh>

      {/* Moon */}
      <mesh ref={moonRef} position={[4, 0, 0]}>
        <sphereGeometry args={[0.16, 32, 32]} />
        <meshStandardMaterial color="gray" />
      </mesh>

      {/* Trail */}
      <points>
        <bufferGeometry ref={trailRef} />
        <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </points>

      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[-10, 0, -10]} intensity={1.5} />
    </>
  );
}

function ThreeBodyAnimation() {
  return (
    <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
      <EarthAndMoon />
      <directionalLight position={[-10, 0, -10]} intensity={10} />
      <ambientLight color="white" intensity={10} />
      <OrbitControls />
    </Canvas>
  );
}

export default ThreeBodyAnimation;
