import { OrbitControls } from '@react-three/drei'
import { Perf } from 'r3f-perf'
import { Physics } from '@react-three/rapier'
import { useControls } from 'leva'
import { BLOCK_SIZE, GRID_SIZE } from 'src/utils/constants.js'
import IsoPerspectiveCam from 'src/cameras/IsoPerspectiveCam.jsx'
import LevelTrack from 'src/levels/LevelTrack.jsx'
import Lights from 'src/Lights.jsx'

export default function Experience()
{
    const {
        gridSize,
        blockSize,
        showDirectionLight,
        useGameCamera,
    } = useControls({
        gridSize: { value: GRID_SIZE, min: 1, max: 32, step: 2 },
        blockSize: { value: BLOCK_SIZE, min: 1, max: 256, step: 1 },
        showDirectionLight: { value: true },
        useGameCamera: { value: true },
    });

    return <>
        <Perf position="top-left" showGraph={false} />

        <color args={['#bdedfc']} attach="background" />

        {
            useGameCamera
                ? <IsoPerspectiveCam makeDefault />
                : <OrbitControls makeDefault />
        }

        <Physics timeStep="vary" debug={true}>
            {
                showDirectionLight && <Lights />
            }
            <LevelTrack gridSize={gridSize} blockSize={blockSize} />
        
        </Physics>

    </>
}
