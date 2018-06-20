import React from 'react';
import ReactDOM from 'react-dom';

import  '@blueprintjs/core/src/blueprint.scss';
import  './index.scss';

import {App} from './App';
import {Routes} from './pages/Routs';
import {HashRouter} from 'react-router-dom';


ReactDOM.render(
    <HashRouter>
        <App>
            <Routes />
        </App>
    </HashRouter>
    , document.getElementById('react-root'));
