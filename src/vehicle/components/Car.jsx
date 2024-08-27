import { CuboidCollider, RigidBody, interactionGroups, quat, useRapier, vec3 } from "@react-three/rapier";
import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import { Vector3 } from "three";
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

import MustangFrame from "src/models/MustangFrame";
import Wheel from "src/vehicle/components/Wheel";
import useWheelStore from "src/vehicle/stores/useWheelStore";
import useKeysInput from "src/vehicle/hooks/useKeysInput";
import useSpeedCamera from "src/vehicle/hooks/useSpeedCamera";
import useGamepadInput from "src/vehicle/hooks/useGamepadInput";
import useCarStore from "src/vehicle/stores/useCarStore";
// import WheelVfx from "./WheelVfx";

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

function Car(props) {
  /**
   * Debug UI
   */
  const {rayDebug, directionDebug, followCamera, speedCamera } = useControls({
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

  const carForward = useCarStore(state => state.forwardDir);
  const updateCarForward = useCarStore(state => state.updateCarForward);
  const updateCarVelocity = useCarStore(state => state.updateVelocity);

  /**
   *  Required Hooks don't remove : Camera Hooks
   */
  // const { setCameraForward } = useFollowCamera({
  //   body,
  //   bodyMesh,
  //   active: followCamera
  // });

  /**
   *  Required Hooks don't remove : Camera Hooks
   */
  const { setCameraForward } = useSpeedCamera({
    body,
    bodyMesh,
    active: followCamera
  });

  /**
   * Required Hooks don't remove : Input Hook
   */
  const { inputAxis } = useKeysInput();

  useGamepadInput();

  /**
   * Drei Keyboard Input Hooks
   */
  const [ subscribeKeys, getKeys ] = useKeyboardControls();


  /**
   * Methods
   */

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
    wheelRef.current.applySuspensionForce(delta);
    
    wheelRef.current.applyGas(delta);

    wheelRef.current.applySteerForce(delta);
  }

  /**
   * Update Car store
   */
  const updateCarStoreValues = () => {
    // World Forward Vector
    let fVector = new Vector3(0, 0, -1);
    let bodyVel = vec3(body.current.linvel());
    let bodyRotation = quat(body.current.rotation());
    
    fVector.applyQuaternion(bodyRotation);
    fVector.normalize();
    
    updateCarForward(fVector);
    updateCarVelocity(bodyVel);
  }

  /**
   * UseEffect
   */
  useEffect(() => {
    console.log('---Car---');
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
        // body.current.resetForces(true);
      }
    });


    /**
     * Centre of mass debug world position update
     */
    updateComDebug();

    updateCarStoreValues(); 


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

    wheelRefs.forEach((wheelRef) => {
      wheelRef.current?.updateSteerForceArrowHelper();
    });
  });


  return (
  <group ref={meshGroup} position={ props.position || [0, 0, 0]}>
    {/* <group name="wheelEffects">
      {
        Object.keys(wheelsConfig).map((wheel, index) => {
          return (
            <WheelVfx index={index} position={wheelsConfig[wheel].position} />
          );
        })
      }
    </group> */}
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
              <arrowHelper key={`wha-asutf-${wheelRef.current?.index}`} ref={wheelRef.current?.arrowTF} />
            </>
          ); 
        })
      }
      <mesh ref={comDebug}>
          <boxGeometry args={[0.1, 0.1, 0.1]} />
          <meshStandardMaterial color="blue" />
      </mesh>
    </group>
    <group name="Vehicle" position={props.spawnPosition || [0, 4, 0]} >
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
            // restitution={0.5}
            collisionGroups={interactionGroups(1, 0)}
          >
            <CuboidCollider
              args={[1.2/2, 0.2/2, 3/2]}
              position={chassisConfig.position}
              mass={MASS}
              collisionGroups={interactionGroups(1, 0)}
            >
              <mesh ref={bodyMesh} name="BodyM">
                <boxGeometry args={[1.2, 0.2, 3]} />
                <meshStandardMaterial color="lightgray" wireframe />
              </mesh>
            </CuboidCollider>

            <MustangFrame position={chassisConfig.position} rotation={[0, -Math.PI, 0]} />

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
