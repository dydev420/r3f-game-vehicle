import { CapsuleCollider, CuboidCollider, CylinderCollider, RigidBody, interactionGroups, useRapier, useRevoluteJoint } from "@react-three/rapier";
import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import { Vector3 } from "three";


import useGame from "../stores/useGame";
import useAnimState from "../stores/useAnimState";

const MOVEMENT_SPEED = 2.2;
const MAX_VEL = 5;
const RUN_VEL = 1.5;
const WALK_VEL = 0.1;

const wheelsConfig= {
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

function VehicleWheel() {
  const body = useRef();

  const wheels = useRef();
  const wheelFL = useRef();
  const wheelFR = useRef();
  const wheelBL = useRef();
  const wheelBR = useRef();

  const jointFL = useRevoluteJoint(body, wheelFL, [
    // Position of the joint in bodyA's local space
    wheelsConfig.fl.position,
    // Position of the joint in bodyB's local space
    wheelsConfig.fl.position,
    // Axis of the joint, in local space
    [1, 0, 0]
  ]);

  const jointFR = useRevoluteJoint(body, wheelFR, [
    wheelsConfig.fr.position,
    wheelsConfig.fr.position,
    [1, 0, 0]
  ]);

  const jointBL = useRevoluteJoint(body, wheelBL, [
    wheelsConfig.bl.position,
    wheelsConfig.bl.position,
    [1, 0, 0]
  ]);

  const jointBR = useRevoluteJoint(body, wheelBR, [
    wheelsConfig.br.position,
    wheelsConfig.br.position,
    [1, 0, 0]
  ]);

  const model = useRef();
  const meshGroup = useRef();
  const [ subscribeKeys, getKeys ] = useKeyboardControls();
  const { rapier, world } = useRapier();

  const [smoothCameraPosition] = useState(() => new Vector3(10, 10 , 10));
  const [smoothCameraTarget] = useState(() => new Vector3());

  // Anim Store
  const { animState, setAnimState } = useAnimState((state) => ({
    animState: state.animState,
    setAnimState: state.setAnimState
  }));

  // Game Store
  const start = useGame((state) => state.start);
  const end = useGame((state) => state.end);
  const restart = useGame((state) => state.restart);
  const blocksCount = useGame((state) => state.blocksCount);

  const driveWheels = () => {
    // Apply torque on wheels here
  }

  const jump = () => {
    const jumpStrength = 0.5;
    
    const origin = body.current.translation();
    origin.y -= 0.31;

    const direction = { x: 0, y: -1, z:0 };
    const ray = new rapier.Ray(origin, direction);
    const hit = world.castRay(ray, 10, true);

    if(hit.toi < 0.15) {
      body.current.applyImpulse({ x: 0, y: jumpStrength, z: 0});
    }
  }

  const reset = () => {
    body.current.setTranslation({ x: 0, y: 1, z: 0});
    body.current.setLinvel({ x: 0, y: 1, z: 0});
    body.current.setAngvel({ x: 0, y: 1, z: 0});
  }

  useEffect(() => {
    const unsubscribeReset= useGame.subscribe(
      (state) => state.phase,
      (value) => {
        if(value === 'ready') {
          reset();
        }
      }
    );

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

    const unsubscribeAny =  subscribeKeys(() => {
      start();
    });

    return () => {
      unsubscribeReset();
      unsubscribeJump();
      unsubscribeAny();
    };
  }, []);

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

    const impulse = { x: 0, y: 0, z: 0};
    const torque = { x: 0, y: 0, z: 0};

    let changeRotation = false;

    const impulseStrength = MOVEMENT_SPEED * delta;
    const torqueStrength = MOVEMENT_SPEED * delta;

    
    const linvel = body.current.linvel();

    if(forward && linvel.z >  -MAX_VEL) {
      impulse.z -= impulseStrength;
    }
    
    if(backward && linvel.z <  MAX_VEL) {
      impulse.z += impulseStrength;
      changeRotation = true;
    }

    if(leftward && linvel.x >  -MAX_VEL) {
      impulse.x -= impulseStrength;
      changeRotation = true;

      // Remove
      torque.y += torqueStrength;
    }

    if(rightward && linvel.x <  MAX_VEL) {
      impulse.x += impulseStrength;
      changeRotation = true;

      // Remove
      torque.y -= torqueStrength;

    }

    body.current.applyImpulse(impulse, true);

    // Remove
    body.current.applyTorqueImpulse(torque, true);


    if(Math.abs(linvel.x) > RUN_VEL || Math.abs(linvel.z) > RUN_VEL) {
      if(animState !== 'Run') {
        setAnimState('Run');
      }

    } else if(Math.abs(linvel.x) > WALK_VEL || Math.abs(linvel.z) > WALK_VEL) {
      if(animState !== 'Walk') {
        setAnimState('Walk');
      }

    } else {
      if(animState !== 'Idle') {
        setAnimState('Idle');
      }
    }

    // if(changeRotation) {
    //   const angle = Math.atan2(-linvel.x, -linvel.z)
    //   meshGroup.current.rotation.y = angle;
    // }

    /**
     * Get Body Position
     */
    const bodyPosition = body.current.translation();

    /**
     * Camera
     */
    const cameraPosition = new Vector3();
    cameraPosition.copy(bodyPosition);
    cameraPosition.z += 3.25;
    cameraPosition.y += 0.8;

    const cameraTarget = new Vector3();
    cameraTarget.copy(bodyPosition);
    cameraTarget.y += 0.4;

    const lerpT = 1 - Math.pow(0.001, delta);

    smoothCameraPosition.lerp(cameraPosition, lerpT);
    smoothCameraTarget.lerp(cameraTarget, lerpT);

    state.camera.position.copy(smoothCameraPosition);
    state.camera.lookAt(smoothCameraTarget);

    /**
     * Game Phases
     */
    if(bodyPosition.z < -(blocksCount * 4 + 2)) {
      end();
    }

    if(bodyPosition.y < -4) {
      restart();
    }
  });

  return (
    <>
      <group ref={meshGroup} position={[0, 1, 0]}>
        <group name="Vehicle" ref={model} >
          <group name="Body">
            <RigidBody
              ref={body}
              friction={1}
              collisionGroups={interactionGroups(1, 0)}
            >
              <mesh name="BodyM" position={[0, 0.3, 0]}>
                <boxGeometry args={[0.8, 0.3, 1.6]} />
                <meshStandardMaterial color="lightgray" />
              </mesh>
            </RigidBody>
          </group>

          <group name="Wheels" ref={wheels}>
            <RigidBody ref={wheelFL} colliders="ball" collisionGroups={interactionGroups(1, 0)}>
              <mesh name="WFrontL"  position={wheelsConfig.fl.position} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.2, 0.2, 0.1]} />
                <meshStandardMaterial color="blue" />
              </mesh>
            </RigidBody>

            <RigidBody  ref={wheelFR} colliders="ball" collisionGroups={interactionGroups(1, 0)}>
              <mesh name="WFrontR" position={wheelsConfig.fr.position} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.2, 0.2, 0.1]} />
                <meshStandardMaterial color="red" />
              </mesh>
            </RigidBody>

            <RigidBody ref={wheelBL} colliders="ball" collisionGroups={interactionGroups(1, 0)}>
              <mesh name="WBackL"  position={wheelsConfig.bl.position} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.2, 0.2, 0.1]} />
                <meshStandardMaterial color="aqua" />
              </mesh>
            </RigidBody>

            <RigidBody ref={wheelBR} colliders="ball" collisionGroups={interactionGroups(1, 0)}>
              <mesh name="WBackR"  position={wheelsConfig.br.position} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.2, 0.2, 0.1]} />
                <meshStandardMaterial color="orange" />
              </mesh>   
            </RigidBody>
          </group>
        </group>
      </group>
    </>
  )
}

export default VehicleWheel;
