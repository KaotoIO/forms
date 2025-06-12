import { Page, PageSection } from '@patternfly/react-core';
import { FunctionComponent, PropsWithChildren } from 'react';
import './Shell.scss';
import { TopBar } from './TopBar';

export const Shell: FunctionComponent<PropsWithChildren> = (props) => {
  return (
    <Page isContentFilled masthead={<TopBar />}>
      <PageSection isFilled hasBodyWrapper={false} className="shell__page-section">
        {props.children}
      </PageSection>
    </Page>
  );
};
