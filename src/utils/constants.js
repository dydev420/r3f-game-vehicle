/**
 * Gizmo
 */
export const TRANSFORM_MODES = ['translate', 'rotate', 'scale'];


/**
 * Level
 */
// export const GRID_SIZE = 8;
// export const BLOCK_SIZE = 8;
export const GRID_SIZE = 22;
export const BLOCK_SIZE = 16;
export const BLOCK_FLOAT_HEIGHT = 0.3;

/**
 * Block Terrain Config
 */
export const TERRAIN_TYPES = [
  'grass',
  'ground',
  'water',
  'road'
]
export const TERRAIN_MATERIALS = {
  grass: {
    color: 'LimeGreen'
  },
  ground: {
    color: 'SandyBrown'
  },
  water: {
    color: 'CornflowerBlue'
  },
  road: {
    color: 'Black'
  },
}; 