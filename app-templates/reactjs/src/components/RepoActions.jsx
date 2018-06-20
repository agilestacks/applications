import {Component} from 'react';
import {NavbarGroup, Alignment, Button, Intent, NavbarDivider, AnchorButton, Icon} from '@blueprintjs/core';
import {IconNames} from '@blueprintjs/icons';

import './RepoActions.scss';

export class RepoActions extends Component {
    copy = () => {
        if (this.sourceInput) {
            this.sourceInput.select();
            document.execCommand('copy');
        }
    }
    mountSourceInput = sourceInput => Object.assign(this, {sourceInput})
    render() {
        const {editUrl, repoUrl} = this.props;
        const {copy, mountSourceInput} = this;
        return (
            <NavbarGroup className="repo-actions">
                <input
                    className="pt-input repo-actions-source"
                    ref={mountSourceInput}
                    readOnly
                    value={repoUrl}
                />
                <Button pintent={Intent.PRIMARY} icon={IconNames.CLIPBOARD} onClick={copy}>Copy</Button>
                <NavbarDivider />
                <AnchorButton href={editUrl} text="Edit application" taget="__blank" icon={IconNames.EDIT} />
            </NavbarGroup>
        );
    }
}