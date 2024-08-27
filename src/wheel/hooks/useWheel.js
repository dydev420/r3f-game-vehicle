import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3 } from "three";
import { vec3 } from "@react-three/rapier";
import { DEFAULT_FORWARD, DEFAULT_RIGHT, WHEEL_DEFAULT_OFFSET } from "../utils/constants";
import useWheelStore from "../stores/useWheelStore";
import useWheelRay from "./useWheelRay";

import useDirections from "./useDirections";
import useSteering from "./useSteering";
import useGas from "./useGas";
import useSuspension from "./useSuspension";

/**
 * Local static variables
 */


/**
 * Local mutable temporary variables
 */
const worldPosWheel = new Vector3();
const worldPosTarget = new Vector3();

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
    checkIfSteering,
    applySteerForce,
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
    let offset = WHEEL_DEFAULT_OFFSET;

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

    const reverseVector = axelForward.current.clone();
    reverseVector.negate();

    wheelGroup.current.getWorldPosition(worldPosWheel);
    worldPosTarget.addVectors(worldPosWheel, reverseVector);

    meshGroup.current.lookAt(worldPosTarget);
  }

  /**
   * useEffect & useFrame
   */
  useEffect(() => {
    // Empty for now
    console.log('useWheel', index);
  });

  useFrame(() => {
    rotateWheel();

    offsetWheelBySpring();
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
  };
};

export default useWheel;
