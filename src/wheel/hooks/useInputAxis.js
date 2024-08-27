import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3 } from "three";
import { vec3 } from "@react-three/rapier";
import { STEER_SCALE, WHEEL_GRIP, WHEEL_MASS } from "../utils/constants";
import useInputStore from "../stores/useInputStore";
import { useKeyboardControls } from "@react-three/drei";


/**
 * @hook useSteering
 * 
 * Return the Forward, Up, Right, Axel
 *
 */
const useInputAxis = () => {

  /**
   * Input store
   */
  const inputAxis = useInputStore((state) => state.inputAxis);
  const setInputX = useInputStore((state) => state.setInputX);
  const setInputY = useInputStore((state) => state.setInputY);
  const updateInputAxes = useInputStore((state) => state.updateInputAxes);
  const setInputJump = useInputStore((state) => state.setInputJump);
  const setInputBoost = useInputStore((state) => state.setInputBoost);

  /**
   * Drei keyboard input hook
   */
  const [ subscribeKeys, getKeys ] = useKeyboardControls();

  /**
   * Methods
   */
  /**
   * Called on Jump Input press
   */
  const handleJumpInput = (isPressed) => {
    setInputJump(isPressed);
  }

  /**
   * Called on Boost Input press
   */
  const handleBoostInput = (isPressed) => {
    setInputBoost(isPressed);
  }

  /**
   * Runs each frame to check for pressed input keys
   * and updates the inputAxis store
   * 
   */
  const checkInputPressed = () => {
    const {
      forward,
      backward,
      leftward,
      rightward,
    } = getKeys();
    
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

    updateInputAxes(forceMultiplier, turnMultiplier);
  }

  /**
   * useEffect & useFrame
   */
  useEffect(() => {
    console.log('useInputAxis');

    // Handle Jump Input
    const unsubscribeJump =  subscribeKeys(
      (state) => state.jump,
      (value) => {
        handleJumpInput(value);
      }
    );

    // Handle Boost Input
    const unsubscribeBoost =  subscribeKeys(
      (state) => state.boost,
      (value) => {
        handleBoostInput(value);
      }
    );

    return () => {
      unsubscribeJump();
      unsubscribeBoost();
    }
  });

  useFrame(() => {
    checkInputPressed();
  });


  return {
    inputAxis
  };
};

export default useInputAxis;
