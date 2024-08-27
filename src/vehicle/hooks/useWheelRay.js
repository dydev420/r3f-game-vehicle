import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3 } from "three";
import { interactionGroups, useRapier, vec3 } from "@react-three/rapier";
import { MAX_TRAVEL, REST_HEIGHT, WHEEL_DEFAULT_OFFSET } from "src/vehicle/utils/constants";
import useWheelStore from "src/vehicle/stores/useWheelStore";

/**
 * Local static variables
 */
const minSpringLength = REST_HEIGHT - MAX_TRAVEL;
const maxSpringLength = REST_HEIGHT + MAX_TRAVEL;


/**
 * @hook useWheel
 * 
 * Logic for individual wheel of the suspension / car / bike
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
   * Ground Hits Array Store
   */
  const groundHits = useWheelStore((state) => state.groundHits);
  const addGroundHitAt = useWheelStore((state) => state.addGroundHitAt);
  
  
  const wheels = useWheelStore((state) => state.wheels);

  /**
   * Wheel Springs Array Store
   */
  const springs = useWheelStore((state) => state.springs);
  const updateSpringAt = useWheelStore((state) => state.updateSpringAt);
  
  /**
   * Wheel Slips Array Store
   */

  /**
   * Get Rapier refs
   */
  const { rapier, world } = useRapier();

  /**
   * Methods
   */

  const getWheelVelocity = (delta) => {
    const wheelPos = vec3(wheels[index].current.translation());

    const vel = new Vector3();
    const previousPos = groundHits?.[index].origin;

    vel.subVectors(wheelPos, previousPos);
    vel.multiplyScalar(1/ delta);
    
    return vel;
  }

  const handleSpringRayHit = (index, delta, toi, direction, origin) => {
    const prevSpringLength = springs[index].prevLength;
    
    let springLength = toi;
    springLength = Math.min(Math.max(springLength, minSpringLength), maxSpringLength)
    
    let springOffset = (REST_HEIGHT - springLength);
    // let springVel = (springLength - prevSpringLength) / delta;
    let springVel = (prevSpringLength - springLength) / delta;

    const wheelVel = getWheelVelocity(delta);

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
      springOffset,
      wheelVelocity: wheelVel,
    });

  }
  
  const handleNoSpringRayHit = (index, delta, direction, origin, wheelVel) => {
    addGroundHitAt(index, {
      toi: null,
      origin,
      direction,
      springOffset: 0,
      wheelVelocity: 0
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
        handleNoSpringRayHit(index, delta, direction, origin);
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
   * Check if ray hit is true in groundHits array
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
