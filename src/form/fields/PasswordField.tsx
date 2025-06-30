import { Button, TextInputGroup, TextInputGroupMain, TextInputGroupUtilities } from '@patternfly/react-core';
import { EyeIcon, EyeSlashIcon } from '@patternfly/react-icons';
import { FunctionComponent, useCallback, useContext, useRef, useState } from 'react';
import { useFieldValue } from '../hooks/field-value';
import { useSuggestions } from '../hooks/suggestions';
import { FieldProps } from '../models/typings';
import { SchemaContext } from '../providers/SchemaProvider';
import { isDefined, isRawString } from '../utils';
import { FieldActions } from './FieldActions';
import { FieldWrapper } from './FieldWrapper';

export const PasswordField: FunctionComponent<FieldProps> = ({ propName, required, onRemove: onRemoveProps }) => {
  const { schema } = useContext(SchemaContext);
  const [passwordHidden, setPasswordHidden] = useState<boolean>(true);
  const { value = '', errors, disabled, isRaw, onChange } = useFieldValue<string>(propName);

  const lastPropName = propName.split('.').pop();
  const clearButtonAriaLabel = isDefined(onRemoveProps) ? 'Remove' : `Clear ${lastPropName} field`;
  const toggleRawAriaLabel = `Toggle RAW wrap for ${lastPropName} field`;
  const inputRef = useRef<HTMLInputElement>(null);

  const onFieldChange = useCallback(
    (_event: unknown, value: string) => {
      onChange(value);
    },
    [onChange],
  );

  const onRemove = () => {
    if (isDefined(onRemoveProps)) {
      onRemoveProps(propName);
      return;
    }

    /** Clear field by removing its value */
    onChange(undefined as unknown as string);
    inputRef.current?.focus();
  };

  const toggleRawValueWrap = () => {
    if (typeof value !== 'string') return;

    const newValue = isRawString(value) ? value.substring(4, value.length - 1) : `RAW(${value})`;
    onChange(newValue);
  };

  const setValue = useCallback(
    (value: string | number) => {
      onFieldChange(null, value.toString());
    },
    [onFieldChange],
  );

  const suggestions = useSuggestions({
    propName,
    schema,
    inputRef,
    value,
    setValue,
  });

  const id = `${propName}-popover`;

  return (
    <FieldWrapper
      propName={propName}
      required={required}
      title={schema.title}
      type="secret"
      description={schema.description}
      defaultValue={schema.default?.toString()}
      errors={errors}
      isRaw={isRaw}
    >
      <TextInputGroup validated={errors ? 'error' : undefined} isDisabled={disabled}>
        <TextInputGroupMain
          type={passwordHidden ? 'password' : 'text'}
          role="textbox"
          id={propName}
          name={propName}
          placeholder={schema.default?.toString()}
          value={value}
          onChange={onFieldChange}
          aria-label={schema.title}
          aria-describedby={id}
          ref={inputRef}
        />

        {suggestions}

        <TextInputGroupUtilities>
          <Button
            variant="plain"
            data-testid={`${propName}__toggle-visibility`}
            aria-label={passwordHidden ? `Show ${lastPropName} value` : `Hide ${lastPropName} value`}
            onClick={() => {
              setPasswordHidden(!passwordHidden);
            }}
          >
            {passwordHidden ? <EyeIcon /> : <EyeSlashIcon />}
          </Button>

          <FieldActions
            propName={propName}
            clearAriaLabel={clearButtonAriaLabel}
            toggleRawAriaLabel={toggleRawAriaLabel}
            onRemove={onRemove}
            toggleRawValueWrap={toggleRawValueWrap}
          />
        </TextInputGroupUtilities>
      </TextInputGroup>
    </FieldWrapper>
  );
};
