import React from 'react';
import { range } from 'lodash';
import classNames from 'classnames';


const Tile = ({color, ...props}) => (
    <div
        className={
            classNames(
                'asi-tile',
                {
                    [`asi-tile-${color}`]: color
                }
            )
        }
        {...props}
    />
)

export const Layer = ({className, name, height = 1, colors = {}, onToggleKeyword}) => (
    <div
        className={classNames(
            'asi-layer',
            className,
            {
                [`as-layer-${name}`]: name
            }
        )}
    >
        <div className="asi-layer-face asi-layer-face-top">
            {
                range(0, 9)
                    .map(i => (
                        <Tile
                            key={`tile-${i}`}
                            color={colors.top}
                            onMouseEnter={onToggleKeyword}
                        />
                    ))
            }
        </div>
        <div className="asi-layer-face asi-layer-face-right">
            {
                range(0, 3 * height)
                    .map(i => (
                        <Tile
                            key={`tile-${i}`}
                            color={colors.right}
                            onMouseEnter={onToggleKeyword}
                        />
                    ))
            }
        </div>
        <div className="asi-layer-face asi-layer-face-left">
            {
                range(0, 3 * height)
                    .map(i => (
                        <Tile
                            key={`tile-${i}`}
                            color={colors.left}
                            onMouseEnter={onToggleKeyword}
                        />
                    ))
            }
        </div>
    </div>
)