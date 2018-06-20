import {Navbar, NavbarGroup} from '@blueprintjs/core';
import {Link} from 'react-router-dom';

import './App.scss';

import logo from './assets/img/logo.svg';

import {RepoActions, Navigation} from './components';

const {
    APPLICATION_REPOSITORY,
    APPLICATION_BRANCH = 'master'
} = process.env;

const repoUrl = `git@github.com:${APPLICATION_REPOSITORY}.git`;
const editUrl = `https://github.com/${APPLICATION_REPOSITORY}/blob/${APPLICATION_BRANCH}/src/App.jsx`;

export function App({children}) {
    return (
        <div className="app">
            <header className="app-header">
                <div className="app-title">
                    <Link to="/"><img className="app-title-logo" src={logo} /></Link>
                    <h2><Link className="app-title-name" to="/">Welcome to React Application</Link></h2>
                </div>
                <Navbar className="app-navbar">
                    <div className="container flex">
                        <Navigation />
                        <RepoActions {...{repoUrl, editUrl}}/>
                    </div>
                </Navbar>
            </header>
            <section className="app-content">
                <div className="container">
                    {children}
                </div>
            </section>
            <footer className="app-footer">
            </footer>
        </div>
    );
}