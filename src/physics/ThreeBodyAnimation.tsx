import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { OrbitControls } from "@react-three/drei";
import { Mesh } from "three";

function EarthAndMoon() {
  const earthRef = useRef<Mesh>(null!);
  const moonRef = useRef<Mesh>(null!);

  // Animation frame to rotate the moon around the Earth
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const radius = 4;
    const speed = 1;

    if (moonRef.current) {
      moonRef.current.position.x = radius * Math.cos(speed * t); // x position
      moonRef.current.position.y = radius * Math.sin(speed * t); // z position
    }
  });

  return (
    <>
      {/* Earth (larger sphere) */}
      <mesh ref={earthRef} position={[0, 0, 0]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="blue" />
      </mesh>

      {/* Moon (smaller sphere) */}
      <mesh ref={moonRef} position={[4, 0, 0]}>
        <sphereGeometry args={[0.16, 32, 32]} />
        <meshStandardMaterial color="gray" />
      </mesh>
    </>
  );
}

function ThreeBodyAnimation() {
  return (
    <Canvas>
      {/* Add Earth and Moon */}
      <EarthAndMoon />

      {/* Lights */}
      {/* <ambientLight intensity={0.5} /> */}
      <directionalLight position={[-10, 0, -10]} intensity={10} />

      {/* OrbitControls for dragging */}
      <OrbitControls />
    </Canvas>
  );
}

export default ThreeBodyAnimation;
