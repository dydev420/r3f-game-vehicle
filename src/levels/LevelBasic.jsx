import { Float, Text, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { useMemo, useRef, useState } from "react";
import { BoxGeometry, Euler, MeshStandardMaterial, Quaternion, Vector3 } from "three";

const GRID_SIZE = 64;

const ORIGIN_DEPTH = 0.1;

const boxGeometry = new BoxGeometry(1, 1, 1);
const floor1Material = new MeshStandardMaterial({ color: 'limegreen', wireframe: false });
const wallMaterial = new MeshStandardMaterial({ color: 'slategrey'});

export function BlockStart({ position = [0, 0, 0] }) {
  return(
    <group position={position}>
      {/* Floor */}
      <mesh
        receiveShadow
        position={[0, 0, 0]}
        scale={[64, 0.2, 64]}
        geometry={boxGeometry}
        material={floor1Material}
      />
    </group>  
  );
}

function Bounds({
  length = 1,
  position = [0, 0, 0]
}) {
  const bounds = useRef();

  return (
    <group position={position}>
      {/* Obstacle: Spinner */}
      <RigidBody
        ref={bounds}
        type="fixed"
        // position={[0, 0.3, 0]}
        restitution={0.2}
        friction={0}
      >

        {/* End Wall */}
        {/* <mesh
          receiveShadow
          position={[0, 0.75, - 10  ]}
          scale={[4, 1.5, 0.3]}
          geometry={boxGeometry}
          material={wallMaterial}
        /> */}

        {/* Obstacle Floor */}
        <mesh
          receiveShadow
          position={[1, 0.1, - 8  ]}
          scale={[2, 0.05, 0.3]}
          geometry={boxGeometry}
          material={wallMaterial}
        />

        {/* Floor Collider */}
        <CuboidCollider
          args={ [64/2, 0.1, 64/2] }
          position={[0, -ORIGIN_DEPTH, 0]}
          restitution={0.2}
          friction={0}
        />
      </RigidBody>
    </group>  
  );
}

/**
 * Main Level Component
 */
export default function LevelBasic({
  count = 5,
}) {
  return (
    <>
      <BlockStart position={ [0, -ORIGIN_DEPTH, 0] } />
      <Bounds length={count + 2} />
    </>
  )
}
