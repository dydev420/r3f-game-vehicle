import { Vector3 } from 'three';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

import { DEFAULT_FORWARD, REST_HEIGHT } from '../utils/constants';

const defaultSpringState = {
  prevLength: REST_HEIGHT,
  springLength: REST_HEIGHT,
  offset: 0,
  velocity: 0,
}

const carStore = ((set, get) => {
  return {
    wheelSpins: [
      0,
      0,
      0,
      0
    ],
    forwardDir: DEFAULT_FORWARD.clone(),
    speed: 0,
    velocity: new Vector3(0, 0, 0),

    // Mutate wheel spins array state
    updateWheelSpinAt: (index, amount) => {
      const spins = get().wheelsPins;

      spins[index] = amount;
    },

    // Mutate Vector state
    updateCarForward: (dir) => {
      const forwardDir = get().forwardDir;

      forwardDir.copy(dir);
    },
    
    // *Mutate Velocity AND Set new Speed state
    updateVelocity: (velV) => {
      set((state) => {
        state.velocity.copy(velV);

        const vDot = velV.dot(state.forwardDir);

        return {
          speed: vDot
        };
      });
    },

    // *Sets new state, can cause re-render
    setSpeed: (velV) => {
      set((state) => {
        const vDot = velV.dot(state.forwardDir);

        return {
          speed: vDot
        };
      });
    },

  }
})

export default create(
  subscribeWithSelector(
    carStore
  ),
  {
    name: 'carStore'
  }
);
