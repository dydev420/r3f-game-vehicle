import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3 } from "three";
import { interactionGroups, useRapier, vec3 } from "@react-three/rapier";
import { MAX_TRAVEL, REST_HEIGHT, WHEEL_DEFAULT_OFFSET } from "../utils/constants";
import useWheelStore from "../stores/useWheelStore";

/**
 * Local static variables
 */
const minSpringLength = REST_HEIGHT - MAX_TRAVEL;
const maxSpringLength = REST_HEIGHT + MAX_TRAVEL;


/**
 * @hook useWheel
 * 
 * Logic for individual wheel of the suspension / car/ bike
 *
 */
const useWheelRay = ({
  showRayDebug = true,
  index,
  upDir,
}) => {
   /**
   * Debug Arrow Refs
   */
   const arrowRay = useRef();

  /**
   * Ground Hits Array Store State
   */
  const groundHits = useWheelStore((state) => state.groundHits);
  const addGroundHitAt = useWheelStore((state) => state.addGroundHitAt);
  
  
  const wheels = useWheelStore((state) => state.wheels);

  /**
   * Springs Array Store State
   */
  const springs = useWheelStore((state) => state.springs);
  const updateSpringAt = useWheelStore((state) => state.updateSpringAt);
  

  /**
   * Get Rapier refs
   */
  const { rapier, world } = useRapier();

  /**
   * Methods
   */

  const handleSpringRayHit = (index, delta, toi, direction, origin) => {
    const prevSpringLength = springs[index].prevLength;
    
    let springLength = toi;
    springLength = Math.min(Math.max(springLength, minSpringLength), maxSpringLength)
    
    let springOffset = (REST_HEIGHT - springLength);
    // let springVel = (springLength - prevSpringLength) / delta;
    let springVel = (prevSpringLength - springLength) / delta;

    updateSpringAt(index, {
      springLength,
      prevLength: springs[index].springLength,
      offset: springOffset,
      velocity: springVel
    });
  
    addGroundHitAt(index, {
      toi,
      origin,
      direction,
      springOffset
    });
  }
  
  const handleNoSpringRayHit = (index, direction, origin) => {
    addGroundHitAt(index, {
      toi: null,
      origin,
      direction,
      springOffset: 0
    });
  }

  const castSpringRay = (delta) => {
    if(wheels[index]?.current) {
      const wheelPos = vec3(wheels[index].current.translation());
      const origin = wheelPos.clone();
      // origin.y -= 0.1;
  
      const direction = upDir.current.clone();
      direction.negate();
    
      const ray = new rapier.Ray(origin, direction);
      const hit = world.castRay(ray, 10, true, null, interactionGroups(0,0));
  
      if(hit && hit?.toi < maxSpringLength) {
        handleSpringRayHit(index, delta, hit.toi, direction, origin);
      } else {
        handleNoSpringRayHit(index, direction, origin);
      }
    }
  }

  /**
   * Arrow Helper for Raycast
   */
  const updateRayArrows = () => {
    if(showRayDebug && groundHits?.[index]) {
      const {
        direction,
        origin,
        toi
      } = groundHits[index];

      if(arrowRay.current) {
        arrowRay.current.position.copy(origin);
        arrowRay.current.setDirection(direction);
        arrowRay.current.setColor('#f1f101');
        arrowRay.current.setLength(toi);
      }
    }
  };

  /**
   * Check if ray hit
   */
  const checkIfRayHit = () => {
    if (groundHits[index]?.toi) {
      return true;
    }

    return false;
  }

  /**
   * useEffect & useFrame
   */
  useEffect(() => {
    console.log('useWheelRay', index);
    // Empty for now
  });

  useFrame((state, delta) => {
    // castSpringRay(delta);
  });


  return {
    arrowRay,
    castSpringRay,
    checkIfRayHit,
    updateRayArrows,
  };
};

export default useWheelRay;
