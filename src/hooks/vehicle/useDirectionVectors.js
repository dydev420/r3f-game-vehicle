import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3 } from "three";
import { vec3 } from "@react-three/rapier";



/**
 * @hook useDirectionVectors
 * 
 * Return the Forward, Up, Right, Axel
 *
 */
const useDirectionVectors = ({
  showRayDebug = true,
  body,
  bodyMesh,
  wheels
}) => {
  /**
   * Direction Vectors
   */
  const forwardVector = new Vector3(0, 0, -1);
  const upVector = new Vector3(0, 1, 0);
  const rightVector = new Vector3(1, 0, 0);
  const axelVector = new Vector3(1, 0, 0);

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
    if(showRayDebug) {
      // Forward Arrow
      arrowFRef.current.setDirection(forwardVector);
      arrowFRef.current.setColor('#ff3333');
      arrowFRef.current.setLength(1.5);
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
  };

  const setForwardVector = () => {
    // World Forward Vector
    let fVector = new Vector3();
    fVector = bodyMesh.current.getWorldDirection(fVector);
    fVector.negate();
    
    forwardVector.copy(fVector);
  };

  const setUpVector = () => {
    const v1 = axelVector.clone();
    const v2 = forwardVector.clone(); 

    const up = v1.cross(v2);

    upVector.copy(up);
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

    rightVector.copy(wheelFRPos.clone().sub(wheelFLPos));
  }
  
  const setAxelVector = () => {
    const [wheelFL, wheelFR] = wheels;

    const wheelFLPos = vec3(wheelFL.current.translation());
    const wheelFRPos = vec3(wheelFR.current.translation());

    axelVector.copy(wheelFRPos.clone().sub(wheelFLPos));
  }

  /**
   * Rotates the axelVector and forwardVector
   * 
   * Alternative after dis
   *  -VV-   -VV-     -VV-
   */
  const rotateDriveVectors = (turn) => {
    const rotateAxis = upVector.clone().normalize();
    const rotateAngle = turn * (Math.PI / 6);
    const rotatedAxel = axelVector.clone().applyAxisAngle(rotateAxis, rotateAngle);
    const rotatedForward = forwardVector.clone().applyAxisAngle(rotateAxis, rotateAngle);
    
    axelVector.copy(rotatedAxel);
    forwardVector.copy(rotatedForward);
  }

  /**
   * **Extra
   */
  // For ABove alt
  /**
   * Update the Forward vector to direction and call update for all directions
   * @todo FIX IT!
   * BUGGY. The Axel Vector not updated and Up vector is weird
   */
  const setForwardDirection = (fVector) => {
    forwardVector.copy(fVector);

    // setRightVector();
    setAxelVector();
    setUpVector();
  }

  /**
   * Updates all direction vectors
   */
  const setDirVectors = () => {
    setForwardVector();
    // setRightVector();
    setAxelVector();
    setUpVector();
  }

  /**
   * Exposed to test if hook function calls are working
   */
  const debugCall = (initCall) => {
    if(initCall) {
      console.debug('useDirectionVectors :: First Debug Call');
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
    debugCall,
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
