import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3 } from "three";
import { vec3 } from "@react-three/rapier";
import { ACC_FORWARD, ACC_REVERSE, ACC_SCALE, BOOST_ACC, DRIVE_TRAIN_BWD, DRIVE_TRAIN_FWD, MAX_SPEED } from "src/vehicle/utils/constants";
import useInputStore from "src/vehicle/stores/useInputStore";
import useWheelStore from "src/vehicle/stores/useWheelStore";

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
  // driveTrain = DRIVE_TRAIN_FWD,
  driveTrain = DRIVE_TRAIN_BWD,
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
   * State Ref
   */
  const isBraking = useRef(false);

  /**
   * Methods
   */
  /**
   * Use the Front Wheel mid-point to get the position for applying force
   * 
   * @returns Vector with mid-point of FWD
   */
  const getDrivePosition = () => {
    const [wheelFL, wheelFR, wheelBL, wheelBR] = wheels;
    let wheelLPos;
    let wheelRPos;

    if(driveTrain === DRIVE_TRAIN_FWD && !isBraking.current) {
      wheelLPos = vec3(wheelFL.current.translation());
      wheelRPos = vec3(wheelFR.current.translation());
    } else {
      wheelLPos = vec3(wheelBL.current.translation());
      wheelRPos = vec3(wheelBR.current.translation());
    }


    const wheelFMidPos = new Vector3();
    wheelFMidPos.lerpVectors(wheelLPos, wheelRPos, 0.5)

    // Lower force point to add springy launch
    wheelFMidPos.y -= 0.2

    return wheelFMidPos;
  }

  const getFinalForceMultiplier = () => {
    let finalForceMultiplier = inputAxis.x;

    const linvel = body.current.linvel();
    const axelForwardDir = axelForward.current.clone();
    const reverseDir = axelForward.current.clone().negate();
    const forwardSpeed = axelForwardDir.dot(vec3(linvel));
    const reverseSpeed = reverseDir.dot(vec3(linvel));

    const normalizedSpeed = forwardSpeed / MAX_SPEED ;
    const canAccelerate = forwardSpeed < MAX_SPEED;
    const canBrake = reverseSpeed < MAX_SPEED;

    // Boost acceleration when input is opposite of velocity
    const isBrakingForce = (finalForceMultiplier * forwardSpeed) < 0;
    isBraking.current = isBrakingForce;

    if(isBrakingForce) {
      // finalForceMultiplier *= BOOST_ACC * Math.abs(normalizedSpeed);
      finalForceMultiplier *= BOOST_ACC; 
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

  /**
   * Apply fake friction to stop car when not accelerating
   * 
   * ! BUGGY !
   */
  const applyFakeFriction = (delta) => {
    const linvel = vec3(body.current.linvel());
    const forcePosition = getDrivePosition();

    linvel.y = 0;
    
    const frictionForce = linvel.multiplyScalar(-0.1);

  }

  const applyGas = (delta) => {
    // No acc force from back wheels
    if(index > 1) {
      return;
    }
    
    const forcePosition = getDrivePosition();   
    const forceVector =  getFinalForce(delta);

    console.log('Applying gas');
    
    
    // Add impulse at the front wheel always ??hack for FWD??
    body.current.applyImpulseAtPoint(forceVector, forcePosition, true);
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
