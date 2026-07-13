import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, Box } from '@react-three/drei';
import * as THREE from 'three';

export default function ThreeDModel() {
  const sphereRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (sphereRef.current) {
      sphereRef.current.rotation.x = state.clock.elapsedTime * 0.2;
      sphereRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} color="#3b82f6" />
      <directionalLight position={[-10, -10, -5]} intensity={1} color="#8b5cf6" />
      
      <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
        <Sphere ref={sphereRef} args={[1, 64, 64]} scale={1.5}>
          <MeshDistortMaterial
            color="#111111"
            attach="material"
            distort={0.4}
            speed={2}
            roughness={0.2}
            metalness={0.8}
            emissive="#3b82f6"
            emissiveIntensity={0.2}
          />
        </Sphere>
        
        {/* Floating geometric accents */}
        <Box args={[0.2, 0.2, 0.2]} position={[2, 1, 0]}>
          <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={2} />
        </Box>
        <Box args={[0.3, 0.3, 0.3]} position={[-2, -1, 1]}>
          <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={2} />
        </Box>
      </Float>
    </>
  );
}
