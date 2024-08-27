
import { BLOCK_SIZE, GRID_SIZE } from "src/utils/constants";
import GridBounds from "src/levels/components/GridBounds";
import Track from "src/models/Track";
import Car from "src/vehicle/components/Car";
/**
 * Main Level Component
 */
export default function LevelTrack({
  gridSize = GRID_SIZE,
  blockSize = BLOCK_SIZE,
}) {

  
return (
    <>
      {/* <RigidBody position={[0, 0.0, 0]} type="fixed" colliders="trimesh"> */}
      {/* </RigidBody> */}

      {/* <Car spawnPosition={[(gridSize*blockSize)/2, 2,(gridSize*blockSize)/2]} /> */}
      <Car spawnPosition={[2, 2, 2]} />

      <Track position={[(gridSize*blockSize)/2, 0.1, (gridSize * blockSize) /2]} scale={gridSize}  />
      <GridBounds gridSize={gridSize} blockSize={blockSize} />
    </>
  )
}
