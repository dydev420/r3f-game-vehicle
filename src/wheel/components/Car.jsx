import { CapsuleCollider, CuboidCollider, CylinderCollider, RigidBody, interactionGroups, quat, useRapier, useRevoluteJoint, vec3 } from "@react-three/rapier";
import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Line, useKeyboardControls } from "@react-three/drei";
import { Color, Euler, Quaternion, Vector3 } from "three";
import { useControls } from "leva";

import {
  ANG_DAMP,
  CHASSIS_COM,
  CHASSIS_POS,
  DEBUG_IMPULSE,
  ENABLE_DIRECTION_DEBUG,
  ENABLE_RAY_DEBUG,
  FRICTION,
  LINEAR_DAMP,
  MASS,
  WHEEL_POS_BL,
  WHEEL_POS_BR,
  WHEEL_POS_FL,
  WHEEL_POS_FR,
} from "../utils/constants";

import useFollowCamera from "../../hooks/vehicle/useFollowCamera";
import useWheelStore from "../stores/useWheelStore";
import Wheel from "./Wheel";
import useDirectionVectors from "../hooks/useDirectionVectors";
import useInputAxis from "../hooks/useInputAxis";
import useSteering from "../hooks/useSteering";

/**
 * Wheels Config
 */
const wheelsConfig = {
  fl: {
    position: WHEEL_POS_FL,
  },
  fr: {
    position: WHEEL_POS_FR,
  },
  bl: {
    position: WHEEL_POS_BL,
  },
  br: {
    position: WHEEL_POS_BR,
  },
}

/**
 * Chassis Config
 */
const chassisConfig = {
  position: CHASSIS_POS,
  centreOfMass: CHASSIS_COM
}

/**
 * Car Controller to handle Raycast based car Physics.
 * Each wheel casts a ray towards the down direction of RigidBody
 * 
 * @todo Spring Suspension
 * @todo Turning
 * @todo Boosted Acceleration
 * @todo Drag and Drift
 * 
 * @returns Component
 */

function Car() {
  /**
   * Debug UI
   */
  const {rayDebug, directionDebug, followCamera } = useControls({
    rayDebug: { value: ENABLE_RAY_DEBUG },
    directionDebug: { value: ENABLE_DIRECTION_DEBUG },
    followCamera: { value: true }
  });

  /**
   * Meshes and Rigid Bodies
   */
  const body = useRef();
  const bodyMesh = useRef();
  const meshGroup = useRef();
  
  const comDebug = useRef(); 
  
  /**
   * Physics api and world
   */
  const { rapier, world } = useRapier();

  /**
   * Wheels
   */
  const wheels = useWheelStore((state) => state.wheels);

  const wheelRefs = [
    useRef(),
    useRef(),
    useRef(),
    useRef(),
  ];

  /**
   *  Required Hooks don't remove : Camera Hooks
   */
  const { setCameraForward } = useFollowCamera({
    body,
    active: followCamera
  });

  /**
   * Required Hooks don't remove : Input Hook
   */
  const { inputAxis } = useInputAxis();

  /**
   * Keyboard Input Hooks
   */
  const [ subscribeKeys, getKeys ] = useKeyboardControls();


  /**
   * Methods
   */
  
  /**
   * Jump Debug Impulse
   */
  const jump = () => {
    body.current.applyImpulse({x: 0, y: DEBUG_IMPULSE * MASS, z: - DEBUG_IMPULSE * MASS}, true);
  }

  /**
   * Reset Game
   * 
   * used for debug by pressing End Key
   */
  const reset = () => {
    body.current.resetForces(true);
    body.current.resetTorques(true);

    body.current.setTranslation({ x: 0, y: RESET_POINT_HEIGHT, z: 0});
    body.current.setLinvel({ x: 0, y: 0, z: 0});
    body.current.setAngvel({ x: 0, y: 0, z: 0});
  }

  const updateComDebug = () => {
    const worldCom = vec3(body.current.worldCom());

    comDebug.current.position.copy(worldCom);
  }

  /**
   * Handle Ray Hit
   */
  const handleRayHit = (delta, wheelRef) => {
    // body.current.resetForces(true);

    wheelRef.current.applyGas(delta);

    wheelRef.current.applySuspensionForce(delta);

    wheelRef.current.applySteerForce(delta);
  }

  /**
   * UseEffect
   */
  useEffect(() => {
    console.log('---Car---');
    const unsubscribeJump =  subscribeKeys(
      (state) => state.jump,
      (value) => {
        if(value) {
          jump();
        }
      }
    );

    const unsubscribeDebugEnd =  subscribeKeys(
      (state) => state.debugEnd,
      (value) => {
        if(value) {
          reset();
        }
      }
    );

    /**
     * Return
     * 
     */
    return () => {
      unsubscribeJump();
      unsubscribeDebugEnd();
    };
  }, []);

  /**
   * UseFrame
   */
  useFrame((state, delta) => {
    /**
     * START
     * 
     * Runs first to set direction vectors by copying body rotation quaternion
     */
    wheelRefs.forEach((wheelRef) => {
      wheelRef.current?.setDirVectors();
    });

    /**
     * Steering Input check and axel rotation
     */
    wheelRefs.forEach((wheelRef) => {
      wheelRef.current?.checkIfSteering()
    });

    /**
     * Steering Input check and axel rotation
     */
    wheelRefs.forEach((wheelRef) => {
      wheelRef.current?.castSpringRay(delta);
    });

    /**
     * Ray hit check and apply forces if hit
     * 
     * @todo CHECK THIS! Reset Force if not hit
     */
    wheelRefs.forEach((wheelRef) => {
      if (wheelRef.current?.checkIfRayHit()) {
        handleRayHit(delta, wheelRef);
      } else {
        body.current.resetForces(true);
      }
    });


    /**
     * Centre of mass debug world position update
     */
    updateComDebug();

    // console.log(delta);

    /**
     * END
     * 
     * Call At the end to update the arrows based on latest MUTATED dir
     */
    wheelRefs.forEach((wheelRef) => {
      wheelRef.current?.updateArrowHelpers();
    });

    wheelRefs.forEach((wheelRef) => {
      wheelRef.current?.updateRayArrows();
    });

    wheelRefs.forEach((wheelRef) => {
      wheelRef.current?.updateSuspensionArrowHelper();
    });
  });


  return (
  <group ref={meshGroup} position={[0, 0, 0]}>
    <group name="DebugArrows">
      {
        wheelRefs.map((wheelRef) => {
          return (
            <>
              <arrowHelper key={`wha-f-${wheelRef.current?.index}`} ref={wheelRef.current?.arrowFRef} />
              <arrowHelper key={`wha-u-${wheelRef.current?.index}`} ref={wheelRef.current?.arrowURef} />
              <arrowHelper key={`wha-r-${wheelRef.current?.index}`} ref={wheelRef.current?.arrowRRef} />
              <arrowHelper key={`wha-a-${wheelRef.current?.index}`} ref={wheelRef.current?.arrowARef} />
              <arrowHelper key={`wha-af-${wheelRef.current?.index}`} ref={wheelRef.current?.arrowAFRef} />
              <arrowHelper key={`wha-aray-${wheelRef.current?.index}`} ref={wheelRef.current?.arrowRay} />
              <arrowHelper key={`wha-asusf-${wheelRef.current?.index}`} ref={wheelRef.current?.arrowSF} />
            </>
          ); 
        })
      }
      <mesh ref={comDebug}>
          <boxGeometry args={[0.1, 0.1, 0.1]} />
          <meshStandardMaterial color="blue" />
      </mesh>
    </group>
    <group name="Vehicle" position={[0, 4, 0]} >
        <group name="Body">
          <RigidBody
            ref={body}
            canSleep={false}
            // type="kinematicPosition"
            linearDamping={LINEAR_DAMP}
            angularDamping={ANG_DAMP}
            position={[0, 0, 0]}
            colliders={false}
            friction={FRICTION}
            collisionGroups={interactionGroups(1, 0)}
          >
            <CuboidCollider
              args={[1/2, 0.2/2, 1.6/2]}
              position={chassisConfig.position}
              mass={MASS}
              collisionGroups={interactionGroups(1, 0)}
            >
              <mesh ref={bodyMesh} name="BodyM">
                <boxGeometry args={[1, 0.2, 1.6]} />
                <meshStandardMaterial color="lightgray" wireframe />
              </mesh>
            </CuboidCollider>

            {/* Sensor WheelPoints */}
            <group name="WheelPoints">
              {
                Object.keys(wheelsConfig).map((wheel, index) => {
                  return (
                    <CuboidCollider
                      ref={wheels[index]}
                      sensor
                      // density={0}
                      mass={0}
                      key={wheel}
                      position={wheelsConfig[wheel].position}
                      args={[0.02, 0.02, 0.02]}
                      collisionGroups={interactionGroups(1, 0)}
                    >
                      <Wheel
                        showRayDebug={rayDebug}
                        ref={wheelRefs[index]}
                        key={wheel}
                        index={index}
                        bodyRef={body}
                      />
                    </CuboidCollider>
                  );
                })
              }
            </group>
          </RigidBody>
        </group>
      </group>
  </group>
  )
}

export default Car;
