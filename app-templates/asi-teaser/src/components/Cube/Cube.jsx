import React, { useState, useEffect, useLayoutEffect, useCallback, useMemo } from 'react';

import {PI_QUARTER, PI, PI_HALF, PI_DOUBLE} from '../../constants';
import {cartesianToSphere} from '../../utils';

const {
    cos,
    sin
} = Math;

const colors = [{
    color: [251, 183, 59], // orange,
    rX: PI_QUARTER
}, {
    color: [24, 55, 101], // blue,
    rX: PI_QUARTER * 8
}];

const GRAD_TO_RAD = Math.PI / 180;

const useColor = (rX, rY, rZ, lights) => useMemo(() => {
    const {
        theta,
        phi
    } = cartesianToSphere({rX, rY, rZ});

    const cosTheta = cos(theta);
    const cosPhi = cos(phi);
    const sinPhi = sin(phi);

    console.log('point', {theta, phi, rX});

    return [
        '#',
        ...lights.reduce(
            (acc, {color, ...angel}) => {
                const sphere = cartesianToSphere(angel);

                const reflected = sinPhi * sin(sphere.phi) * cos(theta - sphere.theta) + cosPhi * cos(sphere.phi);

                // console.log(reflected, sphere, theta, phi);

                // const px = Math.cos((x - angel.x) * GRAD_TO_RAD);
                // const py = Math.cos((y - angel.y) * GRAD_TO_RAD);
                // const pz = Math.cos((z - angel.z) * GRAD_TO_RAD);

                // console.log({x, y, z}, angel, {px,  py});

                // const reflected = Math.max(
                //     px,
                //     py,
                //     // pz,
                // );
                // console.log(reflected);

                if (reflected >= 0) {
                    // const part = px * py;// * pz;
                    console.log('reflected', reflected, sphere, theta, phi);
                    return acc
                        .map((channel, index) => channel + color[index] * reflected);
                }

                return acc;
            },
            [0, 0, 0]
        )
            .map(channel => Math.min(255, Math.floor(channel)).toString(16).padStart(2, 0))
    ]
        .join('')
}
, [
    rX,
    rY,
    rZ,
    lights
]);
export function Cube({colors = {}, zIndex = 1}) {
    const [x, setX] = useState(0);
    const [y, setY] = useState(0);
    const [z, setZ] = useState(0);

    // useEffect(() => {
    //     // console.log(`rotateX(${x}deg) rotateY(${y}) rotateZ(${z})`);
    //     setTimeout(() => {
    //         setX(x + .01);
    //         setY(y + .03);
    //         setZ(z + .015);
    //     }, 3000);

    // }, [x, y, z]);

    const onClick = useCallback(() => {
        setX((x + .01) % PI_DOUBLE);
        setY((y + .003) % PI_DOUBLE);
        // setZ((z + .005) % PI_DOUBLE);
    }, [x, y, z]);

    // setTimeout(onClick, 1);

    // const frontColor = useColor(x, y, z, colors);
    // const rightColor = useColor(x, y + PI, z, colors);
    // const backColor = useColor(x + PI_DOUBLE , y, z, colors);
    // const topColor = useColor(x + PI , y, z, colors);
    // const bottomColor = useColor(x + PI * 3 , y, z, colors);

    const style = useMemo(() => ({
        transform: `rotateX(${x}rad) rotateY(${y}rad) rotateZ(${z}rad)`,
        scale: 1,
        zIndex
    }), [x, y, z, zIndex]);

    return (
        <div className="asi-cube" style={style} onClick={onClick}>
            {/* <div className="asi-cube-back" style={{backgroundColor: colors.back}} > back </div>
            <div className="asi-cube-top" style={{backgroundColor: colors.top}} > top </div>
            <div className="asi-cube-left" style={{backgroundColor: colors.left}}> left </div> */}
            <div className="asi-cube-right" style={{backgroundColor: colors.right}}> right </div>
            <div className="asi-cube-bottom" style={{backgroundColor: colors.bottom}}> bott </div>
            <div className="asi-cube-front" style={{backgroundColor: colors.front}}> front </div>
        </div>
    )
}