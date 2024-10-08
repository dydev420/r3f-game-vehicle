/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
*/

import React, { useEffect, useRef } from "react";
import { useGLTF, useTexture } from "@react-three/drei";

export function Track(props) {
  const { nodes, materials } = useGLTF("/track.glb");
  const colorMap = useTexture("/track.png");

  useEffect(() => {
    colorMap.anisotropy = 16;
  }, [colorMap]);

  return (
    <group {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes["Street003_-_applied_transform"].geometry}
        // material={nodes["Street003_-_applied_transform"].material}
      >
        <meshStandardMaterial map={colorMap}  />
      </mesh>
    </group>
  );
}

useGLTF.preload("/track.glb");
useTexture.preload("/track.png");

export default Track;
