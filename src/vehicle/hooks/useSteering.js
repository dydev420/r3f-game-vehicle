import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3 } from "three";
import { vec3 } from "@react-three/rapier";
import { MAX_SPEED, STEER_SCALE, WHEEL_GRIP_BACK, WHEEL_GRIP_FRONT, WHEEL_MASS } from "src/vehicle/utils/constants";
import useInputStore from "src/vehicle/stores/useInputStore";
import useWheelStore from "src/vehicle/stores/useWheelStore";
import useInterpolation from "src/vehicle/hooks/useInterpolation";

// Curve to dynamically change FRONT tire grip based on sliding velocity
const steerVelocityGripLookupFront = [
  {
    x: 0,
    y: 0.9
  },
  {
    x: 0.2,
    y: 0.4
  },
  {
    x: 0.5,
    y: 0.3
  },
  {
    x: 1,
    y: 0.2
  }
];

// Curve to dynamically change BACK tire grip based on sliding velocity
const steerVelocityGripLookupBack = [
  {
    x: 0,
    y: 0.9
  },
  {
    x: 0.2,
    y: 0.6
  },
  {
    x: 0.5,
    y: 0.4
  },
  {
    x: 1,
    y: 0.2
  }
];


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
   * Debug Arrow Ref
   */
  const arrowTF = useRef();

  /**
   * Stores
   */
  const inputAxis = useInputStore((state) => state.inputAxis);
  const wheels = useWheelStore((state) => state.wheels);
  const groundHits = useWheelStore(state => state.groundHits);
  const updateSlipAt = useWheelStore(state => state.updateSlipAt);
  const wheelSlips = useWheelStore(state => state.slips);

   /**
   * Steer Force Ref
   */
   const steerForce = useRef({
    origin: new Vector3(),
    direction: new Vector3()
  });

  /**
   * Interpolant Hook for Tire Grip
   */
  const gripLookup = index < 2 ? steerVelocityGripLookupFront : steerVelocityGripLookupBack;
  const { pValueRef, updatePRef } = useInterpolation(gripLookup);
  const dynamicTireGrip = useRef(WHEEL_GRIP_FRONT);


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
    const rotateAngle = -inputValue * (Math.PI / 6);
    const rotatedAxel = rightDir.current.clone().applyAxisAngle(rotateAxis, rotateAngle);
    const rotatedForward = forwardDir.current.clone().applyAxisAngle(rotateAxis, rotateAngle);
    
    // Mutate Direction vectors on Axel Plane
    axelRight.current.copy(rotatedAxel);
    axelForward.current.copy(rotatedForward);
  }

  /**
   * Update Dynamic tireGrip
   */
  const updateTireGrip = () => {
    const nSlipSpeed = wheelSlips[index];

    updatePRef(nSlipSpeed);

    dynamicTireGrip.current = pValueRef.current;
  }

  /**
   * Update Wheel Slip
   */
  const updateWheelSlip = () => {
    const wheelHit = groundHits?.[index];
    if(wheelHit?.toi) {

      const wheelVel = wheelHit.wheelVelocity;
      const steerDir = axelRight.current.clone();
      const forwardDir = axelForward.current.clone();
      
      const steerDotVel = Math.abs(steerDir.dot(wheelVel));
      const forwardDotVel = Math.abs(forwardDir.dot(wheelVel));

      const slip = steerDotVel / (steerDotVel + forwardDotVel);
  
      updateSlipAt(index, slip);
  
    } else {
      updateSlipAt(index, 1);
    }
  }

  /**
   * Steering Force Logic 
   * 
   * @todo FIX IT! BUGGY
   * Called from parent on Raycast hit handler
   */
  const applySteerForce = (delta) => {
    steerForce.current = {
      origin: new Vector3(0, 0, 0),
      direction: new Vector3(0, 0, 0),
    };

    const wheelVel = groundHits?.[index].wheelVelocity;

    const wheelPos = vec3(wheels[index].current.translation());
    const steerDir = axelRight.current.clone();
    
    const tireWorldVel = wheelVel.clone();
    // const tireGrip = index < 2 ? WHEEL_GRIP_FRONT: WHEEL_GRIP_BACK;
    let tireGrip = dynamicTireGrip.current;

    /**
     * !!Cheap bad drifting logic change it pls!!!
     */
    const isDrifting  = useInputStore.getState().isDriftPressed;
    if(isDrifting) {
      if(index > 1) {
        tireGrip *= 0.4;
        tireGrip = Math.max(tireGrip, 0.1);
      } else {
        tireGrip *= 0.9;
      }
    }

    const steerDotVel = steerDir.clone().dot(tireWorldVel);
    const gripVelChange = -steerDotVel * tireGrip;
    const gripAccel = gripVelChange / delta ;
    const gripForce = steerDir.clone().multiplyScalar(gripAccel * delta * WHEEL_MASS * STEER_SCALE);

    /**
     * Update steerForce Ref
     */
    steerForce.current = {
      origin: wheelPos,
      direction: gripForce,
    };

    // body.current.addForceAtPoint(gripForce, wheelPos, true);
    body.current.applyImpulseAtPoint(gripForce, wheelPos, true);
  }

  /**
   * Runs Every Frame to check if steering input if pressed
   * 
   * calls rotateAxelPlane when input is detected
   */
  const checkIfSteering = () => {
    if(Math.abs(inputAxis.y)) {
      rotateAxelPlane(inputAxis.y);

      return true;
    }

    return false;
  }

  /**
   * Arrow Helper for steer force
   */
  const updateSteerForceArrowHelper = () => {
    if(showRayDebug && steerForce?.current) {
      const {
        direction,
        origin,
      } = steerForce.current;

      if(arrowTF.current) {
        arrowTF.current.position.copy(origin);
        arrowTF.current.setDirection(direction);
        arrowTF.current.setColor('red');
        arrowTF.current.setLength(direction.length());
      }
    }
  };

  /**
   * useEffect & useFrame
   */
  useEffect(() => {
    console.log('useSteering');
    // Empty for now
  });

  useFrame(() => {
    // updatePRef(0.2);

    updateTireGrip();

    updateWheelSlip();
  });


  return {
    arrowTF,
    checkIfSteering,
    applySteerForce,
    rotateAxelPlane,
    updateSteerForceArrowHelper,
  };
};

export default useSteering;
