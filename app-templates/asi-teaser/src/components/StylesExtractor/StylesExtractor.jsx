import React from 'react';

const {NODE_ENV} = process.env;

function extractStyles() {
    const styleSheets = [...document.querySelectorAll('style')];
    const styles = styleSheets
        .map(({textContent}) => textContent)
        .join('\n');

    const bufferElement = document.createElement('textarea');
    bufferElement.value = styles;
    document.body.appendChild(bufferElement);
    bufferElement.select();
    document.execCommand('copy');
    document.body.removeChild(bufferElement);
    alert('Styles a re copied  to clipboard');
}
export const StylesExtractor = () => {
    if (NODE_ENV === 'development') {
        return (
            <button className="asi-styles-extractor" onClick={extractStyles}>
                copy styles
            </button>
        );
    }

    return false;
}