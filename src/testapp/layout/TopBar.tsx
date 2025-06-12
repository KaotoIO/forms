import {
  Masthead,
  MastheadBrand,
  MastheadContent,
  MastheadLogo,
  MastheadMain,
  MastheadProps,
} from '@patternfly/react-core';
import { FunctionComponent } from 'react';
import logo from '../assets/logo-kaoto.png';
import './TopBar.scss';

const displayObject: MastheadProps['display'] = {
  default: 'inline',
};

export const TopBar: FunctionComponent = () => {
  return (
    <>
      <Masthead id="stack-inline-masthead" display={displayObject}>
        <MastheadMain>
          <MastheadBrand data-codemods>
            <MastheadLogo data-codemods className="masthead-logo">
              <img className="shell__logo" src={logo} alt="Kaoto Logo" />
            </MastheadLogo>
          </MastheadBrand>
        </MastheadMain>

        <MastheadContent></MastheadContent>
      </Masthead>
    </>
  );
};
