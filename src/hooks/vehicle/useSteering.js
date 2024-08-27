import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3 } from "three";
import { vec3 } from "@react-three/rapier";

/**
 * Steer Config
 */
const STEER_SCALE = 0.1;
const TIRE_GRIP = 0.8;
const TIRE_MASS = 1;
const TIRE_TIME_MULTIPLIER = 100000;

/**
 * @hook useSteering
 * 
 * Return the Forward, Up, Right, Axel
 *
 */
const useSteering = ({
  showRayDebug = true,
  body,
  forwardVector,
  upVector,
  rightVector,
  axelVector,
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
   * Rotates the axelVector
   * 
   */
  const rotateAxelPlane = (turn) => {
    const rotateAxis = upVector.clone().normalize();
    const rotateAngle = turn * (Math.PI / 6);
    const rotatedAxel = axelVector.clone().applyAxisAngle(rotateAxis, rotateAngle);
    const rotatedForward = forwardVector.clone().applyAxisAngle(rotateAxis, rotateAngle);
    
    // Mutate Direction vectors on Axel Plane
    axelVector.copy(rotatedAxel);
    forwardVector.copy(rotatedForward);
  }

  /**
   * Steering Logic and Wheel Rotation
   * 
   */
  const steerAxel = (delta) => {
    const [wheelFL, wheelFR] = wheels;
    const wheelFLPos = vec3(wheelFL.current.translation());
    const wheelFRPos = vec3(wheelFR.current.translation());
    const steerDir = axelVector.clone();
    const linvel = body.current.linvel();
    const tireWorldVel = vec3(linvel);

    const steerDotVel = steerDir.clone().dot(tireWorldVel);
    const gripVelChange = -steerDotVel * TIRE_GRIP;
    const gripAccel = gripVelChange / (delta * TIRE_TIME_MULTIPLIER) ;
    const gripForce = steerDir.clone().multiplyScalar(gripAccel * TIRE_MASS * STEER_SCALE);

    body.current.addForceAtPoint(gripForce, wheelFLPos, true);
    body.current.addForceAtPoint(gripForce, wheelFRPos, true);
  }

  
  /**
   * Exposed to test if hook function calls are working
   */
  const debugCall = (initCall) => {
    if(initCall) {
      console.debug('useSteering :: First Debug Call');
    }

    console.debug('Debug Call');
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
    debugCall,
    steerAxel,
    axelVector,
    rotateAxelPlane,
  };
};

export default useSteering;
