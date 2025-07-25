import { Button, InputGroup, InputGroupItem, TextArea } from '@patternfly/react-core';
import { TimesIcon } from '@patternfly/react-icons';
import { FunctionComponent, useContext, useRef } from 'react';
import { useFieldValue } from '../hooks/field-value';
import { useSuggestions } from '../hooks/suggestions';
import { FieldProps } from '../models/typings';
import { SchemaContext } from '../providers/SchemaProvider';
import { isDefined } from '../utils';
import { FieldWrapper } from './FieldWrapper';

export const TextAreaField: FunctionComponent<FieldProps> = ({ propName, required, onRemove: onRemoveProps }) => {
  const { schema } = useContext(SchemaContext);
  const { value = '', onChange, disabled } = useFieldValue<string>(propName);
  const lastPropName = propName.split('.').pop();
  const ariaLabel = isDefined(onRemoveProps) ? 'Remove' : `Clear ${lastPropName} field`;
  const rows = Math.max(value.split('\n').length, 2);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const onFieldChange = (_event: unknown, value: string) => {
    onChange(value);
  };

  const onRemove = () => {
    if (isDefined(onRemoveProps)) {
      onRemoveProps(propName);
      return;
    }

    /** Clear field by removing its value */
    onChange(undefined as unknown as string);
  };

  const suggestions = useSuggestions({
    propName,
    schema,
    inputRef: textAreaRef,
    value,
    setValue: onChange,
  });

  const id = `${propName}-popover`;

  return (
    <FieldWrapper
      propName={propName}
      required={required}
      title={schema.title}
      type="string"
      description={schema.description}
      defaultValue={schema.default?.toString()}
    >
      <InputGroup>
        <InputGroupItem isFill>
          <TextArea
            rows={rows}
            type="text"
            role="textbox"
            id={propName}
            name={propName}
            placeholder={schema.default?.toString()}
            value={value}
            onChange={onFieldChange}
            aria-describedby={id}
            isDisabled={disabled}
            ref={textAreaRef}
          />

          {suggestions}
        </InputGroupItem>

        <InputGroupItem>
          <Button
            variant="plain"
            data-testid={`${propName}__clear`}
            onClick={onRemove}
            aria-label={ariaLabel}
            title={ariaLabel}
            icon={<TimesIcon />}
          />
        </InputGroupItem>
      </InputGroup>
    </FieldWrapper>
  );
};
