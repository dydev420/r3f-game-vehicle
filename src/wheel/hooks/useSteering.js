import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3 } from "three";
import { vec3 } from "@react-three/rapier";
import { STEER_SCALE, WHEEL_GRIP, WHEEL_MASS } from "../utils/constants";
import useInputStore from "../stores/useInputStore";
import useWheelStore from "../stores/useWheelStore";


/**
 * @hook useSteering
 * 
 * Return the Forward, Up, Right, Axel
 *
 */
const useSteering = ({
  showRayDebug = true,
  index,
  body,
  forwardDir,
  upDir,
  rightDir,
  axelDir,
  axelRight,
  axelForward,
}) => {

  /**
   * Stores
   */
  const inputAxis = useInputStore((state) => state.inputAxis);
  const wheels = useWheelStore((state) => state.wheels);

  /**
   * Methods
   */

  /**
   * Rotates the axelVector
   * 
   */
  const rotateAxelPlane = (inputValue) => {
    if(index > 1) {
      return;
    }

    const rotateAxis = upDir.current.clone().normalize();
    const rotateAngle = inputValue * (Math.PI / 6);
    const rotatedAxel = rightDir.current.clone().applyAxisAngle(rotateAxis, rotateAngle);
    const rotatedForward = forwardDir.current.clone().applyAxisAngle(rotateAxis, rotateAngle);
    
    // Mutate Direction vectors on Axel Plane
    axelRight.current.copy(rotatedAxel);
    axelForward.current.copy(rotatedForward);
  }

  /**
   * Steering Force Logic 
   * 
   * @todo FIX IT! BUGGY
   * Called from parent on Raycast hit handler
   */
  const applySteerForce = (delta) => {
    if(!checkIfSteering()) {
      return;
    }

    const wheelPos = vec3(wheels[index].current.translation());
    const steerDir = axelRight.current.clone();
    const linvel = body.current.linvel();
    const tireWorldVel = vec3(linvel);

    const steerDotVel = steerDir.clone().dot(tireWorldVel);
    const gripVelChange = -steerDotVel * WHEEL_GRIP;
    const gripAccel = gripVelChange / delta ;
    const gripForce = steerDir.clone().multiplyScalar(gripAccel * delta * WHEEL_MASS * STEER_SCALE);

    body.current.addForceAtPoint(gripForce, wheelPos, true);
  }

  /**
   * Runs Every Frame to check if steering input if pressed
   * 
   * calls rotateAxelPlane when input is detected
   */
  const checkIfSteering = () => {
    if(Math.abs(inputAxis.y)) {
      console.log('steering', inputAxis.y);
      rotateAxelPlane(inputAxis.y);

      return true;
    }

    return false;
  }

  /**
   * useEffect & useFrame
   */
  useEffect(() => {
    console.log('useSteering');
    // Empty for now
  });

  useFrame(() => {
    // checkIfSteering();
  });


  return {
    checkIfSteering,
    applySteerForce,
    rotateAxelPlane,
  };
};

export default useSteering;
