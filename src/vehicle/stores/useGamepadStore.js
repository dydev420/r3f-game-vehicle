import { Vector3 } from 'three';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

import { DEFAULT_FORWARD, INPUT_TYPE_GAMEPAD, INPUT_TYPE_KEYBOARD, REST_HEIGHT } from 'src/vehicle/utils/constants';

const padButtonEntry = {

};

const gamepadStore = ((set, get) => {
  return {
    gamepadIndex: null,
    lStick: {
      x: 0,
      y: 0
    },
    rStick: {
      x: 0,
      y: 0
    },
    padButtons: [],

    setGamepadIndex: (index) => {
      set(() => { return { gamepadIndex: index }; });
    },

    updateLStickX: (x) => {
      const lStick = get().lStick;
      lStick.x = x;
    },
    
    updateLStickY: (y) => {
      const lStick = get().lStick;
      lStick.y = y;
    },

    updateRStickX: (x) => {
      const rStick = get().rStick;
      rStick.x = x;
    },
    
    updateRStickY: (y) => {
      const rStick = get().rStick;
      rStick.y = y;
    },

    updateLSInput: (x, y) => {
      const lStick = get().lStick;
      lStick.x = x;
      lStick.y = y;
    },

    updateRSInput: (x, y) => {
      const rStick = get().rStick;
      rStick.x = x;
      rStick.y = y;
    },

    updatePadButtonAt: (index, button) => {
      const padButtons = get().padButtons;
      padButtons[index] = button;
    },
  }
})

export default create(
  subscribeWithSelector(
    gamepadStore
  ),
  {
    name: 'gamepadStore'
  }
);
