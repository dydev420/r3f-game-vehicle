import React, { useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';


function IsoPerspectiveCam(props) {
  /**
   * Properties
   */

  /**
   * Methods
   */

  /**
   * Frame Hooks
   */
  useEffect(() => {

  }, []);

  useFrame(() => {

  });

  return (
    <OrbitControls
      rotateSpeed={0.5}
      screenSpacePanning={false}
      minDistance={5}
      maxDistance={15}
      minPolarAngle={Math.PI/6}
      maxPolarAngle={Math.PI / 2}
      {...props}
    />
  )
}

export default IsoPerspectiveCam;
