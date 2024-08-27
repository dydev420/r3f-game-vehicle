import { Vector3 } from 'three';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

import { DEFAULT_FORWARD, REST_HEIGHT } from '../utils/constants';
import { createRef } from 'react';

const inputStore = ((set, get) => {
  return {
    inputAxis: {
      x: 0,
      y: 0
    },

    setInputX: (input) => {
      const inputAxis = get().inputAxis;
      inputAxis.x = input;
    },

    setInputY: (input) => {
      const inputAxis = get().inputAxis;
      inputAxis.y = input;
    },

    updateInputAxes: (x, y) => {
      const inputAxis = get().inputAxis;
      inputAxis.x = x;
      inputAxis.y = y;
    },


    /**
     * Primitive Values
     * 
     * Use subscribeWithSelector instead of useStore or
     * it will cause Re-render on every input
     */
    isJumpPressed: false,
    isBoostPressed: false,

    // Call Set state for primitive value
    // Will cause re render if not used with subscribeWithSelector
    setInputJump: (isJumpPressed) => {
      set(() => ({ isJumpPressed }));
    },
    setInputBoost: (isBoostPressed) => {
      set(() => ({ isBoostPressed }));
    }
  }
})

export default create(
  subscribeWithSelector(
    inputStore
  ),
  {
    name: 'inputStore'
  }
);
