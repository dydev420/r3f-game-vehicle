import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3 } from "three";
import { quat, vec3 } from "@react-three/rapier";
import useWheelStore from "../stores/useWheelStore";
import { DEFAULT_FORWARD, DEFAULT_RIGHT, DEFAULT_UP } from "../utils/constants";



/**
 * @hook useDirectionVectors
 * 
 * Car Forward, Up, Right, Axel
 *
 */
const useDirections = ({
  showRayDebug = true,
  index,
  body,
}) => {
  /**
   * Wheels
   */
  const wheels = useWheelStore((state) => state.wheels);

  /**
   * Direction Vectors
   */
  const forwardDir = useRef(DEFAULT_FORWARD.clone());
  const upDir = useRef(DEFAULT_UP.clone());
  const rightDir = useRef(DEFAULT_RIGHT.clone());
  const axelRight = useRef(DEFAULT_RIGHT.clone());
  const axelForward = useRef(DEFAULT_FORWARD.clone());

  /**
   * Debug Arrows
   */
  const arrowFRef = useRef();
  const arrowRRef = useRef();
  const arrowURef = useRef();
  const arrowARef = useRef();
  const arrowAFRef = useRef();
  


  /**
   * Methods
   */
  const updateArrowHelpers = () => {
    const bodyPos = vec3(body.current.translation());
    const wheelPos = vec3(wheels[index].current.translation());

    /**
     * Forward Arrow
     */
    if(showRayDebug && arrowFRef?.current) {
      // Forward Arrow
      arrowFRef.current.position.copy(bodyPos);
      arrowFRef.current.setDirection(forwardDir.current);
      arrowFRef.current.setColor('#ff3333');
      arrowFRef.current.setLength(1.5);
    }

    /**
     * Axel Forward Arrow
     */
    if(showRayDebug && arrowAFRef?.current) {
      // Forward Arrow
      arrowAFRef.current.position.copy(wheelPos);
      arrowAFRef.current.setDirection(axelForward.current);
      arrowAFRef.current.setColor('#ffeeee');
      arrowAFRef.current.setLength(0.5);
    }

    /**
     * Right Arrow
     */
    if(showRayDebug && arrowRRef?.current) {
      arrowRRef.current.position.copy(wheelPos);
      arrowRRef.current.setDirection(rightDir.current);
      arrowRRef.current.setColor('#3333ff');
      arrowRRef.current.setLength(0.3);
    }

    /**
     * Axel Arrow
     */
    if(showRayDebug && arrowARef?.current) {
      arrowARef.current.position.copy(wheelPos);
      arrowARef.current.setDirection(axelRight.current);
      arrowARef.current.setColor('#ff33ff');
      arrowARef.current.setLength(0.5);
    }

    /**
     * Up Arrow
     */
    if(showRayDebug  && arrowURef?.current) {
      arrowURef.current.position.copy(bodyPos);
      arrowURef.current.setDirection(upDir.current);
      arrowURef.current.setColor('#33ffff');
      arrowURef.current.setLength(1);
    }
  };


  /**
   * Return array with left and right wheel indices based on index prop
   * 
   * odd index = right wheel
   * even index = left wheel
   */
  const getWheelSetIndices = () => {
    if (index % 2) {
      return [
        index - 1, 
        index
      ]
    } else {
      return [index, index + 1];
    }
  };

  const setForwardVector = () => {
    // World Forward Vector
    let fVector = new Vector3(0, 0, -1);
    let bodyRotation = quat(body.current.rotation());
    fVector.applyQuaternion(bodyRotation);
    
    forwardDir.current.copy(fVector);
  };

  const setAxelForwardVector = () => {
    // World Forward Vector
    let fVector = new Vector3(0, 0, -1);
    let bodyRotation = quat(body.current.rotation());
    fVector.applyQuaternion(bodyRotation);
    
    axelForward.current.copy(fVector);
  };

  const setUpVector = () => {
    const v1 = axelRight.current.clone();
    const v2 = forwardDir.current.clone(); 

    const up = v1.cross(v2);

    upDir.current.copy(up);
  };
  
  const setRightVector = () => {
    // World Forward Vector
    let rVector = DEFAULT_RIGHT.clone();
    let bodyRotation = quat(body.current.rotation());

    rVector.applyQuaternion(bodyRotation);
    rightDir.current.copy(rVector);
  }
  
  const setAxelVector = () => {
    const [wheelLIndex, wheelRIndex] = getWheelSetIndices(index);

    const wheelL = wheels[wheelLIndex];
    const wheelR = wheels[wheelRIndex];

    const wheelLPos = vec3(wheelL.current.translation());
    const wheelRPos = vec3(wheelR.current.translation());

    axelRight.current.copy(wheelRPos.clone().sub(wheelLPos));
  }

  /**
   * Updates all direction vectors
   */
  const setDirVectors = () => {
    setForwardVector();
    setRightVector();
    setAxelVector();
    setUpVector();
    setAxelForwardVector();
  }

  /**
   * useEffect & useFrame
   */
  useEffect(() => {
    // Empty for now
    console.log('useDirectionVectors', index);
  });

  useFrame(() => {
    /**
     * Update All Direction Vectors and their Debug
     */
    // setDirVectors();

     /**
     * Update Arrow POsitions and directions
     */
    //  updateArrowHelpers();
  });


  return {
    forwardDir,
    upDir,
    rightDir,
    axelRight,
    axelForward,
    arrowFRef,
    arrowURef,
    arrowRRef,
    arrowARef,
    arrowAFRef,
    setDirVectors,
    updateArrowHelpers,
  };
};

export default useDirections;
