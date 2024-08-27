import { useFrame } from '@react-three/fiber';
import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { RepeatWrapping, Vector2, Vector3 } from 'three';
import { useTexture } from '@react-three/drei';
import { CuboidCollider, interactionGroups } from '@react-three/rapier';
import MustangWheel from "src/models/MustangWheel";
import { WHEEL_NAMES, WHEEL_RADIUS, WHEEL_WIDTH } from 'src/vehicle/utils/constants';
import useWheelStore from 'src/vehicle/stores/useWheelStore';
import useWheel from 'src/vehicle/hooks/useWheel';

const Wheel = ({
  showRayDebug,
  index,
  bodyRef,
  position,
}, ref) => {
  /**
   * Imperative Ref handle to expose wheel component refs and handlers
   */
  useImperativeHandle(ref, () => {
    return {
      index,
      wheelGroupRef: wheelGroup,
      meshGroupRef: meshGroup,
      wheelMeshRef: mesh,
      arrowFRef,
      arrowURef,
      arrowRRef,
      arrowARef,
      arrowAFRef,
      arrowRay,
      setDirVectors,
      updateArrowHelpers,
      arrowTF,
      checkIfSteering,
      applySteerForce,
      updateSteerForceArrowHelper,
      castSpringRay,
      checkIfRayHit,
      arrowSF,
      applySuspensionForce,
      updateSuspensionArrowHelper,
      checkIfPedal,
      applyGas,
      updateRayArrows,
    }
  }, [index]);

  /**
   * Wheels ref
   */
  const wheels = useWheelStore((state) => state.wheels);

  const wheelYRotation = index % 2 ? 0: Math.PI;

  const floorGridTexture = useTexture('./wallTile.png');

  /**
   * Group Ref
   */
  const wheelGroup = useRef();
  const meshGroup = useRef();
  const mesh = useRef();

  /**
   * Hooks
   */
  const {
    arrowFRef,
    arrowURef,
    arrowRRef,
    arrowARef,
    arrowAFRef,
    arrowRay,
    setDirVectors,
    updateArrowHelpers,
    arrowTF,
    checkIfSteering,
    applySteerForce,
    updateSteerForceArrowHelper,
    castSpringRay,
    checkIfRayHit,
    arrowSF,
    applySuspensionForce,
    updateSuspensionArrowHelper,
    checkIfPedal,
    applyGas,
    updateRayArrows,
  } = useWheel({
    showRayDebug,
    index,
    body: bodyRef,
    mesh,
    meshGroup,
    wheelGroup,
  });

  /**
   * Methods
   */
  useEffect(() => {
    console.log('WHeel', index);
  })

  useFrame(() => { 
    // rotateWheelGroup();
    // offsetWheelBySpring();
    // updateArrowHelper();
  });

  return (
    <group ref={wheelGroup} name={WHEEL_NAMES[index]} position={position}>
      <group name='wheelMesh' ref={meshGroup}>
        
        {/* <group ref={mesh} rotation={[0, wheelYRotation, 0]} >
          <mesh name='wheelMesh'  rotation={[0, 0, -Math.PI/2]} >
            <cylinderGeometry args={[WHEEL_RADIUS, WHEEL_RADIUS, WHEEL_WIDTH]} />
            <meshStandardMaterial
              color="FireBrick"
              map={floorGridTexture}
              wireframe
            />
          </mesh>
        </group> */}

        <MustangWheel
          name='wheelMesh'
          ref={mesh}
          rotation={[0, wheelYRotation, 0]}
        />
      
      </group>
    </group>
  )
}

export default forwardRef(Wheel);