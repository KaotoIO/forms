import { InlineNotification, Link, Tile } from '@carbon/react';
import { FunctionComponent, useContext } from 'react';
import { CanvasFormTabsContext } from '../providers/canvas-form-tabs.provider';

export const NoFieldFound: FunctionComponent<{ className?: string }> = (props) => {
  const canvasFormTabsContext = useContext(CanvasFormTabsContext);

  return (
    <Tile data-testid="no-field-found" className={props.className}>
      <InlineNotification
        kind="info"
        title={`No ${canvasFormTabsContext.selectedTab} fields found`}
        subtitle="No field found matching this criteria. Please switch to the All tab."
        hideCloseButton
      >
        <Link
          onClick={() => {
            canvasFormTabsContext.setSelectedTab('All');
          }}
          inline
        >
          Switch to All tab
        </Link>
      </InlineNotification>
    </Tile>
  );
};
