
import { useEffect, useRef } from "react";
import { addEffect, useFrame } from "@react-three/fiber";
import { useSpring, animated } from "@react-spring/web"
import useInputStore from "src/vehicle/stores/useInputStore";
import useGamepadStore from "src/vehicle/stores/useGamepadStore";
import { INPUT_DEADZONE, INPUT_TYPE_GAMEPAD, INPUT_TYPE_KEYBOARD } from "src/vehicle/utils/constants";
import GamepadIcon from "src/ui/icons/GamepadIcon";

function GamepadUI() {
  /**
   * Refs
   */
  const uiRef = useRef();
  const buttonGroupRef = useRef();
  const gamepadIconRef = useRef();

  /**
   * Stores
   */
  const inputType = useInputStore((state) => state.inputType);
  const gamepadIndex = useGamepadStore((state) => state.gamepadIndex);
  
  /**
   * Condition to render this UI
   */
  const showGamepad = inputType === INPUT_TYPE_GAMEPAD;

  /**
   * Animation Springs
   */
  const fadeIn = useSpring({
    opacity: showGamepad ? 1 : 0,
  });

  const jumpIn = useSpring({
    transform: showGamepad ? 'scaleY(100%)': 'scaleY(0%)',
    config: {
      friction: 20,
      tension: 500,
    },
  });
  
  const moveStickIcons = (elementId, stickIndex, leftRightAxis, upDownAxis) => {
    const multiplier = 25;
    const hAxisFiltered = Math.abs(leftRightAxis) > INPUT_DEADZONE ? leftRightAxis: 0;
    const VAxisFiltered =  Math.abs(upDownAxis) > INPUT_DEADZONE ? upDownAxis: 0;
    const stickLeftRight = hAxisFiltered * multiplier;
    const stickupDown = VAxisFiltered * multiplier;

    const stickElement = document.getElementById(elementId);
    const x = Number(stickElement.dataset.originalXPosition);
    const y = Number(stickElement.dataset.originalYPosition);

    stickElement.setAttribute('cx', x + stickLeftRight);
    stickElement.setAttribute('cy', y + stickupDown);
  };

  const handleGamepadSticks = (axes) => {
    moveStickIcons('controller-b10', 0, axes[0], axes[1]);
    moveStickIcons('controller-b11', 1, axes[2], axes[3]);
  };

  const handleGamepadButtons = (buttons) => {
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      const buttonElement = document.getElementById(`controller-b${i}`);
      const selectedBtnClass = 'selected-button';

      if(buttonElement) {
        if(button.value > 0) {
          buttonElement.classList.add(selectedBtnClass);
          buttonElement.style.filter = `contrast(${button.value * 150}%)`;
        } else {
          buttonElement.classList.remove(selectedBtnClass);
          buttonElement.style.filter = `contrast(100%)`;
        }
      }
    }
  };


  const updateGamePadInputs = () => {
    if(gamepadIndex !== null) {
      const gamepad = navigator.getGamepads()[gamepadIndex];

      handleGamepadSticks(gamepad.axes);
      handleGamepadButtons(gamepad.buttons);
    }
  };


  useEffect(() => {
    /**
     * Add callback to run every frame like hook, because outside of Canvas
     */
    addEffect(() => {
      updateGamePadInputs();
    });
  }, [gamepadIndex]);

  

  return (
    <animated.div ref={uiRef} style={fadeIn} className="controller-options">
      <animated.div ref={buttonGroupRef} style={jumpIn} className="gamepad-wrapper">
        <div className="gamepad" id="gamepad">
          <GamepadIcon ref={gamepadIconRef} />
        </div>
      </animated.div>
    </animated.div>
  );
}

export default GamepadUI;
