/**
 * Define all constants for Wheel, Suspension, Steer, Car
 */

import { Vector3 } from "three";

/**
 * Debug Config
 */
export const ENABLE_RAY_DEBUG = true;
export const ENABLE_DIRECTION_DEBUG = true;
export const DEBUG_IMPULSE = 2;
export const RESET_POINT_HEIGHT = 1;

/**
 * Direction Vectors
 */

export const DEFAULT_FORWARD = new Vector3(0, 0, -1);
export const DEFAULT_UP = new Vector3(0, 1, 0);
export const DEFAULT_RIGHT = new Vector3(1, 0, 0);

/**
 * ======
 * 
 * CAR CONFIG
 */

/**
 * Car RigidBody Props
 */
// export const LINEAR_DAMP = 0.9;
// export const ANG_DAMP = 5;
// export const MASS = 100;
export const LINEAR_DAMP = 0.9;
export const ANG_DAMP = 5;
export const MASS = 100;

export const FRICTION = 0;

/**
 * Car Height Config
 * 
 * Used for Suspension and Wheel
 */
export const REST_HEIGHT = 0.5;
export const MAX_TRAVEL = 0.2;

/**
 * Spring Force
 */
// export const SPRING_SCALE = 1;
// export const SPRING_STRENGTH = 3000;
// export const SPRING_DAMPING = 2500;
export const SPRING_SCALE = 1;
export const SPRING_STRENGTH = 1800;
export const SPRING_DAMPING = 400;

/**
 * ======
 * 
 * WHEEL CONFIG
 */
/**
 * Wheel Names Array
*/
export const WHEEL_NAMES = [
  'wheelFL',
  'wheelFR',
  'wheelBL',
  'wheelFR'
];

/**
 * Wheel Physical Props
*/
export const WHEEL_RADIUS = REST_HEIGHT;
export const WHEEL_WIDTH = 0.1;
export const WHEEL_GRIP = 1;
export const WHEEL_MASS = 1;
// export const TIRE_TIME_MULTIPLIER = 100000;

/**
 * Wheel Positions and offsets
 */

export const WHEEL_POS_FR = [0.5, WHEEL_RADIUS, -0.5];
export const WHEEL_POS_BL = [-0.5, WHEEL_RADIUS, 0.5];
export const WHEEL_POS_FL = [-0.5, WHEEL_RADIUS, -0.5];
export const WHEEL_POS_BR = [0.5, WHEEL_RADIUS, 0.5];
// export const WHEEL_DEFAULT_OFFSET = -0.1;
export const WHEEL_DEFAULT_OFFSET = 0;

/**
 * Wheel Debug
 */
export const DEBUG_ENABLE_WHEEL_RAY = true;

/**
 * Steer Config
 */
export const STEER_SCALE = 0.1;

/**
 * Chassis Config
 */
export const CHASSIS_POS = [0, WHEEL_RADIUS, 0];
export const CHASSIS_COM = [0, -0.1, 0];

/**
 * Gas Acceleration Config
 */
export const ACC_SCALE = 50;
export const ACC_FORWARD = 4;
export const ACC_REVERSE = 6;
export const MAX_SPEED = 10;
export const BOOST_ACC = 10;

