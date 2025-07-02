import { TextInputGroup, TextInputGroupMain } from '@patternfly/react-core';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import { IDataTestID } from '../models';
import { useSuggestions } from '../hooks/suggestions';
import { JSONSchema4 } from 'json-schema';

interface KeyValueFieldProps extends IDataTestID {
  id: string;
  name: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

const STRING_SCHEMA: JSONSchema4 = { type: 'string' };

export const KeyValueField = forwardRef<HTMLInputElement, KeyValueFieldProps>(
  ({ id, name, placeholder, value, 'data-testid': dataTestId, onChange, onFocus, onBlur }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    const suggestions = useSuggestions({
      propName: name,
      schema: STRING_SCHEMA,
      inputRef,
      value: value ?? '',
      setValue: onChange,
    });

    return (
      <TextInputGroup>
        <TextInputGroupMain
          type="text"
          id={id}
          name={name}
          data-testid={dataTestId}
          onChange={(_event, value) => {
            onChange?.(value);
          }}
          ref={inputRef}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          value={value}
        />

        {suggestions}
      </TextInputGroup>
    );
  },
);
