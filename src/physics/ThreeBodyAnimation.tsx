import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useEffect } from "react";
import { OrbitControls } from "@react-three/drei";
import { Mesh, BufferGeometry, Vector3, BufferAttribute } from "three";

function EarthAndMoon() {
  const earthRef = useRef<Mesh>(null!);
  const moonRef = useRef<Mesh>(null!);
  const trailRef = useRef<BufferGeometry>(null!);
  const trailPositions = useRef<Vector3[]>([]);
  const trailLength = 150; // Longer tail

  // Initialize trail with moon's starting position
  useEffect(() => {
    const initialPos = moonRef.current.position.clone();
    trailPositions.current = Array(trailLength)
      .fill(null)
      .map(() => initialPos.clone());

    // Initialize color and size attributes
    if (trailRef.current) {
      const colors = new Float32Array(trailLength * 3);
      const sizes = new Float32Array(trailLength);

      for (let i = 0; i < trailLength; i++) {
        const ratio = i / trailLength;
        colors[i * 3] = 1 - ratio * 0.5;
        colors[i * 3 + 1] = 1 - ratio;
        colors[i * 3 + 2] = 1 - ratio * 0.2;

        // Size gradient from 0.3 to 0.05
        sizes[i] = 0.5 * (ratio ** i);
      }

      trailRef.current.setAttribute("color", new BufferAttribute(colors, 3));
      trailRef.current.setAttribute("size", new BufferAttribute(sizes, 1));
      console.log(sizes);
    }
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const radius = 4;
    const speed = 1;

    // Update moon position
    moonRef.current.position.x = radius * Math.cos(speed * t);
    moonRef.current.position.y = radius * Math.sin(speed * t);

    // Add current position to trail
    trailPositions.current.push(moonRef.current.position.clone());
    if (trailPositions.current.length > trailLength) {
      trailPositions.current.shift();
    }

    // Update trail geometry
    if (trailRef.current) {
      // Update positions
      const positions = trailPositions.current.flatMap((p) => [p.x, p.y, p.z]);
      trailRef.current.setAttribute(
        "position",
        new BufferAttribute(new Float32Array(positions), 3)
      );

      // Update colors and sizes for fading effect
      const colors = new Float32Array(trailLength * 3);
      const sizes = new Float32Array(trailLength);

      for (let i = 0; i < trailPositions.current.length; i++) {
        const ratio = i / trailLength;
        // Color gradient from white to purple
        colors[i * 3] = 1 - ratio * 0.5; // Red
        colors[i * 3 + 1] = 1 - ratio; // Green
        colors[i * 3 + 2] = 1 - ratio * 0.2; // Blue

        // Size gradient from 0.3 to 0.05
        sizes[i] = 0.3 * (1 - ratio);
      }

      trailRef.current.attributes.color.needsUpdate = true;
      trailRef.current.attributes.size.needsUpdate = true;
    }
  });

  return (
    <>
      {/* Earth */}
      <mesh ref={earthRef} position={[0, 0, 0]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="blue" />
      </mesh>

      {/* Moon */}
      <mesh ref={moonRef} position={[4, 0, 0]}>
        <sphereGeometry args={[0.16, 32, 32]} />
        <meshStandardMaterial color="gray" />
      </mesh>

      {/* Comet tail */}
      <points>
        <bufferGeometry ref={trailRef} />
        <pointsMaterial
          vertexColors={true}
          size={0.3}
          transparent
          opacity={0.7}
          sizeAttenuation={true}
          blending={2} // Additive blending
        />
      </points>
    </>
  );
}

function ThreeBodyAnimation() {
  return (
    <Canvas>
      <EarthAndMoon />
      <directionalLight position={[-10, 0, -10]} intensity={10} />
      <OrbitControls />
    </Canvas>
  );
}

export default ThreeBodyAnimation;
