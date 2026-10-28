import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import type { Group, PointLight } from "three";

function Visibility() {
  const set = useThree((s) => s.set);
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    const update = () => {
      set({ frameloop: document.hidden ? "never" : "demand" });
      if (!document.hidden) invalidate();
    };
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, [set, invalidate]);
  return null;
}

/** A finite lighting cue, not a perpetual animation loop. */
function Scenery({ reveal }: { reveal: boolean }) {
  const light = useRef<PointLight>(null);
  const group = useRef<Group>(null);
  const elapsed = useRef(0);
  const invalidate = useThree((s) => s.invalidate);
  useFrame((_, delta) => {
    if (document.hidden) return;
    elapsed.current = Math.min(1.2, elapsed.current + Math.min(delta, 0.05));
    const progress = elapsed.current / 1.2;
    const eased = 1 - (1 - progress) ** 3;
    if (light.current) light.current.intensity = (reveal ? 65 : 30) * eased;
    if (group.current) {
      group.current.rotation.z = (1 - eased) * -0.06;
      group.current.position.y = (1 - eased) * -0.2;
    }
    if (progress < 1) invalidate();
  });
  return (
    <>
      <ambientLight intensity={0.45} />
      <pointLight
        ref={light}
        position={[2, 4, 4]}
        intensity={0}
        color="#d5bb83"
      />
      <group ref={group}>
        {Array.from({ length: 6 }, (_, i) => (
          <mesh
            key={i}
            position={[(i - 2.5) * 0.4, -0.1, -i * 0.06]}
            rotation={[0.12, -0.15, (i - 2.5) * -0.18]}
          >
            <boxGeometry args={[1.7, 2.6, 0.035]} />
            <meshStandardMaterial
              color={reveal ? "#5d6849" : "#9eaa80"}
              roughness={0.75}
              metalness={0.12}
            />
          </mesh>
        ))}
      </group>
    </>
  );
}
export default function Stage3D({ reveal }: { reveal: boolean }) {
  const [supported] = useState(() => {
    try {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("webgl2");
      const available = !!context;
      // The probe is disposable; release its graphics resources immediately.
      context?.getExtension("WEBGL_lose_context")?.loseContext();
      return available;
    } catch {
      return false;
    }
  });
  const [lost, setLost] = useState(false);
  if (!supported || lost) return null;
  return (
    <div className="webgl" aria-hidden="true">
      <Canvas
        frameloop="demand"
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 8], fov: 40 }}
        onCreated={({ gl }) => {
          gl.domElement.dataset.ready = "true";
          gl.domElement.addEventListener(
            "webglcontextlost",
            () => setLost(true),
            { once: true },
          );
        }}
      >
        <Visibility />
        <Scenery reveal={reveal} />
      </Canvas>
    </div>
  );
}
