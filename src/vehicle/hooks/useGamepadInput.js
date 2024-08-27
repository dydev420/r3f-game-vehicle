import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3 } from "three";
import { vec3 } from "@react-three/rapier";
import { useKeyboardControls } from "@react-three/drei";
import { INPUT_DEADZONE, INPUT_TYPE_GAMEPAD, INPUT_TYPE_KEYBOARD } from "src/vehicle/utils/constants";
import useInputStore from "src/vehicle/stores/useInputStore";
import useGamepadStore from "src/vehicle/stores/useGamepadStore";


/**
 * @hook useSteering
 * 
 * Return the Forward, Up, Right, Axel
 *
 */
const useGamepadInput = () => {

  /**
   * Input store
   */
  const inputType = useInputStore((state) => state.inputType);
  const inputAxis = useInputStore((state) => state.inputAxis);
  const setInputType = useInputStore((state) => state.setInputType);
  const updateInputX = useInputStore((state) => state.updateInputX);
  const updateInputY = useInputStore((state) => state.updateInputY);
  const updateInputAxes = useInputStore((state) => state.updateInputAxes);
  const updateCameraInputX = useInputStore((state) => state.updateCameraInputX);
  const updateCameraInputY = useInputStore((state) => state.updateCameraInputY);
  
  const setInputJump = useInputStore((state) => state.setInputJump);
  const setInputBoost = useInputStore((state) => state.setInputBoost);
  const setInputDrift = useInputStore((state) => state.setInputDrift);


  /**
   * Gamepad Store
   */
  const gamepadIndex = useGamepadStore((state) => state.gamepadIndex);
  const padButtons = useGamepadStore((state) => state.padButtons);
  const lStick = useGamepadStore((state) => state.lStick);
  const rStick = useGamepadStore((state) => state.rStick);
  const setGamepadIndex = useGamepadStore((state) => state.setGamepadIndex);
  const updateLSInput = useGamepadStore((state) => state.updateLSInput);
  const updateRSInput = useGamepadStore((state) => state.updateRSInput);
  const updatePadButtonAt = useGamepadStore((state) => state.updatePadButtonAt);

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
  const handleDriftInput = (button) => {
    const isPressed = button.value > 0;
    setInputDrift(isPressed);
  }

  const handleSpecialKeys = (buttons) => {
    handleDriftInput(buttons[5]);
  }

  const handleTriggerInputs = (lt, rt) => {
    const lTriggerValue = lt.value;
    const rTriggerValue = rt.value;
    const fTriggerValue = rTriggerValue - lTriggerValue;

    updateInputX(fTriggerValue);
  }

  const handleStickInputs = (stickIndex, hAxis, vAxis) => {
    const hAxisFiltered = Math.abs(hAxis) > INPUT_DEADZONE ? hAxis: 0;
    const vAxisFiltered =  Math.abs(vAxis) > INPUT_DEADZONE ? vAxis: 0;

    if(stickIndex === 0) {
      updateInputY(hAxisFiltered);
      
    } else {
      updateCameraInputX(hAxisFiltered);
      updateCameraInputY(vAxisFiltered);
    }
  }


  const moveStickAxis = (stickIndex, leftRightAxis, upDownAxis) => {
    const hAxisFiltered = Math.abs(leftRightAxis) > INPUT_DEADZONE ? leftRightAxis: 0;
    const vAxisFiltered =  Math.abs(upDownAxis) > INPUT_DEADZONE ? upDownAxis: 0;

    if(stickIndex === 0) {
      updateLSInput(hAxisFiltered, vAxisFiltered);
    } else {
      updateRSInput(hAxisFiltered, vAxisFiltered);
    }
  };

  const handleGamepadSticks = (axes) => {
    const activeAxes = axes.filter((a) => Math.abs(a) > INPUT_DEADZONE);

    if(activeAxes.length) {
      if(inputType !== INPUT_TYPE_GAMEPAD) {
        setInputType(INPUT_TYPE_GAMEPAD);
      }
    }

    moveStickAxis(0, axes[0], axes[1]);
    moveStickAxis(1, axes[2], axes[3]);

    /**
     * Update controller input store
     */
    if(inputType === INPUT_TYPE_GAMEPAD) {
      handleStickInputs(0, axes[0], axes[1]);
      handleStickInputs(1, axes[2], axes[3]);
    }
  };
  
  const handleGamepadButtons = (buttons) => {
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
     
      updatePadButtonAt(i, button);
    }

    const pressed = buttons.filter((b) => b.value);
    
    if(pressed.length) {
      if(inputType !== INPUT_TYPE_GAMEPAD) {
        setInputType(INPUT_TYPE_GAMEPAD);
      }
    }

    /**
     * Update controller input store
     */
    if(inputType === INPUT_TYPE_GAMEPAD) {
      handleTriggerInputs(buttons[6], buttons[7]);
      handleSpecialKeys(buttons);
    }
  };
  

  /**
   * Runs every frame to update gamepad state by
   * querying the connected gamepad object
   */
  const updateGamepadInputs = () => {
    if(gamepadIndex !== null) {
      const gamepad = navigator.getGamepads()[gamepadIndex];

      handleGamepadSticks(gamepad.axes);
      handleGamepadButtons(gamepad.buttons);
    }
  };


  /**
   * useEffect & useFrame
   */
  useEffect(() => {
    console.log('useGamepadInput');

    // Handle Connect
    const onGamepadConnect =  window.addEventListener('gamepadconnected', (e) => {
      console.log('useGamepadInput::: Connected gamepad', e.gamepad);
      
      setGamepadIndex(e.gamepad.index);
      setInputType(INPUT_TYPE_GAMEPAD);
    });

    // Handle  Disconnect
    const onGamepadDisconnect =  window.addEventListener('gamepaddisconnected', (e) => {
      console.log('useGamepadInput ::: Disconnected  gamepad', e.gamepad);
      
      setInputType(INPUT_TYPE_KEYBOARD);
      setGamepadIndex(null);
    });


    return () => {
      window.removeEventListener(
        'gamepadconnected',
        onGamepadConnect
      );

      window.removeEventListener(
        'gamepaddisconnected',
        onGamepadDisconnect
      );
    }
  }, []);

  useFrame(() => {
    updateGamepadInputs();
  });


  return {
    inputAxis
  };
};

export default useGamepadInput;
