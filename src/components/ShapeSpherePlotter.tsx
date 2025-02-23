import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Loader2 } from "lucide-react";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

type Point3D = {
  x: number;
  y: number;
  z: number;
};

type XYZData = {
  x1: Point3D[];
  x2: Point3D[];
  x3: Point3D[];
};

type ShapeSpherePlotterProps = {
  integrator: string;
  orbit: string;
};

const integratorMap: { [key: string]: string } = {
  "Neri (4th)": "4",
  "Ruth (3rd)": "3",
  "Verlet (2nd)": "2",
  "Euler (1st)": "1",
};

const orbitFileMap = {
  "Figure of 8": "fo8.txt",
  "Butterfly I": "butterfly1.txt",
  "Butterfly II": "butterfly2.txt",
  "Butterfly III": "butterfly3.txt",
  "Butterfly IV": "butterfly4.txt",
  Bumblebee: "bumblebee.txt",
  Dragonfly: "dragonfly.txt",
  Goggles: "goggle.txt",
  Lagrange: "lagrang.txt",
  "Moth I": "moth1.txt",
  "Moth II": "moth2.txt",
  "Moth III": "moth3.txt",
  Yarn: "yar.txt",
  "Yin-Yang I": "yin-yang1.txt",
  "Yin-Yang II": "yin-yang2.txt",
  "Yin-Yang III": "yin-yang3.txt",
} as const;

function ShapeSpherePlotter({ integrator, orbit }: ShapeSpherePlotterProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  // Helper function to convert array to Point3D
  const toPoint3D = (coords: number[]): Point3D => ({
    x: coords[0],
    y: coords[1],
    z: coords[2],
  });

  // Parse XYZ file content
  const parseXYZ = (fileContent: string): XYZData => {
    const lines = fileContent.trim().split("\n");
    const numSteps = Math.floor(lines.length / 5);

    const x1: Point3D[] = [];
    const x2: Point3D[] = [];
    const x3: Point3D[] = [];

    for (let i = 0; i < numSteps; i++) {
      const baseIndex = i * 5 + 2;

      const x1Coords = lines[baseIndex]
        .split(" ")
        .filter(Boolean)
        .slice(1, 4)
        .map(Number);
      const x2Coords = lines[baseIndex + 1]
        .split(" ")
        .filter(Boolean)
        .slice(1, 4)
        .map(Number);
      const x3Coords = lines[baseIndex + 2]
        .split(" ")
        .filter(Boolean)
        .slice(1, 4)
        .map(Number);

      x1.push(toPoint3D(x1Coords));
      x2.push(toPoint3D(x2Coords));
      x3.push(toPoint3D(x3Coords));
    }

    return { x1, x2, x3 };
  };

  // Convert to shape sphere coordinates
  const toShapeSphere = (x1: Point3D, x2: Point3D, x3: Point3D): Point3D => {
    // Convert to Jacobi Coordinates
    const z1 = {
      x: (x3.x - x2.x) / Math.sqrt(2),
      y: (x3.y - x2.y) / Math.sqrt(2),
      z: (x3.z - x2.z) / Math.sqrt(2),
    };

    const z2 = {
      x: Math.sqrt(2 / 3) * (x1.x - (x2.x + x3.x) / 2),
      y: Math.sqrt(2 / 3) * (x1.y - (x2.y + x3.y) / 2),
      z: Math.sqrt(2 / 3) * (x1.z - (x2.z + x3.z) / 2),
    };

    // Calculate norms
    const normZ1 = Math.sqrt(z1.x * z1.x + z1.y * z1.y + z1.z * z1.z);
    const normZ2 = Math.sqrt(z2.x * z2.x + z2.y * z2.y + z2.z * z2.z);

    // Apply Hopf map
    const u1 = normZ1 * normZ1 - normZ2 * normZ2;
    const u2 = 2 * (z1.x * z2.x + z1.y * z2.y + z1.z * z2.z);
    const u3 = 2 * (z1.x * z2.y - z1.y * z2.x);

    // Normalize
    const normU = Math.sqrt(u1 * u1 + u2 * u2 + u3 * u3);

    return {
      x: u1 / normU,
      y: u2 / normU,
      z: u3 / normU,
    };
  };

  const loadOrbitData = async (intergratorName: string, orbitName: string) => {
    try {
      setLoading(true);
      setError(null);
      const orbitFile = orbitFileMap[orbitName as keyof typeof orbitFileMap];
      const integratorFolder =
        integratorMap[intergratorName as keyof typeof integratorMap];
      const response = await fetch(
        `/position_files/${integratorFolder}/${orbitFile}`
      );
      if (!response.ok)
        throw new Error(`Failed to load orbit data: ${response.statusText}`);
      const data = await response.text();
      return data;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load orbit data"
      );
      return null;
    }
  };

  const initScene = () => {
    if (!mountRef.current) return;

    // Set up scene
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });

    renderer.setSize(200, 200);
    renderer.setClearColor(0x000000, 0);

    mountRef.current.appendChild(renderer.domElement);
    const controls = new OrbitControls(camera, renderer.domElement);

    camera.position.z = 2.5;
    controls.update();

    // const axesHelper = new THREE.AxesHelper(5);
    // axesHelper.position.set(-1, -1, -1);
    // scene.add(axesHelper);

    sceneRef.current = scene;
    rendererRef.current = renderer;

    return { scene, camera, renderer };
  };

  const updateVisualization = async () => {
    if (!sceneRef.current || !rendererRef.current) return;

    const data = await loadOrbitData(integrator, orbit);
    if (!data) return;

    // Clear existing objects from scene
    while (sceneRef.current.children.length > 0) {
      sceneRef.current.remove(sceneRef.current.children[0]);
    }

    // Add sphere
    const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
    const sphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.5,
      wireframe: false,
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sceneRef.current.add(sphere);

    // Parse data and add points
    const xyzData = parseXYZ(data);
    const points: Point3D[] = [];
    const interval = 1;

    for (let i = 0; i < xyzData.x1.length; i += interval) {
      const point = toShapeSphere(xyzData.x1[i], xyzData.x2[i], xyzData.x3[i]);
      points.push(point);
    }

    // Create points geometry
    const pointsGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(points.length * 3);

    points.forEach((point, i) => {
      positions[i * 3] = point.x;
      positions[i * 3 + 1] = point.y;
      positions[i * 3 + 2] = point.z;
    });

    pointsGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );

    const pointsMaterial = new THREE.PointsMaterial({
      color: 0xff0000,
      size: 0.05,
    });
    const pointsObject = new THREE.Points(pointsGeometry, pointsMaterial);
    sceneRef.current.add(pointsObject);

    setLoading(false);
  };

  useEffect(() => {
    const { scene, camera, renderer } = initScene() || {};
    if (!scene || !camera || !renderer) return;

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };

    animate();

    updateVisualization();

    return () => {
      renderer.dispose();
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, [orbit]);

  return (
    <div className="absolute bottom-36 right-4 w-48 h-48 overflow-hidden rounded-lg">
      <div className="relative w-full h-full">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center">
            {error}
          </div>
        )}
        <div ref={mountRef} className="w-full h-full" />
        <div className="absolute top-3 left-1/2 transform -translate-x-1/2 text-sm text-zinc-300">
          Shape Sphere
        </div>
      </div>
    </div>
  );
}

export default ShapeSpherePlotter;
