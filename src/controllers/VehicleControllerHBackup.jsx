import { CapsuleCollider, CuboidCollider, CylinderCollider, RigidBody, interactionGroups, quat, useRapier, useRevoluteJoint, vec3 } from "@react-three/rapier";
import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Line, useKeyboardControls } from "@react-three/drei";
import { Color, Euler, Quaternion, Vector3 } from "three";
import { useControls } from "leva";

import useAnimState from "../stores/useAnimState";

/**
 * Debug Config
 */
const ENABLE_RAY_DEBUG = false;
const ENABLE_DIRECTION_DEBUG = false;
const DEBUG_IMPULSE = 2;

/**
 * RigidBody Props
 */
const LINEAR_DAMP = 0.6;
const ANG_DAMP = 0.8;
const MASS = 1;
const FRICTION = 0;

/**
 * Suspension Height Config
 */
const REST_HEIGHT = 0.4;
const MAX_STRETCH = 0.1;

/**
 * Spring Config
 */
const SPRING_SCALE = 0.1;
const SPRING_STRENGTH = 30;
const SPRING_DAMPING = 10;

/**
 * Steer Config
 */
const STEER_SCALE = 0.1;
const TIRE_GRIP = 0.1;
const TIRE_MASS = 0.1;
const TIRE_TIME_MULTIPLIER = 100000;

/**
 * Car Config
 */
const ACC_SCALE = 1;
const ACC_FORWARD = 0.4;
const ACC_REVERSE = 0.6;
const MAX_SPEED = 1;

/**
 * Wheels Config
 */
const wheelsConfig = {
  fl: {
    position: [-0.5, 0.1, -0.5],
  },
  fr: {
    position: [0.5, 0.1, -0.5],
  },
  bl: {
    position: [-0.5, 0.1, 0.5],
  },
  br: {
    position: [0.5, 0.1, 0.5],
  },
}

/**
 * Chassis Config
 */
const chassisConfig = {
  position: [0, 0.2, 0],
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
   * Direction Vectors
   */
  const forwardVector = new Vector3(0, 0, -1);
  const axelVector = new Vector3(1, 0, 0);
  const upVector = new Vector3(0, 1, 0);

  /**
   * Debug Arrows
   */
  const arrowFRef = useRef();
  const arrowARef = useRef();
  const arrowURef = useRef();

  /**
   * Meshes and Rigid Bodies
   */
  const body = useRef();
  const bodyMesh = useRef();
  const meshGroup = useRef();

  /**
   * Wheels
   */
  const wheels = [
    useRef(),
    useRef(),
    useRef(),
    useRef(),
  ];

  const [ subscribeKeys, getKeys ] = useKeyboardControls();
  const { rapier, world } = useRapier();

  const [smoothCameraPosition] = useState(() => new Vector3(10, 10 , 10));
  const [smoothCameraTarget] = useState(() => new Vector3());

  // Anim Store
  const { animState, setAnimState } = useAnimState((state) => ({
    animState: state.animState,
    setAnimState: state.setAnimState
  }));

  const updateArrowHelpers = () => {
    const bodyPos = vec3(body.current.translation());
    const wheelFRPos = vec3(wheels[1].current.translation());

    /**
     * Forward Arrow
     */
    if(showRayDebug) {
      // Forward Arrow
      arrowFRef.current.setDirection(forwardVector);
      arrowFRef.current.setColor('#ff3333');
      arrowFRef.current.setLength(2);
      arrowFRef.current.position.copy(bodyPos);
    }

    /**
     * Axel Arrow
     */
    if(showRayDebug) {
      arrowARef.current.setDirection(axelVector);
      arrowARef.current.setColor('#ff33ff');
      arrowARef.current.setLength(1);
      arrowARef.current.position.copy(wheelFRPos);
      // arrowARef.current.position.copy(bodyPos);
    }

    /**
     * Up Arrow
     */
    if(showRayDebug) {
      arrowURef.current.setDirection(upVector);
      arrowURef.current.setColor('#33ffff');
      arrowURef.current.setLength(1);
      arrowURef.current.position.copy(bodyPos);
    }
  }

  const setForwardVector = () => {
    // World Forward Vector
    let fVector = new Vector3();
    fVector = bodyMesh.current.getWorldDirection(fVector);
    fVector.negate();
    
    forwardVector.copy(fVector);
  }
  
  const setAxelVector = () => {
    const [wheelFL, wheelFR] = wheels;

    const wheelFLPos = vec3(wheelFL.current.translation());
    const wheelFRPos = vec3(wheelFR.current.translation());

    axelVector.copy(wheelFRPos.clone().sub(wheelFLPos));
  }

  /**
   * Rotates the axelVector and forwardVector
   */
  const rotateDriveVectors = (turn) => {
    const rotateAxis = upVector.clone().normalize();
    const rotateAngle = turn * (Math.PI / 6);
    const rotatedAxel = axelVector.clone().applyAxisAngle(rotateAxis, rotateAngle);
    const rotatedForward = forwardVector.clone().applyAxisAngle(rotateAxis, rotateAngle);
    
    axelVector.copy(rotatedAxel);
    forwardVector.copy(rotatedForward);
  }
  
  const setUpVector = () => {
    const v1 = axelVector.clone();
    const v2 = forwardVector.clone(); 

    const up = v1.cross(v2);

    upVector.copy(up);
  }

  const setDirVectors = () => {
    setForwardVector();
    setAxelVector();
    setUpVector();
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
   * Suspension Spring Force
   */
  const suspensionSpringForce = (delta, offSet, point) => {
    const springDir = upVector.clone();
    // springDir.negate();
    const linvel = body.current.linvel();
    const tireWorldVel = vec3(linvel);

    const springDotVel = springDir.clone().dot(tireWorldVel);
    const springP = offSet * SPRING_STRENGTH * delta;
    const springD = springDotVel * SPRING_DAMPING * delta;
    const springF = springP - springD;

    const suspensionForce = springDir.clone().multiplyScalar(springF * SPRING_SCALE);


    body.current.addForceAtPoint(suspensionForce , point, true);
  }

  /**
   * Suspension Raycast
   */
  const suspensionRaycast = (delta) => {
    console.log('~~~~~~~Suspension Cast');
    wheels.forEach((wheelRef, index) => {
      const wheelPos = vec3(wheelRef.current.translation());
      let offset = 0;
      
      const origin = wheelPos.clone();
      origin.y -= 0.1;

      const direction = upVector.clone();
      direction.negate();
      const ray = new rapier.Ray(origin, direction);
      const hit = world.castRay(ray, 10);
      
      if(hit?.toi < REST_HEIGHT + MAX_STRETCH) {
        const toi = hit.toi;
        const hitPoint = ray.pointAt(toi);
        
        console.log('HIT POINTS:: with toi - ', toi);
        console.log(hitPoint);

        offset = REST_HEIGHT - toi;

        // steerAxel(delta);
        suspensionSpringForce(delta, offset, wheelPos);
      }
    });
  }

  /**
   * Jump Debug Impulse
   */
  const jump = () => {
    body.current.applyImpulse({x: 0, y: DEBUG_IMPULSE, z: 0}, true);
  }

  const reset = () => {
    body.current.setTranslation({ x: 0, y: 1, z: 0});
    body.current.setLinvel({ x: 0, y: 1, z: 0});
    body.current.setAngvel({ x: 0, y: 1, z: 0});
  }

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

    return () => {
      unsubscribeJump();
    };
  }, []);

  /**
   * UseFrame
   */
  useFrame((state, delta) => {
    /**
     * Controls
     */
    const {
      forward,
      backward,
      leftward,
      rightward,
    } = getKeys();

    /**
     * Update All Direction Vectors and their Debug
     */
    setDirVectors();
    
    /**
     * Get Body Position and Rotation
     */
    const bodyPosition = body.current.translation();
    const bodyRotation = body.current.rotation();
    
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

    /**
     * Suspension System Calls
     */
    suspensionRaycast(delta);

    /**
     * Steering input turn
     */
    if(turnMultiplier) {
      rotateDriveVectors(turnMultiplier);
    }

    /**
     * Main Movement Force Logic
     */
    const linvel = body.current.linvel();

    const [wheelFL, wheelFR] = wheels;
    const wheelFLPos = vec3(wheelFL.current.translation());
    const wheelFRPos = vec3(wheelFR.current.translation());
    const wheelFMidPos = wheelFLPos.lerp(wheelFRPos, 0.5);
    
    const forwardDir = forwardVector.clone();
    const reverseDir = forwardVector.clone().negate();
    const forwardSpeed = forwardDir.dot(vec3(linvel));
    const reverseSpeed = reverseDir.dot(vec3(linvel));

    const normalizedSpeed = forwardSpeed / MAX_SPEED ;
    const canAccelerate = forwardSpeed < MAX_SPEED;
    const canBrake = reverseSpeed < MAX_SPEED;

    // Boost acceleration when input is opposite of velocity
    const shouldBoostMultiplier = forceMultiplier * forwardSpeed < 0;

    if(shouldBoostMultiplier) {
      forceMultiplier *= 2 * Math.abs(normalizedSpeed);

      console.log('Boosting', forceMultiplier);
    }

    // Acceleration
    if(forceMultiplier > 0 && canAccelerate) {
      const accStrength = ACC_FORWARD * ACC_SCALE * forceMultiplier * delta;

      const force = forwardVector.clone().multiplyScalar(accStrength);

      // body.current.addForce(force, true);
      body.current.addForceAtPoint(force, wheelFMidPos, true);

    }
    
    // Reverse / Brake
    if(forceMultiplier < 0 && canBrake) {
      const brakeStrength = ACC_REVERSE * ACC_SCALE * forceMultiplier  * delta;

      const force = forwardVector.clone().multiplyScalar(brakeStrength);

      body.current.addForce(force, true);
    }


    /**
     * Update Arrow POsitions and directions
     */
    updateArrowHelpers();
    

    /**
     * Camera
     */
    const cameraPosition = new Vector3();
    cameraPosition.copy(bodyPosition);
    cameraPosition.z += 8;
    cameraPosition.y += 8;
    cameraPosition.x += 8;

    const cameraTarget = new Vector3();
    cameraTarget.copy(bodyPosition);
    cameraTarget.y += 0.4;

    const lerpCP = 1 - Math.pow(0.1, delta);
    const lerpCT = 1 - Math.pow(0.001, delta);

    smoothCameraPosition.lerp(cameraPosition, lerpCP);
    smoothCameraTarget.lerp(cameraTarget, lerpCT);

    // state.camera.position.copy(smoothCameraPosition);
    // state.camera.lookAt(smoothCameraTarget);
  });

  return (
    <group ref={meshGroup} position={[0, 1, 0]}>
      {
        showDirectionDebug && (
          <group name="Direction Line">
            {/* Debug Arrow Direction */}
            <arrowHelper ref={arrowFRef} args={[ forwardVector ]} />
            <arrowHelper ref={arrowARef} args={[ axelVector ]} />
            <arrowHelper ref={arrowURef} args={[ upVector ]} />
          </group>
        )
      }

      {
        showRayDebug && (
          <group name="Direction Line">
            {/* Debug Arrow Direction */}
            <arrowHelper ref={arrowFRef} args={[ forwardVector ]} />
            <arrowHelper ref={arrowARef} args={[ axelVector ]} />
            <arrowHelper ref={arrowURef} args={[ upVector ]} />
          </group>
        )
      }
      
      <group name="Vehicle" >
        <group name="Body">
          <RigidBody
            ref={body}
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
                    >
                      {/* <mesh key={wheel} name={wheel} position={[0, 0, 0]}>
                        <sphereGeometry args={[0.2]} />
                        <meshStandardMaterial color="black" />
                      </mesh> */}
                    </CuboidCollider>

                  )
                })
              }
            </group>         
          </RigidBody>
        </group>
      </group>
    </group>
  )
}

export default VehicleController;
