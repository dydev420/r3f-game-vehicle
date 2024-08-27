import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3 } from "three";
import { vec3 } from "@react-three/rapier";

/**
 * Debug Config
 */
const SHOW_CAMERA_DEBUG = true;

/**
 * DEFAULT Config
 */
const CAMERA_ARM_LENGTH = 4;
const CAMERA_ARM_HEIGHT = 2;
const CAMERA_ARM_OFFSET = 0;
const CAMERA_TARGET_OFFSET_Y = 0.4;
const CAMERA_LAG_POSITION = 0.01;
const CAMERA_LAG_TARGET = 0.001;

/**
 * @hook useFollowCamera
 * 
 * Return the Forward, Up, Right, Axel
 *
 */
const useFollowCamera = ({
  body,
  active
}) => {
  /**
   * Refs for Camera Smoothing
   */
  const smoothCameraPosition = useRef(new Vector3(8, 8, 8));
  const smoothCameraTarget = useRef(new Vector3(0, 1, 0));

  /**
   * Methods
   */
  const updateFollowPosition = (delta, camera) => {
    /**
     * Camera
     */
    const bodyPosition = vec3(body.current.translation());
    const cameraPosition = new Vector3();
    cameraPosition.copy(bodyPosition);
    cameraPosition.z += CAMERA_ARM_LENGTH;
    cameraPosition.y += CAMERA_ARM_HEIGHT;
    cameraPosition.x += CAMERA_ARM_OFFSET;;

    const cameraTarget = new Vector3();
    cameraTarget.copy(bodyPosition);
    cameraTarget.y += CAMERA_TARGET_OFFSET_Y;

    const lerpP = 1 - Math.pow(CAMERA_LAG_POSITION, delta);
    const lerpT = 1 - Math.pow(CAMERA_LAG_TARGET, delta);
    smoothCameraPosition.current.lerp(cameraPosition, lerpP);
    smoothCameraTarget.current.lerp(cameraTarget, lerpT);

    camera.position.copy(smoothCameraPosition.current);
    camera.lookAt(smoothCameraTarget.current);
  }

  /**
   * Copies the fVector input to camera forward ref
   */
  const setCameraForward = (fVector) => {
    console.log('???????~~~~setCameraForward~~~~TODO ~~~~~~?????');
    console.log('???????~~~~~~~~~Nothing Happens~~~~~~~~~~~?????');
  };
  

  /**
   * useEffect & useFrame
   */
  useEffect(() => {
    // Empty for now
  });

  useFrame((state, delta) => {
    /**
     * Camera Follow per frame
     */
    if(active) {
      updateFollowPosition(delta, state.camera);
    }
  });


  return {
    updateFollowPosition,
  };
};

export default useFollowCamera;
