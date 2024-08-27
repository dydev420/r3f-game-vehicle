import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { LinearInterpolant, Vector3 } from "three";
import { quat, vec3 } from "@react-three/rapier";
import useWheelStore from "src/vehicle/stores/useWheelStore";
import { DEFAULT_FORWARD, DEFAULT_RIGHT, DEFAULT_UP } from "src/vehicle/utils/constants";

// const linearInterpolant = new LinearInterpolant(
//   new Float32Array([0, 0.4, 0.7, 1]),
//   new Float32Array([1, 13, 15, 20]),
//   4,
//   new Float32Array(4)
// );

// const linearInterpolant = new LinearInterpolant(
//   new Float32Array([0, 0.2, 0.5, 1]),
//   new Float32Array([0.9, 0.7, 0.5, 0.3]),
//   1,
//   new Float32Array(1)
// );


/**
 * @hook useDirectionVectors
 * 
 * Car Forward, Up, Right, Axel
 *
 */
const useInterpolation = (points) => {
  /**
   * Value Ref
   */
  const pValueRef = useRef(null);


  /**
   * Methods
   */

  const updatePRef = (t) => {
    pValueRef.current = linearInterpolant.evaluate(t)[0];
  }

  const linearInterpolant = useMemo(() => {
    const pointsX = points.map((point) => point.x);
    const pointsY = points.map((point) => point.y);

    return new LinearInterpolant(
      new Float32Array(pointsX),
      new Float32Array(pointsY),
      1,
      new Float32Array(1)
    );
  }, []);


  return {
    pValueRef,
    updatePRef,
  };
};

export default useInterpolation;
