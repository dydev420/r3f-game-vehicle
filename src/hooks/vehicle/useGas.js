import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3 } from "three";
import { vec3 } from "@react-three/rapier";

/**
 * Debug Config
 */
const LOG_SUMMARY = false;

/**
 * Car Config
 */
const ACC_SCALE = 1;
const ACC_FORWARD = 4;
const ACC_REVERSE = 6;
const MAX_SPEED = 10;
const BOOST_ACC = 10;

/**
 * @hook useGas
 * 
 * Acceleration, de-acceleration and fake friction
 *
 */
const useGas = ({
  showRayDebug = true,
  body,
  forwardVector,
  wheels
}) => {

  /**
   * Debug Values
   */
  const debugVector = new Vector3(0, 0, -1);

  /**
   * Methods
   */

  /**
   * Use the Front Wheel mid-point to get the position for applying force
   * 
   * @returns Vector with mid-point of FWD
   */
  const getDrivePosition = () => {
    const [wheelFL, wheelFR] = wheels;
    const wheelFLPos = vec3(wheelFL.current.translation());
    const wheelFRPos = vec3(wheelFR.current.translation());
    const wheelFMidPos = wheelFLPos.clone().lerp(wheelFRPos, 0.5);

    return wheelFMidPos;
  }

  const getFinalForceMultiplier = (forceMultiplier) => {
    let finalForceMultiplier = forceMultiplier;

    const linvel = body.current.linvel();
    const forwardDir = forwardVector.clone();
    const reverseDir = forwardVector.clone().negate();
    const forwardSpeed = forwardDir.dot(vec3(linvel));
    const reverseSpeed = reverseDir.dot(vec3(linvel));

    const normalizedSpeed = forwardSpeed / MAX_SPEED ;
    const canAccelerate = forwardSpeed < MAX_SPEED;
    const canBrake = reverseSpeed < MAX_SPEED;

    // Boost acceleration when input is opposite of velocity
    const isBrakingForce = (finalForceMultiplier * forwardSpeed) < 0;

    if(isBrakingForce) {
      finalForceMultiplier *= BOOST_ACC * Math.abs(normalizedSpeed);
    }

    if(!isBrakingForce && !canAccelerate) {
      finalForceMultiplier = 0;
    }

    if(isBrakingForce && !canBrake) {
      finalForceMultiplier = 0;
    }

    return finalForceMultiplier;
  }

  const getFinalForce = (delta, forceMultiplier) => {
    const finalForce = new Vector3(0, 0, 0);
    // Acceleration
    if(forceMultiplier > 0) {
      const accStrength = ACC_FORWARD * ACC_SCALE * forceMultiplier * delta;

      const force = forwardVector.clone().multiplyScalar(accStrength);
      
      finalForce.copy(force);
    }
    
    // Reverse / Brake
    if(forceMultiplier < 0) {
      const brakeStrength = ACC_REVERSE * ACC_SCALE * forceMultiplier  * delta;

      const force = forwardVector.clone().multiplyScalar(brakeStrength);

      finalForce.copy(force);
    }

    return finalForce;
  }

  const applyGas = (delta, forceMultiplier) => {
    const forcePosition = getDrivePosition();   
    const finalForceMultiplier = getFinalForceMultiplier(forceMultiplier);
    const forceVector =  getFinalForce(delta, finalForceMultiplier);
    
    // Add force at the front wheel always ??hack??
    body.current.addForceAtPoint(forceVector, forcePosition, true);

    /**
     * For Debug
     */
    if(LOG_SUMMARY) {
      debugSummary(forceMultiplier, finalForceMultiplier, forcePosition, forceVector);
    }
  }
  
  const debugSummary = (forceMultiplier, finalForceMultiplier, forcePosition, forceVector) => {
    console.log('FFFFFF~~~~~~~~~~~FFFFFFFF');
    console.log('Multiplier :: finalMultiplier', forceMultiplier, finalForceMultiplier);
    console.log('Force Position', forcePosition);
    console.log('Force Vector :: Length', forceVector, forceVector.length());
    console.log('~~~~~~~~~~~~~~~FFFFFF~~~~~~~~~~~~~~');
  }

  /**
   * useEffect & useFrame
   */
  useEffect(() => {
    // Empty for now
  });

  useFrame(() => {
    // Empty for now
  });


  return {
    debugVector,
    applyGas,
  };
};

export default useGas;
