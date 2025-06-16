import {
  Masthead,
  MastheadBrand,
  MastheadContent,
  MastheadLogo,
  MastheadMain,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import { FunctionComponent } from 'react';
import logo from '../../assets/logo-kaoto.png';
import { SchemaSelector } from '../schema-selector/SchemaSelector';
import './TopBar.scss';

const DISPLAY = { default: 'inline' } as const;
const ALIGN = { default: 'alignEnd' } as const;
const GAP = { default: 'gapNone', md: 'gapMd' } as const;

export const TopBar: FunctionComponent = () => {
  return (
    <Masthead id="stack-inline-masthead" display={DISPLAY}>
      <MastheadMain>
        <MastheadBrand data-codemods>
          <MastheadLogo data-codemods className="masthead-logo">
            <img className="shell__logo" src={logo} alt="Kaoto Logo" />
          </MastheadLogo>
        </MastheadBrand>
      </MastheadMain>

      <MastheadContent>
        <Toolbar>
          <ToolbarContent>
            <ToolbarGroup variant="action-group-plain" align={ALIGN} gap={GAP}>
              <ToolbarItem>
                <SchemaSelector />
              </ToolbarItem>
            </ToolbarGroup>
          </ToolbarContent>
        </Toolbar>
      </MastheadContent>
    </Masthead>
  );
};
