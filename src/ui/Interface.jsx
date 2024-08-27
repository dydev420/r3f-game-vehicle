import React from 'react'
import GamepadUI from 'src/ui/components/GamepadUI';
import SpeedoMeterUI from 'src/ui/components/SpeedoMeterUI';

/**
 * Wrapper Component to wrap all UI Components
 * and render it outside of R3f Canvas context
 */
function Interface() {
  return (
    <div className="interface">
      <GamepadUI />
      <SpeedoMeterUI />
    </ div>
  )
}

export default Interface;