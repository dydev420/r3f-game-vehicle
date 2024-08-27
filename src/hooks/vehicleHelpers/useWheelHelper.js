import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3 } from "three";
import { vec3 } from "@react-three/rapier";


/**
 * Debug Config
 */
const ENABLE_WHEEL_RAY_DEBUG = true;

/**
 * @hook useWheelHelper
 * 
 * Helper to update position of hitScan Helper Arrows
 *
 */
const useWheelHelper = ({
  showRayDebug = ENABLE_WHEEL_RAY_DEBUG,
  hits,
}) => {

  /**
   * Direction Vectors
   */
  const forwardVector = new Vector3(0, 0, -1);

  /**
   * Debug Arrow Refs
   */
  const arrowFL = useRef();
  const arrowFR = useRef();
  const arrowBL = useRef();
  const arrowBR = useRef();

  const wheelHelpers = [
    arrowFL,
    arrowFR,
    arrowBL,
    arrowBR,
  ];

  /**
   * Methods
   */
  const updateWheelHelpers = () => {
    if(showRayDebug) {
      hits.forEach((hit, index) => {
        const {
          direction,
          origin,
          toi
        } = hit.current;

        wheelHelpers[index].current.setDirection(direction);
        wheelHelpers[index].current.setColor('#f1f101');
        wheelHelpers[index].current.setLength(toi);
        wheelHelpers[index].current.position.copy(origin);
      });
    }
  };

  /**
   * useEffect & useFrame
   */
  useEffect(() => {
    // Empty for now
  });

  useFrame(() => {
    /**
     * Update All Direction Vectors and their Debug
     */
    // updateWheelHelpers();
  });


  return {
    arrowFL,
    arrowFR,
    arrowBL,
    arrowBR,
    wheelHelpers,
    updateWheelHelpers,
  };
};

export default useWheelHelper;
