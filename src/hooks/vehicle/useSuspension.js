import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3 } from "three";
import { interactionGroups, vec3 } from "@react-three/rapier";

/**
 * Time Factor
 */
const TIME_SCALE = 10;


/**
 * DUPLICATE from VehicleController
 * Suspension Height Config
 */
const REST_HEIGHT = 0.4;
const MAX_TRAVEL = 0.2;

/**
 * Spring Config
 */
const SPRING_SCALE = 1;
const SPRING_STRENGTH = 20;
const SPRING_DAMPING = 15;

/**
 * @hook useSuspension
 * 
 * Return the Forward, Up, Right, Axel
 *
 */
const useSuspension = ({
  showRayDebug = true,
  rapier,
  world,
  body,
  upVector,
  rightVector,
  wheels,
  steerAxel,
}) => {
  /**
   * Debug Values
   */
  const debugVector = new Vector3(0, 0, -1);

  /**
   * Spring vars
   */
  const minSpringLength = REST_HEIGHT - MAX_TRAVEL;
  const maxSpringLength = REST_HEIGHT + MAX_TRAVEL;

  /**
   * Last Length Ref State
   */
  const springStateRef = useRef({
    lengths: [REST_HEIGHT, REST_HEIGHT, REST_HEIGHT, REST_HEIGHT ],
    lastLengths: [REST_HEIGHT, REST_HEIGHT, REST_HEIGHT, REST_HEIGHT]
  });

  /**
   * hitRefs array
   */
  const hits = [
    useRef(),
    useRef(),
    useRef(),
    useRef(),
  ];

  /**
   * Spring Force Refs Array
   */
  const suspensionForces = [
    useRef(),
    useRef(),
    useRef(),
    useRef(),
  ];


  /**
   * Methods
   */

  /**
   * Suspension Spring Force
   */
  const suspensionSpringForce = (delta, wheelIndex, springOffSet, springVel, wheelPosition) => {
    const springDir = upVector.clone();

    const springF = springOffSet * SPRING_STRENGTH;
    const dampF = springVel * SPRING_DAMPING;
    const susF = springF - dampF;

    const susForce = springDir.clone().multiplyScalar(susF * delta * SPRING_SCALE);

    /**
     * Update springForcesRef
     */
    suspensionForces[wheelIndex].current = {
      origin: wheelPosition,
      direction: susForce,
    };

    body.current.addForceAtPoint(susForce , wheelPosition, true);
  }

  /**
   * Suspension Raycast
   */
  const suspensionRaycast = (delta) => {
    const {
      lengths,
      lastLengths
    } = springStateRef.current;
   
    wheels.forEach((wheelRef, index) => {
      const wheelPos = vec3(wheelRef.current.translation());
      
      let springLength = lengths[index];
      let springOffset = 0;

      const origin = wheelPos.clone();
      // origin.y -= 0.1;

      const direction = upVector.clone();
      direction.negate();
    
      const ray = new rapier.Ray(origin, direction);
      const hit = world.castRay(ray, 10, true, null, interactionGroups(0,0));

      if(hit?.toi < maxSpringLength) {
        const prevSpringLength = lastLengths[index];
        const toi = hit.toi;
        
        let springLength = toi;
        springLength = Math.min(Math.max(springLength, minSpringLength), maxSpringLength)
        
        let springOffset = (REST_HEIGHT - springLength);
        let springVel = (springLength - prevSpringLength) / delta;
        
        /**
         * Apply Spring Force for suspension
         * 
        */
        suspensionSpringForce(delta, index, springOffset, springVel, wheelPos);
       
        /**
          * Apply Drag to steer vehicle
        */
        steerAxel(delta);
        
        /**
         * Update local and shared state Refs
        */
        springStateRef.current.lastLengths[index] = lengths[index];
        springStateRef.current.lengths[index] = springLength;
        hits[index].current = { toi, origin, direction, springOffset };

        } else {
        hits[index].current = {
          toi: null,
          origin,
          direction,
          springOffset
        }

        suspensionForces[index].current = {
          origin: new Vector3(0, 0, 0),
          direction: new Vector3(0, 0, 0),
        };
      }
    });
  }
  
  return {
    debugVector,
    hits,
    suspensionForces,
    suspensionRaycast,
  };
};

export default useSuspension;
