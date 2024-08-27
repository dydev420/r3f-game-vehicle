import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Text, useGLTF, useTexture } from "@react-three/drei";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { BoxGeometry, Euler, MeshStandardMaterial, Quaternion, RepeatWrapping, Vector2, Vector3 } from "three";
import { BLOCK_SIZE, GRID_SIZE } from "src/utils/constants";

const boxGeometry = new BoxGeometry(1, 1, 1);
const floor1Material = new MeshStandardMaterial({ color: 'limegreen'});
const floor2Material = new MeshStandardMaterial({ color: 'greenyellow'});
const obstacleMaterial = new MeshStandardMaterial({ color: 'orangered'});
const wallMaterial = new MeshStandardMaterial({ color: 'slategrey'});

export function BlockStart({ position = [0, 0, 0] }) {
  return(
    <group position={position}>
      

      {/* Floor */}
      <mesh
        receiveShadow
        position={[0, -0.1, 0]}
        scale={[4, 0.2, 4]}
        geometry={boxGeometry}
        material={floor1Material}
      />
    </group>  
  );
}

export function BlockEnd({ position = [0, 0, 0] }) {
  const burger = useGLTF('./hamburger.glb');
  burger.scene.children.forEach((mesh) => {
    mesh.castShadow = true;
  })

  return(
    <group position={position}>
      {/* Finish Text */}
      <Text
        font="./bebas-neue-v9-latin-regular.woff"
        scale={1}
        position={[0, 2.2, 2]}
      >
        FINISH
        <meshBasicMaterial toneMapped={false} />
      </Text>

      {/* Floor */}
      <mesh
        receiveShadow
        position={[0, -0.1, 0]}
        scale={[4, 0.2, 4]}
        geometry={boxGeometry}
        material={floor1Material}
      />

      <RigidBody
        type="fixed"
        colliders="hull"
        position={[0, 0.25, 0]}
        restitution={0.2}
        friction={0}
      >
        <primitive object={burger.scene} scale={0.2} />
      </RigidBody>

    </group>  
  );
}


export default function GridBounds({
  gridSize = GRID_SIZE,
  blockSize = BLOCK_SIZE,
  position = [0, 0, 0]
}) {

  const floorGridTexture = useTexture('./gridTileCheck.png');
  console.log(floorGridTexture);
  floorGridTexture.wrapS = RepeatWrapping;
  floorGridTexture.wrapT = RepeatWrapping;
  floorGridTexture.repeat = new Vector2(blockSize * gridSize, blockSize * gridSize);
  floorGridTexture.anisotropy = 4;
  const bounds = useRef();

  const planePosition = ((gridSize - 1) * blockSize) / 2;
  const boundHalfLength = (gridSize * blockSize) / 2;
  const boundPosition = (gridSize * blockSize) / 2 - blockSize / 2;
  const endTextPosition = (gridSize * blockSize) - blockSize;

  const setupGridTextures = () => {

  }

  useEffect(() => {
    setupGridTextures();
  }, []);

  return (
    <group position={position}>

      {/* Title */}
      <Float floatIntensity={0} rotationIntensity={0}>
       <Text
          font="./bebas-neue-v9-latin-regular.woff"
          scale={blockSize / 2}
          maxWidth={0.25}
          lineHeight={0.75}
          textAlign="right"
          position={[endTextPosition, 0.2, endTextPosition]}
          rotation-y={-0.25}
        >
          Wall
          <meshBasicMaterial toneMapped={false} color="red" />
        </Text>
      </Float>
      
      <mesh
        // position={[planePosition, -0.1, planePosition]}
        position={[planePosition, 0, planePosition]}
        rotation={[-Math.PI/2, 0, 0]}
        scale={gridSize * blockSize}
      >
        <planeGeometry />
        <meshStandardMaterial color="ForestGreen" />
      </mesh>

      <mesh
        position={[planePosition, -0.2, -planePosition]}
        rotation={[-Math.PI/2, 0, 0]}
        scale={gridSize * blockSize}
      >
        <planeGeometry />
        <meshStandardMaterial map={floorGridTexture} />
      </mesh>

      {/* RigidBody: */}
      <RigidBody
        ref={bounds}
        type="fixed"
        // position={[0, 0.3, 0]}
        restitution={0.2}
        friction={0}
      >
        {/* Floor Collider */}
        <CuboidCollider
          args={[boundHalfLength , 0.1, boundHalfLength] }
          position={[boundPosition , -0.1, boundPosition]}
          restitution={0.2}
          friction={1}
        />

        <CuboidCollider
          args={[boundHalfLength , 0.1, boundHalfLength] }
          position={[boundPosition , -0.3, -boundPosition]}
          restitution={0.2}
          friction={1}
        />

        <mesh
          position={[3, 0, 2]}
          scale={[2, 0.2, 1]}
        >
          <boxGeometry />
          <meshStandardMaterial color="ForestGreen" />
        </mesh>

        <mesh
          position={[8, 0, -8]}
          scale={[4, 8, 0.2]}
          rotation={[Math.PI / 3, 0, 0]}
        >
          <boxGeometry />
          <meshStandardMaterial color="ForestGreen" />
        </mesh>
      </RigidBody>

    </group>  
  );
}
