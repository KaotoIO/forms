import { FunctionComponent, useContext } from 'react';
import { useFieldValue } from '../hooks/field-value';
import { FieldProps } from '../models/typings';
import { CanvasFormTabsContext } from '../providers/canvas-form-tabs.provider';
import { FormComponentFactoryContext } from '../providers/context/form-component-factory-context';
import { SchemaContext } from '../providers/SchemaProvider';
import { isDefined } from '../utils';

export const AutoField: FunctionComponent<FieldProps> = ({ propName, required, onRemove }) => {
  const { selectedTab } = useContext(CanvasFormTabsContext);
  const { schema } = useContext(SchemaContext);
  const { value } = useFieldValue<unknown>(propName);
  const formComponentFactory = useContext(FormComponentFactoryContext);

  if (Object.keys(schema).length === 0) {
    throw new Error(`AutoField: schema is not defined for ${propName}`);
  } else if (!isDefined(formComponentFactory)) {
    throw new Error(`AutoField: formComponentFactory is not defined for ${propName}`);
  }

  let isFieldDefined = false;
  if (isDefined(value)) {
    // Check if the value is a valid value
    switch (schema.type) {
      case 'object':
        isFieldDefined = typeof value === 'object' && Object.keys(value).length > 0;
        break;
      case 'array':
        isFieldDefined = Array.isArray(value) && value.length > 0;
        break;
      case 'boolean':
        isFieldDefined = typeof value === 'boolean';
        break;
      case 'string':
      case 'number':
        isFieldDefined = value !== '';
        break;
      default:
        isFieldDefined = true;
    }
  }

  const isComplexFieldType =
    schema.type === 'object' || schema.type === 'array' || 'oneOf' in schema || 'anyOf' in schema;
  // If required is not defined, it is considered as required
  const isFieldRequired = !isDefined(required) || (isDefined(required) && required);
  const isPropertiesField = schema.type === 'object' && Object.keys(schema?.properties ?? {}).length === 0;
  const shouldLoadField = isFieldRequired || (isDefined(value) && isComplexFieldType && !isPropertiesField);

  if ((selectedTab === 'Required' && !shouldLoadField) || (selectedTab === 'Modified' && !isFieldDefined)) {
    return null;
  }

  const FieldComponent = formComponentFactory(schema);

  return <FieldComponent propName={propName} required={required} onRemove={onRemove} />;
};
