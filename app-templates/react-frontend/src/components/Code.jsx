import PropTypes from 'prop-types';
import classNames from 'classnames';

import './Code.scss';

export function Code({className, ...props}) {
    const componentClassName = classNames(
        'code',
        className
    );

    return <code className={componentClassName} {...props} />;
}

Code.propTypes = {
    className: PropTypes.string
};

Code.defaultProps = {
    className: undefined
};

export default Code;
