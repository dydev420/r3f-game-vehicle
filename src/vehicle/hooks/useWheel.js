import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3 } from "three";
import { vec3 } from "@react-three/rapier";
import { DEFAULT_FORWARD, DEFAULT_RIGHT, REST_HEIGHT, WHEEL_DEFAULT_OFFSET, WHEEL_RADIUS } from "../utils/constants";

import useWheelStore from "src/vehicle/stores/useWheelStore";
import useWheelRay from "src/vehicle/hooks/useWheelRay";
import useDirections from "src/vehicle/hooks/useDirections";
import useSteering from "src/vehicle/hooks/useSteering";
import useGas from "src/vehicle/hooks/useGas";
import useSuspension from "src/vehicle/hooks/useSuspension";

/**
 * Local static variables
 */


/**
 * Local mutable temporary variables
 */


/**
 * @hook useWheel
 * 
 * Logic for individual wheel of the suspension / car/ bike
 *
 */
const useWheel = ({
  showRayDebug = true,
  index,
  body,
  mesh,
  meshGroup,
  wheelGroup,
}) => {
  /**
   * Store states
   */
  const groundHits = useWheelStore((state) => state.groundHits);
  const wheels = useWheelStore((state) => state.wheels);


  /**
   * Wheel Directions
   */
  const {
    forwardDir,
    upDir,
    rightDir,
    axelRight,
    axelForward,
    arrowFRef,
    arrowURef,
    arrowRRef,
    arrowARef,
    arrowAFRef,
    setDirVectors,
    updateArrowHelpers,
  } = useDirections({
    showRayDebug,
    index,
    body
  });

  
  /**
   * Wheel Raycast
  */
  const {
    arrowRay,
    castSpringRay,
    updateRayArrows,
    checkIfRayHit,
  } = useWheelRay({
    showRayDebug,
    index,
    upDir,
  });

  /**
   * Steering
   */
  const {
    arrowTF,
    checkIfSteering,
    applySteerForce,
    updateSteerForceArrowHelper,
  } = useSteering({
    showRayDebug, 
    index,
    body,
    forwardDir,
    upDir,
    rightDir,
    axelRight,
    axelForward,
  });

  /**
   * Suspension Spring
   */
  const {
    arrowSF,
    applySuspensionForce,
    updateSuspensionArrowHelper
  } = useSuspension({
    showRayDebug,
    index,
    body,
    upDir,
  });

  /**
   * Gas
   */
  const {
    checkIfPedal,
    applyGas
  } = useGas({
    showRayDebug,
    index,
    body,
    axelForward,
  })

  /**
   * Methods
  */
  /**
   * Animate wheel position by spring length
   */
  const offsetWheelBySpring = () => {
    // let offset = WHEEL_DEFAULT_OFFSET;
    let offset = WHEEL_RADIUS - REST_HEIGHT;

    if(groundHits?.[index]?.springOffset) {
      offset += groundHits?.[index]?.springOffset;
    }

    mesh.current.position.y = offset;
  }
  
  /**
   * Rotate Mesh Group to look at forward vector
   */
  const rotateWheel = () => {
    if(index > 1) {
      return;
    }

    const worldPosWheel = new Vector3();
    const worldPosTarget = new Vector3();

    const reverseVector = axelForward.current.clone();
    reverseVector.negate();

    wheelGroup.current.getWorldPosition(worldPosWheel);
    worldPosTarget.addVectors(worldPosWheel, reverseVector);

    meshGroup.current.lookAt(worldPosTarget);
  }

  /**
   * Spin Wheel based on wheel speed
   * 
   * ! BUGGY !
   */
  const spinWheel = (delta) => {
    const wheelVel = groundHits?.[index]?.wheelVelocity;

    if(wheelVel && axelForward?.current) {
      const rotationMultiplier = index % 2 ? -1 : 1
      
      const wheelForwardVelocity = axelForward?.current?.clone().dot(wheelVel);
      
      let angVel = wheelForwardVelocity / WHEEL_RADIUS;
      angVel = angVel * delta;
      angVel = angVel * rotationMultiplier;

  
      // mesh.current.rotateY(-angVel);
      mesh.current.rotateX(angVel);
    }

  }

  /**
   * useEffect & useFrame
   */
  useEffect(() => {
    // Empty for now
    console.log('useWheel', index);
  });

  useFrame((state, delta) => {
    rotateWheel();

    offsetWheelBySpring();

    spinWheel(delta);
  });


  return {
    rotateWheel,
    offsetWheelBySpring,
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
  };
};

export default useWheel;
