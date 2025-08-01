import { Button } from '@patternfly/react-core';
import { PencilAltIcon, TrashIcon } from '@patternfly/react-icons';
import { FunctionComponent, useContext, useState } from 'react';
import { isDefined, ROOT_PATH } from '../../utils';
import { useFieldValue } from '../../hooks/field-value';
import { SchemaContext } from '../../providers/SchemaProvider';
import { FieldProps } from '../../models/typings';
import { ArrayFieldWrapper } from '../ArrayField/ArrayFieldWrapper';
import { ObjectFieldGrouping } from './ObjectFieldGrouping';

export const ObjectField: FunctionComponent<FieldProps> = ({ propName, onRemove: onRemoveProps }) => {
  const { schema } = useContext(SchemaContext);
  const { value, onChange } = useFieldValue<object>(propName);
  const [isExpanded, setIsExpanded] = useState(isDefined(value));
  const label = schema.title ?? propName.split('.').pop() ?? propName;

  const onSet = () => {
    setIsExpanded(true);
  };

  const onRemove = () => {
    if (isDefined(onRemoveProps)) {
      onRemoveProps(propName);
      return;
    }

    /** Clear field by removing its value */
    onChange(undefined as unknown as object);
    setIsExpanded(false);
  };

  if (propName === ROOT_PATH || (!schema.title && !isDefined(onRemoveProps))) {
    return <ObjectFieldGrouping propName={propName} />;
  }

  return (
    <ArrayFieldWrapper
      propName={propName}
      type="object"
      title={label}
      description={schema.description}
      defaultValue={schema.default}
      actions={
        <>
          {!isExpanded && (
            <Button
              variant="plain"
              data-testid={`${propName}__set`}
              aria-label="Set object"
              title="Set object"
              onClick={onSet}
              icon={<PencilAltIcon />}
            />
          )}

          {isExpanded && (
            <Button
              variant="plain"
              data-testid={`${propName}__remove`}
              aria-label="Remove object"
              title="Remove object"
              onClick={onRemove}
              icon={<TrashIcon />}
            />
          )}
        </>
      }
    >
      {isExpanded && <ObjectFieldGrouping propName={propName} />}
    </ArrayFieldWrapper>
  );
};
