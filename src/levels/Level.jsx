import { Float, Text, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { useMemo, useRef, useState } from "react";
import { BoxGeometry, Euler, MeshStandardMaterial, Quaternion, Vector3 } from "three";

const GRID_SIZE = 8;

const boxGeometry = new BoxGeometry(1, 1, 1);
const floor1Material = new MeshStandardMaterial({ color: 'limegreen'});
const floor2Material = new MeshStandardMaterial({ color: 'greenyellow'});
const obstacleMaterial = new MeshStandardMaterial({ color: 'orangered'});
const wallMaterial = new MeshStandardMaterial({ color: 'slategrey'});

export function BlockStart({ position = [0, 0, 0] }) {
  return(
    <group position={position}>
      {/* Title */}
      <Float floatIntensity={0.25} rotationIntensity={0.25}>
        <Text
          font="./bebas-neue-v9-latin-regular.woff"
          scale={0.5}
          maxWidth={0.25}
          lineHeight={0.75}
          textAlign="right"
          position={[0.75, 0.65, 0]}
          rotation-y={-0.25}
        >
          Rolly Race
          <meshBasicMaterial toneMapped={false} />
        </Text>
      </Float>

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

export function BlockSpinner({ position = [0, 0, 0] }) {
  const obstacle = useRef();

  const [speed] = useState(() => (Math.random() + 0.2) * (Math.random() < 0.5 ? -1 : 1));

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    const rotation = new Quaternion();
    rotation.setFromEuler(new Euler(0, time * speed, 0));
    obstacle.current.setNextKinematicRotation(rotation);
  });

  return(
    <group position={position}>

      {/* Floor */}
      <mesh
        receiveShadow
        position={[0, -0.1, 0]}
        scale={[4, 0.2, 4]}
        geometry={boxGeometry}
        material={floor2Material}
      />

      {/* Obstacle: Spinner */}
      <RigidBody
        ref={obstacle}
        type="kinematicPosition"
        position={[0, 0.3, 0]}
        restitution={0.2}
        friction={0}
      >
        <mesh
          castShadow
          receiveShadow
          position={[0, -0.1, 0]}
          scale={[3.5, 0.3, 0.3]}
          geometry={boxGeometry}
          material={obstacleMaterial}
        />
      </RigidBody>
    </group>  
  );
}

export function BlockLimbo({ position = [0, 0, 0] }) {
  const obstacle = useRef();

  const [timeOffset] = useState(() => (Math.random() * Math.PI * 2));

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    const y = Math.sin(time + timeOffset) + 1.25;

    obstacle.current.setNextKinematicTranslation({
      x: position[0],
      y: position[0] + y,
      z: position[2]
    });
  });

  return(
    <group position={position}>

      {/* Floor */}
      <mesh
        receiveShadow
        position={[0, -0.1, 0]}
        scale={[4, 0.2, 4]}
        geometry={boxGeometry}
        material={floor2Material}
      />

      {/* Obstacle: Spinner */}
      <RigidBody
      ref={obstacle}
        type="kinematicPosition"
        position={[0, 0.3, 0]}
        restitution={0.2}
        friction={0}
      >
        <mesh
          castShadow
          receiveShadow
          position={[0, -0.1, 0]}
          scale={[3.5, 0.3, 0.3]}
          geometry={boxGeometry}
          material={obstacleMaterial}
        />
      </RigidBody>


    </group>  
  );
}

export function BlockAxe({ position = [0, 0, 0] }) {
  const obstacle = useRef();

  const [timeOffset] = useState(() => (Math.random() * Math.PI * 2));

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    const x = Math.sin(time + timeOffset) * 1.25;

    obstacle.current.setNextKinematicTranslation({
      x: position[0] + x,
      y: position[0],
      z: position[2]
    });
  });

  return(
    <group position={position}>

      {/* Floor */}
      <mesh
        receiveShadow
        position={[0, -0.1, 0]}
        scale={[4, 0.2, 4]}
        geometry={boxGeometry}
        material={floor2Material}
      />

      {/* Obstacle: Spinner */}
      <RigidBody
      ref={obstacle}
        type="kinematicPosition"
        position={[0, 0.3, 0]}
        restitution={0.2}
        friction={0}
      >
        <mesh
          castShadow
          receiveShadow
          position={[0, 0.75, 0]}
          scale={[1.5, 1.5, 0.3]}
          geometry={boxGeometry}
          material={obstacleMaterial}
        />
      </RigidBody>


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
        {/* Right Wall */}
        <mesh
          castShadow
          position={[2.15, 0.75, - (length * 2) + 2  ]}
          scale={[0.3, 1.5, length * 4]}
          geometry={boxGeometry}
          material={wallMaterial}
        />

        {/* Left Wall */}
        <mesh
          receiveShadow
          position={[-2.15, 0.75, - (length * 2) + 2  ]}
          scale={[0.3, 1.5, length * 4]}
          geometry={boxGeometry}
          material={wallMaterial}
        />

        {/* Start Wall */}
        {/* <mesh
          receiveShadow
          position={[0, 0.75, 2]}
          scale={[4, 1.5, 0.3]}
          geometry={boxGeometry}
          material={wallMaterial}
        /> */}

        {/* End Wall */}
        <mesh
          receiveShadow
          position={[0, 0.75, - (length * 4) + 2  ]}
          scale={[4, 1.5, 0.3]}
          geometry={boxGeometry}
          material={wallMaterial}
        />

        {/* Floor Collider */}
        <CuboidCollider
          args={ [2, 0.1, length * 2] }
          position={[0, -0.1, -(length * 2) + 2]}
          restitution={0.2}
          friction={1}
        />

      </RigidBody>

    </group>  
  );
}


/**
 * Main Level Component
 */
export default function Level({
  count = 5,
  types =  [BlockSpinner, BlockAxe, BlockLimbo],
  seed = 0
}) {

  const blocks = useMemo(() => {
    const blocks = [];

    for (let i = 0; i < count; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      blocks.push(type);
    }

    return blocks;
  }, [count, types, seed]);

  return (
    <>
      <BlockStart position={ [0, 0, 0] } />
      
      {
        blocks.map((Block, index) => <Block key={index}  position={ [0, 0, -(index + 1) * 4] }/>)
      }

      <BlockEnd position={ [0, 0, -(count + 1) * 4] } />
    
      <Bounds length={count + 2} />
    </>
  )
}
