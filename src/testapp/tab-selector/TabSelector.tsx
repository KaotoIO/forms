import { ToggleGroup, ToggleGroupItem } from '@patternfly/react-core';
import { FunctionComponent, useContext } from 'react';
import { CanvasFormTabsContext, FormTabsModes } from '../../form/providers/canvas-form-tabs.provider';

export const TabSelector: FunctionComponent = () => {
  const { selectedTab, setSelectedTab } = useContext(CanvasFormTabsContext);

  return (
    <ToggleGroup>
      <ToggleGroupItem
        title={FormTabsModes.All}
        text="All"
        buttonId="All"
        isSelected={selectedTab === 'All'}
        onChange={() => {
          setSelectedTab('All');
        }}
      />
      <ToggleGroupItem
        title={FormTabsModes.Required}
        text="Required"
        buttonId="Required"
        isSelected={selectedTab === 'Required'}
        onChange={() => {
          setSelectedTab('Required');
        }}
      />
      <ToggleGroupItem
        title={FormTabsModes.Modified}
        text="Modified"
        buttonId="Modified"
        isSelected={selectedTab === 'Modified'}
        onChange={() => {
          setSelectedTab('Modified');
        }}
      />
    </ToggleGroup>
  );
};
