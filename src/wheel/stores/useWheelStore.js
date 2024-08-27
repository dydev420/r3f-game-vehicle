import { Vector3 } from 'three';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

import { DEFAULT_FORWARD, REST_HEIGHT } from '../utils/constants';
import { createRef } from 'react';

const defaultSpringState = {
  prevLength: REST_HEIGHT,
  springLength: REST_HEIGHT,
  offset: 0,
  velocity: 0,
}

const wheelStore = ((set, get) => {
  return {
    wheelCount: 0,
    wheels: [
      createRef(),
      createRef(),
      createRef(),
      createRef(),
    ],
    groundHits: [
      null,
      null,
      null,
      null
    ],
    springs: [
      {...defaultSpringState },
      {...defaultSpringState },
      {...defaultSpringState },
      {...defaultSpringState }
    ],
    forwardDir: DEFAULT_FORWARD,

    // Re-render components by updating state
    setWheels: (wheels) => {
      set(() => ({ wheels }));
    },

    // Re-render components by updating state
    setGroundHits: (springs) => {
      set(() => ({ springs }));
    },

    // Re-render components by updating state
    setGroundHits: (hits) => {
      set(() => ({ groundHits: hits }));
    },

    // Mutate wheels state
    addWheel: (wheel) => {
      set(() => {
        const wheels = get().wheels;

        wheels.push(wheel);

        return {
          wheelCount: wheels.length
        }
      });
    },

    // Mutate wheels state
    addWheelAt: (index, wheel) => {
      const wheels = get().wheels;

      wheels[index] = wheel;
    },
    // Mutate wheels state
    addGroundHitAt: (index, hitInfo) => {
      const groundHits = get().groundHits;
      groundHits[index] = hitInfo;
    },

    // Mutate wheels state
    updateSpringAt: (index, springInfo) => {
      const springs = get().springs;
      springs[index] = springInfo;
    },

    // Mutate Vector state
    updateForwardDir: (dir) => {
      state.forwardDir.copy(dir);
    }
  }
})

export default create(
  subscribeWithSelector(
    wheelStore
  ),
  {
    name: 'wheelStore'
  }
);
