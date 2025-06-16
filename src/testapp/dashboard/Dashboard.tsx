import { EmptyState, EmptyStateActions, EmptyStateBody, EmptyStateFooter } from '@patternfly/react-core';
import { CubesIcon } from '@patternfly/react-icons';
import { FunctionComponent } from 'react';
import { KaotoForm } from '../../form';
import { Preview } from '../preview/Preview';
import { useCurrentSchema } from '../providers/CurrentSchemaProvider';
import { useModel } from '../providers/ModelProvider';
import { SchemaSelector } from '../schema-selector/SchemaSelector';
import { TabSelector } from '../tab-selector/TabSelector';
import './Dashboard.scss';

export const Dashboard: FunctionComponent = () => {
  const { schema } = useCurrentSchema();
  const { model = {}, setModel } = useModel();

  return (
    <div className="dashboard">
      <div className="dashboard__left">
        <Preview preview={schema?.value} />

        <Preview preview={model} />
      </div>

      <section className="dashboard__divider" />

      <div className="dashboard__right">
        <TabSelector />

        {!schema?.value ? (
          <EmptyState titleText="No schema selected" headingLevel="h4" icon={CubesIcon}>
            <EmptyStateBody>Select an schema to start</EmptyStateBody>
            <EmptyStateFooter>
              <EmptyStateActions>
                <SchemaSelector />
              </EmptyStateActions>
            </EmptyStateFooter>
          </EmptyState>
        ) : (
          <KaotoForm schema={schema.value} model={model} onChange={setModel} />
        )}
      </div>
    </div>
  );
};
