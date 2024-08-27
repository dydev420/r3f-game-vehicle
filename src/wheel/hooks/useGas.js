import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3 } from "three";
import { vec3 } from "@react-three/rapier";
import { ACC_FORWARD, ACC_REVERSE, ACC_SCALE, BOOST_ACC, MAX_SPEED } from "../utils/constants";
import useInputStore from "../stores/useInputStore";
import useWheelStore from "../stores/useWheelStore";

/**
 * Debug Config
 */
const LOG_SUMMARY = false;


/**
 * @hook useGas
 * 
 * Acceleration, de-acceleration
 * and @todo fake friction
 *
 */
const useGas = ({
  showRayDebug = true,
  index,
  body,
  axelForward,
}) => {

  /**
   * Debug Values
   */
  const debugVector = new Vector3(0, 0, -1);

  /**
   * Stores
   */
  const inputAxis = useInputStore((state) => state.inputAxis);
  const wheels = useWheelStore((state) => state.wheels);

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

  const getFinalForceMultiplier = () => {
    let finalForceMultiplier = inputAxis.x;

    const linvel = body.current.linvel();
    const forwardDir = axelForward.current.clone();
    const reverseDir = axelForward.current.clone().negate();
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

  const getFinalForce = (delta) => {
    const forceMultiplier = getFinalForceMultiplier();
    const finalForce = new Vector3(0, 0, 0);
    // Acceleration
    if(forceMultiplier > 0) {
      const accStrength = ACC_FORWARD * ACC_SCALE * forceMultiplier * delta;

      const force = axelForward.current.clone().multiplyScalar(accStrength);
      
      finalForce.copy(force);
    }
    
    // Reverse / Brake
    if(forceMultiplier < 0) {
      const brakeStrength = ACC_REVERSE * ACC_SCALE * forceMultiplier  * delta;

      const force = axelForward.current.clone().multiplyScalar(brakeStrength);

      finalForce.copy(force);
    }

    return finalForce;
  }

  const applyGas = (delta) => {
    if(index > 1) {
      return;
    }
    
    const forcePosition = getDrivePosition();   
    const forceVector =  getFinalForce(delta);
    
    // Add force at the front wheel always ??hack??
    body.current.addForceAtPoint(forceVector, forcePosition, true);

    /**
     * For Debug
     */
    if(LOG_SUMMARY) {
      debugSummary(forceMultiplier, finalForceMultiplier, forcePosition, forceVector);
    }
  }

  /**
   * Runs Every Frame to check if steering input if pressed
   * 
   * calls rotateAxelPlane when input is detected
   */
  const checkIfPedal = () => {
    if(Math.abs(inputAxis.x)) {
      console.log('Pedal', inputAxis.x);

      return true
    }

    return false;
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
    checkIfPedal,
    applyGas,
  };
};

export default useGas;
