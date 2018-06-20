import {NavbarGroup, Menu} from '@blueprintjs/core';
import {NavLink} from 'react-router-dom';

import './Navigation.scss';

function NavigationItem({to, children}) {
    return <NavLink className="navigation-item" exact to={to} activeClassName="navigation-item-active">{children}</NavLink>
}
export function Navigation() {
    return (
        <NavbarGroup className="navigation">
            <NavigationItem to="/">Source</NavigationItem>
            <NavigationItem to="/features">Features</NavigationItem>
            <NavigationItem to="/development">Development</NavigationItem>
        </NavbarGroup>
    );
}