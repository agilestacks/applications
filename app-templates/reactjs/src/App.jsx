import {Navbar, NavbarGroup} from '@blueprintjs/core';

import './App.scss';

import {RepoActions} from './components/RepoActions';
import logo from './assets/img/logo.svg';

const {
    APPLICATION_REPOSITORY,
    APPLICATION_BRANCH = 'master'
} = process.env;

const repoUrl = `git@github.com:${APPLICATION_REPOSITORY}.git`;
const editUrl = `https://github.com/${APPLICATION_REPOSITORY}/blob/${APPLICATION_BRANCH}/src/App.jsx`;

export function App() {
    return (
        <div className="app">
            <header className="app-header">
                <div className="app-title">
                    <img className="logo" src={logo} />
                    <h2>Welcome to React Application</h2>
                </div>
                <Navbar className="app-navbar">
                    <div className="container flex">
                        <NavbarGroup>
                        </NavbarGroup>
                        <RepoActions {...{repoUrl, editUrl}}/>
                    </div>
                </Navbar>
            </header>
            <section className="app-content">
                <div className="container">
                </div>
            </section>
            <footer className="app-footer">
            </footer>
        </div>
    );
}