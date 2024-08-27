import { CapsuleCollider, CuboidCollider, CylinderCollider, RigidBody, interactionGroups, quat, useRapier, useRevoluteJoint, vec3 } from "@react-three/rapier";
import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Line, useKeyboardControls } from "@react-three/drei";
import { Color, Euler, Quaternion, Vector3 } from "three";
import { useControls } from "leva";

import useAnimState from "../stores/useAnimState";
import useDirectionVectors from "../hooks/vehicle/useDirectionVectors";
import useSuspension from "../hooks/vehicle/useSuspension";
import useSteering from "../hooks/vehicle/useSteering";
import useGas from "../hooks/vehicle/useGas";
import useFollowCamera from "../hooks/vehicle/useFollowCamera";
import useWheelHelper from "../hooks/vehicleHelpers/useWheelHelper";
import useSuspensionHelper from "../hooks/vehicleHelpers/useSuspensionHelper";
import Wheel from "../components/Wheel";

/**
 * Debug Config
 */
const ENABLE_RAY_DEBUG = true;
const ENABLE_DIRECTION_DEBUG = true;
const DEBUG_IMPULSE = 2;
const RESET_POINT_HEIGHT = 1;

/**
 * RigidBody Props
 */
const LINEAR_DAMP = 0.9;
const ANG_DAMP = 0.9;
const MASS = 1;
const FRICTION = 0;


/**
 * DUPLICATE
 * from useSuspension
 */
const REST_HEIGHT = 0.4;
const MAX_TRAVEL = 0.2;


/**
 * Wheels Config
 */
const wheelsConfig = {
  fl: {
    position: [-0.5, REST_HEIGHT - MAX_TRAVEL / 4, -0.5],
  },
  fr: {
    position: [0.5, REST_HEIGHT - MAX_TRAVEL / 4, -0.5],
  },
  bl: {
    position: [-0.5, REST_HEIGHT - MAX_TRAVEL / 4, 0.5],
  },
  br: {
    position: [0.5, REST_HEIGHT - MAX_TRAVEL / 4, 0.5],
  },
}

/**
 * Chassis Config
 */
const chassisConfig = {
  position: [0, REST_HEIGHT - MAX_TRAVEL / 4, 0],
  centreOfMass: [0, -0.1, 0]
}

/**
 * Vehicle Controller to handle Raycast based car Physics.
 * Each wheel casts a ray towards the down direction of RigidBody
 * 
 * @todo Spring Suspension
 * @todo Turning
 * @todo Boosted Acceleration
 * @todo Drag and Drift
 * 
 * @returns Component
 */

function VehicleController() {
  /**
   * Debug UI
   */
  const { showRayDebug, showDirectionDebug } = useControls({
    showRayDebug: { value: ENABLE_RAY_DEBUG },
    showDirectionDebug: { value: ENABLE_DIRECTION_DEBUG }
  });

  /**
   * Meshes and Rigid Bodies
   */
  const body = useRef();
  const bodyMesh = useRef();
  const meshGroup = useRef();
  
  /**
   * Physics api and world
   */
  const { rapier, world } = useRapier();

  /**
   * Wheels
   */
  const wheels = [
    useRef(),
    useRef(),
    useRef(),
    useRef(),
  ];

  /**
   * Direction Vectors
   * 
   * ArrowsRef
   */
  const {
    forwardVector,
    upVector,
    rightVector,
    axelVector,
    arrowFRef,
    arrowURef,
    arrowARef,
    updateArrowHelpers,
  } = useDirectionVectors({
    showDirectionDebug,
    body,
    bodyMesh,
    wheels
  });

  /**
   * Steer System
   */
  const {
    steerAxel,
    rotateAxelPlane,
  } = useSteering({
    showDirectionDebug,
    body,
    forwardVector,
    upVector,
    rightVector,
    axelVector,
    wheels
  });

  /**
   * Suspension System
   */
  const {
    hits,
    suspensionForces,
    suspensionRaycast,
  } = useSuspension({
    showRayDebug,
    rapier,
    world,
    body,
    upVector,
    rightVector,
    wheels,
    steerAxel
  });

  /**
   * Gas System
   */
  const {
    applyGas,
  } = useGas({
    showRayDebug,
    body,
    forwardVector,
    wheels
  });

  /**
   * Helper Hooks
   */
  const {
    arrowFL,
    arrowFR,
    arrowBL,
    arrowBR,
    wheelHelpers,
    updateWheelHelpers,
  } = useWheelHelper({
    showRayDebug: false,
    wheels,
    hits,
  });

  const {
    suspensionHelpers,
    updateSuspensionHelpers
  } = useSuspensionHelper({
    showRayDebug,
    suspensionForces,
  });

  /**
   * Camera Hooks
  */
 const {
   setCameraForward,
  } = useFollowCamera({
    showRayDebug,
    body, 
  });

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
    body.current.applyImpulse({x: 0, y: DEBUG_IMPULSE * MASS, z: 0}, true);
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

  const getInputMultiplier = () => {
    const {
      forward,
      backward,
      leftward,
      rightward,
    } = getKeys();
    
    let forceMultiplier = 0;
    let turnMultiplier = 0;

    if(forward) {
      forceMultiplier += 1;
    }

    if(backward) {
      forceMultiplier += -1;
    }

    if(leftward) {
      turnMultiplier += 1;
    }

    if(rightward) {
      turnMultiplier += -1;
    }

    return {
      forceMultiplier,
      turnMultiplier
    }
  };

  /**
   * UseEffect
   */
  useEffect(() => {
    const unsubscribeJump =  subscribeKeys(
      // Selector
      (state) => state.jump,
      // Listener
      (value) => {
        if(value) {
          jump();
        }
      }
    );

    const unsubscribeDebugEnd =  subscribeKeys(
      // Selector
      (state) => state.debugEnd,
      // Listener
      (value) => {
        if(value) {
          reset();
        }
      }
    );

    return () => {
      unsubscribeJump();
    };
  }, []);

  /**
   * UseFrame
   */
  useFrame((state, delta) => {
    /**
     * Input Axis
     */
    const { forceMultiplier, turnMultiplier } = getInputMultiplier();

    /**
     * Suspension System Calls
     */
    suspensionRaycast(delta);

    /**
     * Steering input turn
     */
    if(turnMultiplier) {
      rotateAxelPlane(turnMultiplier);
    }
    
    /**
     * Main Movement Force Logic
     */
    applyGas(delta, forceMultiplier);

    /**
     * Update Arrow Helper Positions and directions
     */
    updateArrowHelpers();
    updateWheelHelpers();
    updateSuspensionHelpers();
  });


  return (
  <group ref={meshGroup} position={[0, 0, 0]}>
    <group name="Wrapper">
      {
        showDirectionDebug && (
          <group name="Direction Lines">
            {/* Debug Arrow Direction Vector */}
            <arrowHelper ref={arrowFRef} />
            <arrowHelper ref={arrowARef} />
            <arrowHelper ref={arrowURef} />
          </group>
        )
      }

      {
        // showRayDebug && (
        //   <group name="Raycast Lines">
        //     {/* Debug Raycast Vector */}
        //     {
        //       wheelHelpers.map((helper, index) => (
        //         <arrowHelper key={`wah-${index}`} ref={helper} args={[ ]} />
        //       ))
        //     }
        //   </group>
        // )
      }

      {
        showRayDebug && (
          <group name="Suspension Forces">
            {/* Debug Suspension Force Vector */}
            {
              suspensionHelpers.map((helper, index) => (
                <arrowHelper key={`wsh-${index}`} ref={helper} args={[ ]} />
              ))
            }
          </group>
        )
      }
      
      <group name="Vehicle" >
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
              args={[1/2, 0.3/2, 1.6/2]}
              position={chassisConfig.position}
              mass={MASS}
              collisionGroups={interactionGroups(1, 0)}
            >
              <mesh ref={bodyMesh} name="BodyM">
                <boxGeometry args={[1, 0.3, 1.6]} />
                <meshStandardMaterial color="lightgray" />
              </mesh>
            </CuboidCollider>

            {/* Debug WheelPoint */}
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
                    />
                  );
                })
              }
            </group>

            <group name="WheelMeshGroup">
              {
                Object.keys(wheelsConfig).map((wheel, index) => {
                  return (
                    <Wheel
                      key={wheel}
                      index={index}
                      initialPosition={wheelsConfig[wheel].position}
                      forwardVector={forwardVector}
                      axelVector={axelVector}
                      hits={hits}
                    />
                  );
                })
              }
            </group>         
          </RigidBody>
        </group>
      </group>
    </group>
  </group>
  )
}

export default VehicleController;
