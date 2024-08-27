/**
 * Useful Link: on StackOverflow
 * 
 * https://stackoverflow.com/questions/28812599/draw-arc-by-angle-in-svg
 * https://stackoverflow.com/a/77176845
 */

import React, { forwardRef } from 'react'

const SpeedoMeterIcon = forwardRef((props, ref) => {
  return (
    <>
      <svg
        {...props}
        ref={ref}
        version="1.1"
        id="Capa_1"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        x="0px"
        y="0px"
        width="200"
        height="200"
        xmlSpace="preserve"
        viewBox="-100 -100 200 200"
      >
        <circle
          id="circle_speed"
          stroke="#ffffff"
          fill="transparent"
          pathLength="360"
          strokeDasharray="90 270"
          strokeDashoffset="180"
          cx="0"
          cy="0"
          r="95"
          strokeWidth="2"
        />
        <circle
          id="circle_outline"
          stroke="#000000"
          fill="transparent"
          pathLength="360"
          // strokeDasharray="300 60"
          // strokeDashoffset="180"
          cx="0"
          cy="0"
          r="95"
          strokeWidth="1"
        />

        <circle
          className="ticks ticks-minute"
          cx="0"
          cy="0"
          r="90"
          pathLength="60"
        />
        <circle
          className="ticks ticks-hour"
          cx="0"
          cy="0"
          r="90"
          pathLength="60"
        />

        <text id="text_speed" className="text-speed" x="75" y="10">
          00
        </text>

        <g id="needle_speed">
          <g id="needle_minute">
            <line
              className="needle"
              x1="0"
              y1="0"
              x2="-12"
              y2="0"
            />

            <line
              className="needle needle-thick"
              x1="-10"
              y1="0"
              x2="-60"
              y2="0"
            />
          </g>
          
          <g id="needle_second">
            <line
              className="needle needle-second"
              x1="12"
              y1="0"
              x2="-80"
              y2="0"
            />
          </g>
        </g>

        <circle className="center-dot" r="3" />
      </svg>
    </>
  )
});

export default SpeedoMeterIcon;
