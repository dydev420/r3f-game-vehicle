import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3 } from "three";
import { interactionGroups, vec3 } from "@react-three/rapier";

import {
  SPRING_SCALE,
  SPRING_STRENGTH,
  SPRING_DAMPING,
  DEFAULT_UP
} from '../utils/constants';
import useWheelStore from "../stores/useWheelStore";

/**
 * @hook useSuspension
 * 
 * Return the Forward, Up, Right, Axel
 *
 */
const useSuspension = ({
  showRayDebug = true,
  index,
  body,
  upDir,
}) => {
  /**
   * Debug Arrow Ref
   */
  const arrowSF = useRef();

  /**
   * Stores
   */
  const wheels = useWheelStore(state => state.wheels);
  const groundHits = useWheelStore(state => state.groundHits);
  const springs = useWheelStore(state => state.springs);

  /**
   * Spring Force Refs Array
   */
  const suspensionForce = useRef({
    origin: new Vector3(),
    direction: new Vector3()
  });


  /**
   * Methods
   */
  /**
   * Suspension Spring Force
   */
  const applySuspensionForce = (delta) => {
    suspensionForce.current = {
      origin: new Vector3(0, 0, 0),
      direction: new Vector3(0, 0, 0),
    };

    if(!groundHits?.[index]) {
      return;
    }

    const wheelPos = vec3(wheels[index].current.translation());
    const {
      toi,
      origin,
      direction
    } = groundHits[index];

    if(!toi) {
      return;
    }

    const {
      offset,
      velocity,
    } = springs[index];


    // const springDir = upDir.current.clone();
    const springDir = DEFAULT_UP.clone();

    const springF = offset * SPRING_STRENGTH;
    const dampF = velocity * SPRING_DAMPING;
    // const susF = springF - dampF;
    const susF = springF + dampF;

    console.log('Spring -----', offset);
    console.log('----force', springF, offset);
    console.log('----damp', dampF, velocity);

    const susForce = springDir.clone().multiplyScalar(susF * delta * SPRING_SCALE);

    /**
     * Update springForcesRef
     */
    suspensionForce.current = {
      origin: wheelPos,
      direction: susForce,
    };

    body.current.addForceAtPoint(susForce , wheelPos, true);
  };

  /**
   * Arrow Helper for Raycast
   */
  const updateSuspensionArrowHelper = () => {
    if(showRayDebug && suspensionForce?.current) {
      const {
        direction,
        origin,
      } = suspensionForce.current;

      if(arrowSF.current) {
        arrowSF.current.position.copy(origin);
        arrowSF.current.setDirection(direction);
        arrowSF.current.setColor('orange');
        arrowSF.current.setLength(direction.length());
      }
    }
  };

  
  return {
    arrowSF,
    applySuspensionForce,
    updateSuspensionArrowHelper,
  };
};

export default useSuspension;
