import { FunctionComponent } from 'react';
import { useOneOfField } from '../../hooks/one-of-field';
import { SchemaProvider } from '../../providers/SchemaProvider';
import { FieldProps } from '../../models/typings';
import { AutoField } from '../AutoField';
import { SchemaList } from './SchemaList';
import { ArrayFieldWrapper } from '../ArrayField/ArrayFieldWrapper';

export const OneOfField: FunctionComponent<FieldProps> = ({ propName }) => {
  const { selectedOneOfSchema, oneOfSchemas, onSchemaChange, shouldRender, modelType } = useOneOfField(propName);
  let title = 'Type';
  switch (modelType) {
    case 'dataFormatType':
      title = 'Data Format Type';
      break;
    case 'loadBalancerType':
      title = 'Load Balancer Type';
      break;
    case 'errorHandlerType':
      title = 'Error Handler Type';
      break;
  }

  const onCleanInput = () => {
    onSchemaChange();
  };

  if (!shouldRender) {
    return null;
  }

  return (
    <ArrayFieldWrapper
      propName={propName}
      type="expression"
      title={selectedOneOfSchema?.name ?? title}
      description={selectedOneOfSchema?.description}
      actions={
        <SchemaList
          aria-label={`${propName} oneof list`}
          data-testid={`${propName}__oneof-list`}
          propName={propName}
          selectedSchema={selectedOneOfSchema}
          schemas={oneOfSchemas}
          onChange={onSchemaChange}
          onCleanInput={onCleanInput}
          placeholder={`Select or write the ${title}`}
        />
      }
    >
      {selectedOneOfSchema && (
        <SchemaProvider schema={selectedOneOfSchema.schema}>
          <AutoField propName={propName} />
        </SchemaProvider>
      )}
    </ArrayFieldWrapper>
  );
};
