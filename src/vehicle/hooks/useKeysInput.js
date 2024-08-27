import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import { INPUT_TYPE_KEYBOARD } from "src/vehicle/utils/constants";
import useInputStore from "src/vehicle/stores/useInputStore";


/**
 * @hook useSteering
 * 
 * Return the Forward, Up, Right, Axel
 *
 */
const useKeysInput = () => {

  /**
   * Input store
   */
  const inputType = useInputStore((state) => state.inputType);
  const setInputType = useInputStore((state) => state.setInputType);
  const inputAxis = useInputStore((state) => state.inputAxis);
  const updateInputAxes = useInputStore((state) => state.updateInputAxes);
  const setInputJump = useInputStore((state) => state.setInputJump);
  const setInputBoost = useInputStore((state) => state.setInputBoost);
  const setInputDrift = useInputStore((state) => state.setInputDrift);

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
   * Called on Boost Input press
   */
  const handleDriftInput = (isPressed) => {
    setInputDrift(isPressed);
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
      turnMultiplier += -1;
    }

    if(rightward) {
      turnMultiplier += 1;
    }

    if(inputType === INPUT_TYPE_KEYBOARD) {
      updateInputAxes(forceMultiplier, turnMultiplier);
    }
  }

  /**
   * useEffect & useFrame
   */
  useEffect(() => {
    console.log('useKeysInput');

    // // Handle Jump Input
    // const unsubscribeJump =  subscribeKeys(
    //   (state) => state.jump,
    //   (value) => {
    //     handleJumpInput(value);
    //   }
    // );
    
    // Handle Drift (using Jump Input for now)
    const unsubscribeDrift =  subscribeKeys(
      (state) => state.jump,
      (value) => {
        handleDriftInput(value);
      }
    );

    // Handle Boost Input
    const unsubscribeBoost =  subscribeKeys(
      (state) => state.boost,
      (value) => {
        handleBoostInput(value);
      }
    );

    // Handle Boost Input
    const unsubscribeAnyKey =  subscribeKeys(
      (state) => state,
      () => {
        if(inputType !== INPUT_TYPE_KEYBOARD) {
          setInputType(INPUT_TYPE_KEYBOARD);
        }
      }
    );

    return () => {
      unsubscribeDrift();
      unsubscribeBoost();
      unsubscribeAnyKey()
    }
  });

  useFrame(() => {
    checkInputPressed();
  });


  return {
    inputAxis
  };
};

export default useKeysInput;
