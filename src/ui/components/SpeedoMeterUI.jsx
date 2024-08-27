
import 'src/ui/styles/speedometer.scss';

import { useEffect, useRef, useState } from "react";
import { addEffect } from '@react-three/fiber';
import useCarStore from 'src/vehicle/stores/useCarStore';
import { MAX_SPEED } from 'src/vehicle/utils/constants';
import SpeedoMeterIcon from 'src/ui/icons/SpeedoMeterIcon';

let gg = 0;

function SpeedoMeterUI() {
  /**
   * Refs
   */
  const uiRef = useRef();
  const iconRef = useRef();

  const debugC = useRef(0);

  /**
   * State Ref
   */
  const showDate = useRef(false);
  /**
   * Methods
   */
  const setupWatch = () => {
    const watchIcon = iconRef.current;
    const speedElement = watchIcon.getElementById('text_speed');
    
    speedElement.addEventListener('click', () => {
      handleDateClick();
    });
  }

  const updateWatch = () => {
    const watchIcon = iconRef.current;

    const carSpeed  = useCarStore.getState().speed;
    const nSpeed = Math.abs(carSpeed / MAX_SPEED);

    if(watchIcon) {
      const speedNeedle = watchIcon.getElementById('needle_speed');
      const speedCircle = watchIcon.getElementById('circle_speed');
      const outlineCircle = watchIcon.getElementById('circle_outline');
      const speedText = watchIcon.getElementById('text_speed');

      const nMinutes = nSpeed * 60; 
      const nRotation = (360/60) * nMinutes;


      speedText.textContent = `${(carSpeed).toFixed(0)} m/s`;
      speedNeedle?.setAttribute('transform', `rotate(${nRotation})`);

      speedCircle?.setAttribute('stroke-dasharray', `${nRotation} ${360 - nRotation}`);

      outlineCircle?.setAttribute('stroke-dasharray', `${360 - nRotation} ${nRotation}`);
      outlineCircle?.setAttribute('stroke-dashoffset', `${180 - nRotation}`);
    }
  };

  const handleDateClick = () => {
    showDate.current = !showDate.current;
  }

  useEffect(() => {
    setupWatch();
    

    addEffect(() => {
      updateWatch();
    });
  }, []);

  
  return (
    <div ref={uiRef} className="speedometer-container">
      <div className="speedometer" id="speedometer">
        <SpeedoMeterIcon ref={iconRef} />
      </div>
    </div>
  );
}

export default SpeedoMeterUI;
