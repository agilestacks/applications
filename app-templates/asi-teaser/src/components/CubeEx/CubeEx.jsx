import React, { useState } from 'react';

import {Layer} from '../Layer';

const COLOR_RED = '#dc2422';
const COLOR_ORANGE = '#fbb73a';
const COLOR_GREEN = '#a7cb50';
const COLOR_BLUE = '#183765';
const COLOR_WHITE = '#fff';

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