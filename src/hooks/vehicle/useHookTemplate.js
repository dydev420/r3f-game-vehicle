import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3 } from "three";
import { vec3 } from "@react-three/rapier";


/**
 * @hook useHookTemplate
 * 
 * Return the Forward, Up, Right, Axel
 *
 */
const useHookTemplate = ({
  showRayDebug = true,
  body,
  bodyMesh,
  wheels
}) => {

  /**
   * Debug Values
   */
  const debugVector = new Vector3(0, 0, -1);

  /**
   * Methods
   */
  
  /**
   * Exposed to test if hook function calls are working
   */
  const debugCall = (initCall) => {
    if(initCall) {
      console.debug('useHookTemplate :: First Debug Call');
    }

    console.debug('Debug Call');
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
    debugCall,
  };
};

export default useHookTemplate;
