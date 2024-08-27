import { useFrame } from '@react-three/fiber';
import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { Vector3 } from 'three';
import useWheel from '../hooks/useWheel';
import { WHEEL_NAMES, WHEEL_RADIUS, WHEEL_WIDTH } from '../utils/constants';
import useWheelStore from '../stores/useWheelStore';
import { CuboidCollider, interactionGroups } from '@react-three/rapier';

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
      checkIfSteering,
      applySteerForce,
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
    checkIfSteering,
    applySteerForce,
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
        <mesh name='wheelMesh' ref={mesh} rotation={[0, 0, -Math.PI/2]} >
          <cylinderGeometry args={[WHEEL_RADIUS, WHEEL_RADIUS, WHEEL_WIDTH]} />
          <meshStandardMaterial color="FireBrick" wireframe />
        </mesh>
      </group>
    </group>
  )
}

export default forwardRef(Wheel);