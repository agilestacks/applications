import React from 'react';

import { Layer } from '../Layer';

const COLOR_RED = 'red';
const COLOR_GREEN = 'green';
const COLOR_BLUE = 'blue';
const COLOR_ORANGE = 'orange'

export const CubeEx = ({onToggleKeyword}) => {

    return (
        <div className="asi-cube-ex">
            <div className="asi-cube-ex-parts">
                <div className="asi-cube-ex-part asi-cube-ex-roof">
                    <Layer
                        colors={{
                            top: COLOR_ORANGE,
                            left: COLOR_BLUE,
                            right: COLOR_RED
                        }}
                        onToggleKeyword={onToggleKeyword}
                    />
                </div>
                <div className="asi-cube-ex-part asi-cube-ex-base">
                    <Layer
                        height={2}
                        colors={{
                            top: COLOR_GREEN,
                            left: COLOR_BLUE,
                            right: COLOR_RED
                        }}
                        onToggleKeyword={onToggleKeyword}
                    />
                </div>
            </div>
        </div>
    );
};