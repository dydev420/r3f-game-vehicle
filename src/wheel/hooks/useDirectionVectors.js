import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3 } from "three";
import { vec3 } from "@react-three/rapier";
import useWheelStore from "../stores/useWheelStore";



/**
 * @hook useDirectionVectors
 * 
 * Car Forward, Up, Right, Axel
 *
 */
const useDirectionVectors = ({
  showRayDebug = true,
  body,
  bodyMesh,
}) => {
  /**
   * Wheels
   */
  const wheels = useWheelStore((state) => state.wheels);

  /**
   * Direction Vectors
   */
  const forwardVector = useRef(new Vector3(0, 0, -1));
  const upVector = useRef(new Vector3(0, 1, 0));
  const rightVector = useRef(new Vector3(1, 0, 0));
  const axelVector = useRef(new Vector3(1, 0, 0));

  /**
   * Debug Arrows
   */
  const arrowFRef = useRef();
  const arrowARef = useRef();
  const arrowURef = useRef();


  /**
   * Methods
   */
  const updateArrowHelpers = () => {
    const bodyPos = vec3(body.current.translation());
    const wheelFRPos = vec3(wheels[1].current.translation());

    /**
     * Forward Arrow
     */
    if(showRayDebug && arrowFRef?.current) {
      // Forward Arrow
      arrowFRef.current.setDirection(forwardVector.current);
      arrowFRef.current.setColor('#ff3333');
      arrowFRef.current.setLength(1.5);
      arrowFRef.current.position.copy(bodyPos);
    }

    /**
     * Axel Arrow
     */
    if(showRayDebug && arrowARef?.current) {
      arrowARef.current.setDirection(axelVector.current);
      arrowARef.current.setColor('#ff33ff');
      arrowARef.current.setLength(1);
      arrowARef.current.position.copy(wheelFRPos);
    }

    /**
     * Up Arrow
     */
    if(showRayDebug  && arrowURef?.current) {
      arrowURef.current.setDirection(upVector.current);
      arrowURef.current.setColor('#33ffff');
      arrowURef.current.setLength(1);
      arrowURef.current.position.copy(bodyPos);
    }
  };

  const setForwardVector = () => {
    // World Forward Vector
    let fVector = new Vector3();
    fVector = bodyMesh.current.getWorldDirection(fVector);
    fVector.negate();
    
    forwardVector.current.copy(fVector);
  };

  const setUpVector = () => {
    const v1 = axelVector.current.clone();
    const v2 = forwardVector.current.clone(); 

    const up = v1.cross(v2);

    upVector.current.copy(up);
  };
  
  /**
   * **Extras
   * 
   * No debug arrow for this vector
   */
  const setRightVector = () => {
    const [wheelFL, wheelFR] = wheels;

    const wheelFLPos = vec3(wheelFL.current.translation());
    const wheelFRPos = vec3(wheelFR.current.translation());

    rightVector.current.copy(wheelFRPos.clone().sub(wheelFLPos));
  }
  
  const setAxelVector = () => {
    const [wheelFL, wheelFR] = wheels;

    const wheelFLPos = vec3(wheelFL.current.translation());
    const wheelFRPos = vec3(wheelFR.current.translation());

    axelVector.current.copy(wheelFRPos.clone().sub(wheelFLPos));
  }

  /**
   * Update the Forward vector to direction and call update for all directions
   * 
   * @todo FIX IT!
   * BUGGY. The Axel Vector not updated and Up vector is weird
   */
  const setForwardDirection = (fVector) => {
    forwardVector.current.copy(fVector);

    setRightVector();
    setAxelVector();
    setUpVector();
  }

  /**
   * Updates all direction vectors
   */
  const setDirVectors = () => {
    setForwardVector();
    setRightVector();
    setAxelVector();
    setUpVector();
  }

  /**
   * useEffect & useFrame
   */
  useEffect(() => {
    // Empty for now
    console.log('useDirectionVectors');
  });

  useFrame(() => {
    /**
     * Update All Direction Vectors and their Debug
     */
    setDirVectors();

     /**
     * Update Arrow POsitions and directions
     */
     updateArrowHelpers();
  });


  return {
    forwardVector,
    upVector,
    rightVector,
    axelVector,
    arrowFRef,
    arrowURef,
    arrowARef,
    updateArrowHelpers,
  };
};

export default useDirectionVectors;
