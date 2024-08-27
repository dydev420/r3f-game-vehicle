import { Vector3 } from 'three';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export default create(subscribeWithSelector((set) => {
  return {
    /**
     * AnimStates
     * - Idle
     * - Run
     * - Walk?
     */
    animState: 'Idle',
    prevAnimState: 'Idle',
    velocity: 0,
    linvel: new Vector3(),

    setAnimState: (animState) => {
      set((state) => ({
        animState,
        prevAnimState: state.animState,
      }))
    },
    
    idle: () => {
      set((state) => {
        if(state.animState === 'Walk' || state.animState === 'Wait') {
          return { animState: 'Idle'}
        }
        return {};
      })
    },

    walk: () => {
      set((state) => {
        if(state.animState === 'Idle' || state.animState === 'Run') {
          return { animState: 'Walk' }
        }
        return {};
      })
    },

    run: () => {
      set((state) => {
        if(state.animState === 'Idle' || state.animState === 'Walk') {
          return { animState: 'Run' }
        }
        return {};
      })
    },


    wait: () => {
      set((state) => {
        if(state.animState === 'Walk' || state.animState === 'Idle') {
          return { animState: 'Wait' }
        }
        return {};
      })
    },
  }
}));
