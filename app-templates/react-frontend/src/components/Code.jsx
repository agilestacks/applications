import classNames from 'classnames';

import './Code.scss';

export function Code({className, ...props}) {
    const componentClassName = classNames(
        'code',
        className
    )
    return <code className={componentClassName} {...props} />
}