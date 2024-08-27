import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export default create(subscribeWithSelector((set) => {
  return {
    blocksCount: 10,
    blocksSeed: 0,
    startTime: 0,
    endTime: 0,

    /**
     * Actions
     * - Idle
     * - Walk
     * - Run
     */
    action: 'Idle',

    setAction: (action) => {
      set({
        action
      })
    },
    
    ready: () => {
      set((state) => {
        if(state.action === 'Walk' || state.action === 'waiting') {
          return { action: 'Idle'}
        }
        return {};
      })
    },

    walk: () => {
      set((state) => {
        if(state.action === 'Idle' || state.action === 'Run') {
          return { action: 'Walk' }
        }
        return {};
      })
    },

    run: () => {
      set((state) => {
        if(state.action === 'Idle' || state.action === 'Walk') {
          return { action: 'Run' }
        }
        return {};
      })
    },


    wait: () => {
      set((state) => {
        if(state.action === 'Walk' || state.action === 'Idle') {
          return { action: 'Wait' }
        }
        return {};
      })
    },
  }
}));
