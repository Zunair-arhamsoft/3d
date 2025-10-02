// RoomViewer.js
import React, { Suspense, useRef, useState, useEffect } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import { MTLLoader, OBJLoader } from "three-stdlib";
import * as THREE from "three";
import { SketchPicker } from "react-color"; // 🎨 color picker

function RoomModel({ onSelect }) {
  const materials = useLoader(MTLLoader, "/model/Room.mtl");
  const obj = useLoader(OBJLoader, "/model/Room.obj", (loader) => {
    materials.preload();
    loader.setMaterials(materials);
  });

  const ref = useRef();

  useEffect(() => {
    if (ref.current) {
      ref.current.traverse((child) => {
        if (child.isMesh) {
          child.userData = { selectable: true };
          child.material = child.material.clone(); // unique material
        }
      });
    }
  }, [obj]);

  const handleClick = (event) => {
    event.stopPropagation();
    const mesh = event.object;
    if (mesh.userData.selectable) {
      onSelect(mesh); // Pass clicked mesh back to parent
    }
  };

  return (
    <primitive
      ref={ref}
      object={obj}
      scale={0.5}
      position={[0, 0, 0]}
      onClick={handleClick}
    />
  );
}

export default function RoomViewer() {
  const [selectedMesh, setSelectedMesh] = useState(null);
  const [color, setColor] = useState("#ffffff");

  const handleColorChange = (newColor) => {
    setColor(newColor.hex);
    if (selectedMesh) {
      selectedMesh.material.color.set(newColor.hex);
    }
  };

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <Canvas shadows camera={{ position: [5, 3, 5], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
        <Suspense fallback={<Html>Loading 3D Model...</Html>}>
          <RoomModel onSelect={setSelectedMesh} />
        </Suspense>
        <OrbitControls target={[0, 1, 0]} />
      </Canvas>

      {/* 🎨 Color Picker appears when a mesh is selected */}
      {selectedMesh && (
        <div style={{ position: "absolute", top: 20, right: 20, zIndex: 10 }}>
          <SketchPicker color={color} onChange={handleColorChange} />
        </div>
      )}
    </div>
  );
}
