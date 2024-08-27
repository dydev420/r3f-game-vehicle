import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3 } from "three";
import { vec3 } from "@react-three/rapier";


/**
 * Debug Config
 */
const ENABLE_SPRING_FORCE_DEBUG = true;
const SPRING_ARROW_SCALE = 1;

/**
 * @hook useSuspensionHelper
 * 
 * Helper to update position of hitScan Helper Arrows
 *
 */
const useSuspensionHelper = ({
  showRayDebug = ENABLE_SPRING_FORCE_DEBUG,
  suspensionForces,
}) => {

  /**
   * Direction Vectors
   */
  const forwardVector = new Vector3(0, 0, -1);

  /**
   * Debug Arrow Refs
   */
  const springFL = useRef();
  const springFR = useRef();
  const springBL = useRef();
  const springBR = useRef();

  const suspensionHelpers = [
    springFL,
    springFR,
    springBL,
    springBR,
  ];

  /**
   * Methods
   */
  const updateSuspensionHelpers = () => {
    if(showRayDebug) {
      suspensionForces.forEach((force, index) => {
        const {
          direction,
          origin,
        } = force.current;

        const length = direction.length();

        suspensionHelpers[index].current.setDirection(direction);
        suspensionHelpers[index].current.setColor('orange');
        suspensionHelpers[index].current.setLength(length * SPRING_ARROW_SCALE);
        suspensionHelpers[index].current.position.copy(origin);
      });
    }
  };

  
  return {
    suspensionHelpers,
    updateSuspensionHelpers,
  };
};

export default useSuspensionHelper;
