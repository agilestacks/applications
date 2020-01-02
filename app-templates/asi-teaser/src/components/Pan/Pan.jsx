import React from 'react';
import classNames from 'classnames';

import { Cube } from '../Cube';

export const Pan = ({colors, className, zIndex, margin}) => (
    <div
        className={
            classNames(
                'asi-pan',
                className,
                {
                    'asi-pan-margin': margin
                }
            )
        }
        style={{zIndex}}
    >
        <div>
            <Cube colors={colors} zIndex="10" />
            <Cube colors={colors} zIndex="20" />
            <Cube colors={colors} zIndex="30" />
        </div>
        <div>
            <Cube colors={colors} zIndex="10" />
            <Cube colors={colors} zIndex="20" />
            <Cube colors={colors} zIndex="30" />
        </div>
        <div>
            <Cube colors={colors} zIndex="10" />
            <Cube colors={colors} zIndex="20" />
            <Cube colors={colors} zIndex="30" />
        </div>
    </div>
);
