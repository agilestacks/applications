import React, { useMemo, useState, useEffect } from 'react';
import classNames from 'classnames';
import {sample} from 'lodash';

const colors = ['red', 'blue', 'orange', 'green']
export const Keyword = ({children, className, withFlash, ...props}) => {
    const [flash, setFlesh] = useState(withFlash);
    const color = useMemo(() => children && sample(colors), [children]);

    useEffect(() => {
        setTimeout(
            () => setFlesh(false),
            50
        )
    }, [children]);

    return (
        <span
            className={
                useMemo(() => classNames(
                    'asi-teaser-keyword',
                    {
                        [`asi-teaser-keyword-${color}`]: color,
                        'asi-teaser-keyword-flash': flash
                    }
                ),
                [color, flash])
            }
            {...props}
        >
            {children}
        </span>
    )
}