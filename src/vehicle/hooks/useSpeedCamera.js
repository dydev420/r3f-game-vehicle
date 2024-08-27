import { useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import { vec3 } from "@react-three/rapier";
import { DEFAULT_FORWARD } from "src/vehicle/utils/constants";

/**
 * Debug Config
 */
const SHOW_CAMERA_DEBUG = true;

/**
 * DEFAULT Config
 */
const CAMERA_ARM_LENGTH = 3;
const CAMERA_ARM_HEIGHT = 1.5;
const CAMERA_ARM_OFFSET = 0;
const CAMERA_TARGET_OFFSET_Y = 0.4;
const CAMERA_LAG_POSITION = 0.001;
const CAMERA_LAG_TARGET = 0.001;
const CAMERA_ENABLE_LAG = true;

/**
 * @hook useFollowCamera
 * 
 * Return the Forward, Up, Right, Axel
 *
 */
const useSpeedCamera = ({
  body,
  bodyMesh,
  active
}) => {
  /**
   * Refs for Camera Smoothing
   */
  const smoothCameraPosition = useRef(new Vector3(8, 8, 8));
  const smoothCameraTarget = useRef(new Vector3(0, 1, 0));

  /**
   * Camera Direction Vector
   */
  const cameraForward = useRef(new Vector3(0, 0, -1));

  /**
   * THREE JS Hooks for camera
   */
  const camera = useThree((state) => state.camera);
  console.log(camera);

  /**
   * Methods
   */
  const setCameraFov = () => {
    camera.fov = 60;
    camera.updateProjectionMatrix();
  }

  const setDefaultForward = () => {
    
    
  }

  const setCameraForward = () => {
    // World Forward Vector
    let fVector = new Vector3();
    fVector = bodyMesh.current.getWorldDirection(fVector);
    fVector.negate();

    const bodyVel = vec3(body.current.linvel());
    const moveVel = fVector.clone();
    const gg = moveVel.dot(bodyVel);

    if(Math.abs(gg) < 0.02) {
      cameraForward.current.copy(fVector);
    } else {
      bodyVel.normalize();
      cameraForward.current.copy(bodyVel);
    }
  };

  const updateFollowPosition = (delta, camera) => {
    /**
     * Camera
     */
    const bodyPosition = vec3(body.current.translation());
   

    const cameraBehindVector = cameraForward.current.clone().negate();
    cameraBehindVector.multiplyScalar(CAMERA_ARM_LENGTH);
    const cameraPosition = new Vector3();
    cameraPosition.copy(bodyPosition);
    cameraPosition.y += CAMERA_ARM_HEIGHT;

   cameraPosition.add(cameraBehindVector);

    const cameraTarget = new Vector3();
    cameraTarget.copy(bodyPosition);

    cameraTarget.add(cameraForward.current);

    cameraTarget.y += CAMERA_TARGET_OFFSET_Y;

    let lerpP = 1;
    let lerpT = 1;
    
    if(CAMERA_ENABLE_LAG) {
      lerpP = 1 - Math.pow(CAMERA_LAG_POSITION, delta);
      lerpT = 1 - Math.pow(CAMERA_LAG_TARGET, delta);
    }

    smoothCameraPosition.current.lerp(cameraPosition, lerpP);
    smoothCameraTarget.current.lerp(cameraTarget, lerpT);

    camera.position.copy(smoothCameraPosition.current);
    camera.lookAt(smoothCameraTarget.current);
  }
  

  /**
   * useEffect & useFrame
   */
  useEffect(() => {
    // Empty for now
    setCameraFov();
  }, []);

  useFrame((state, delta) => {
    /**
     * Camera Follow per frame
     */
     setCameraForward();

    if(active) {
      updateFollowPosition(delta, state.camera);
    }
  });


  return {
    updateFollowPosition,
  };
};

export default useSpeedCamera;
