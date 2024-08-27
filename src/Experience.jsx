import { Grid, OrbitControls } from '@react-three/drei'
import Lights from './Lights.jsx'
import Level, { BlockAxe, BlockLimbo, BlockSpinner } from './levels/Level.jsx'
import { Physics } from '@react-three/rapier'
import Player from './controllers/Player.jsx'
import useGame from './stores/useGame.js'

import VehicleController from './controllers/VehicleController.jsx'
import Jeep from './models/Jeep.jsx'
import LevelBasic from './levels/LevelBasic.jsx'
import Car from './wheel/components/Car.jsx'

export default function Experience()
{
    const blocksCount = useGame((state) => state.blocksCount);
    const blocksSeed = useGame((state) => state.blocksSeed);

    return <>

        <color args={['#bdedfc']} attach="background" />

        <OrbitControls />

        <Grid
            infiniteGrid
            position={[0, 0.001, 0]}
            cellSize={0.1}
            cellThickness={0.3}
            sectionThickness={0.6}
        />

        <Physics timeStep="vary" debug={true}>
            <Lights /> 
            <LevelBasic />
            {/* <VehicleController /> */}
            <Car />
        </Physics>

    </>
}
