import { useFrame } from '@react-three/fiber';
import React, { forwardRef, useEffect, useRef } from 'react';
import { CylinderGeometry, MeshStandardMaterial, Vector3 } from 'three';

/**
 * CONSTANTS
 */
const TIRE_RADIUS = 0.2;
const TIRE_WIDTH = 0.1;
const DEFAULT_OFFSET = -0.1;

const wheelGeometry = new CylinderGeometry(1, 1, 1);
const wheelMaterial = new MeshStandardMaterial({ color: 'blue'});

const wheelNames = [
  'wheelFL',
  'wheelFR',
  'wheelBL',
  'wheelBR',
];

const localForward = new Vector3(0, 0, -1);
const localUp = new Vector3(0, 1, 0);
const localRight = new Vector3(1, 0, 0);

const Wheel = ({
  index,
  initialPosition,
  forwardVector,
  axelVector,
  hits,
}, ref) => {

  /**
   * Arrow Helpers
   */
  const arrowARef = useRef();
  const arrowFRef = useRef();

  /**
   * Group Ref
   */
  const meshGroupRef = useRef();
  const wheelMesh = useRef();

  /**
   * Methods
   */

  /**
   * Call each frame to update arrow helpers direction
   */
  const updateArrowHelper = () => {
    // Forward Arrow
    arrowFRef.current.setDirection(localForward);
    arrowFRef.current.setColor('red');
    arrowFRef.current.setLength(0.4);
    
    // Axel Arrow
    arrowARef.current.setDirection(localRight);
    arrowARef.current.setColor('blue');
    arrowARef.current.setLength(0.2);
  }

  const offsetWheelBySpring = () => {
    let offset = DEFAULT_OFFSET;

    if(hits?.[index]?.current) {
      offset += hits?.[index].current.springOffset;
    }

    wheelMesh.current.position.y = offset;
  }

  /**
   * Rotate Mesh Group to look at forward vector
   */
  const rotateWheelGroup = () => {
    const reverseVector = forwardVector.clone();
    reverseVector.negate();
    const worldPosWheel = new Vector3();
    const newTarget = new Vector3();

    meshGroupRef.current.getWorldPosition(worldPosWheel);
    newTarget.addVectors(worldPosWheel, reverseVector);

    meshGroupRef.current.lookAt(newTarget);
  }

  useFrame(() => {
    updateArrowHelper();

    rotateWheelGroup();

    offsetWheelBySpring();
  });

  return (
    <group ref={meshGroupRef} name={wheelNames[index]} position={initialPosition}>
      <group name='DebugArrows'>
        <arrowHelper ref={arrowARef} />
        <arrowHelper ref={arrowFRef} />
      </group>

      <mesh ref={wheelMesh} rotation={[0, 0, Math.PI/2]} >
        <cylinderGeometry args={[TIRE_RADIUS, TIRE_RADIUS, TIRE_WIDTH]} />
        <meshStandardMaterial color="FireBrick" />
      </mesh>
    </group>
  )
}

export default forwardRef(Wheel);