import { Button, Content, Split, SplitItem, TextInputGroup, TextInputGroupMain } from '@patternfly/react-core';
import { PlusIcon, TrashIcon } from '@patternfly/react-icons';
import { FunctionComponent, useRef, useState } from 'react';
import { KeyValueField } from './KeyValueField';

export type KeyValueType = Record<string, string>;

interface KeyValueProps {
  propName: string;
  initialModel?: KeyValueType;
  onChange: (model: KeyValueType) => void;
  disabled?: boolean;
  isOrdered?: boolean;
}

type KeyValueEntry = [string, string];

/**
 * This component manages an ordered map with numeric string keys, after adding and removing values keys are re-indexed.
 * Internally it uses an array of tuples to represent the key-value pairs,
 * and it converts it to an object when calling the onChange callback.
 */
export const IndexedValue: FunctionComponent<KeyValueProps> = ({
  propName,
  initialModel,
  onChange,
  disabled = false,
}) => {
  const [internalModel, setInternalModel] = useState<KeyValueEntry[]>(Object.entries(initialModel ?? {}));
  const currentFocusIndex = useRef<['key' | 'value', number]>(['key', -1]);

  const getFocusRefFn = (location: 'value', index: number) => (inputElement: HTMLInputElement | null) => {
    if (inputElement && location === currentFocusIndex.current[0] && index === currentFocusIndex.current[1]) {
      inputElement.focus();
    }
  };

  const updateModel = (newModel: KeyValueEntry[]) => {
    setInternalModel(newModel);
    onChange(Object.fromEntries(newModel));
  };

  const onAddNewProperty = () => {
    const newKeyValue: KeyValueEntry = [internalModel.length.toString(), ''];
    const newModel = internalModel.map((value, index) => [index.toString(), value[1]] as KeyValueEntry);
    newModel.push(newKeyValue);

    currentFocusIndex.current = ['value', internalModel.length];
    updateModel(newModel);
  };

  const onRemoveProperty = (key: string) => {
    const newModel = internalModel
      .filter(([k]) => k !== key)
      .map((value, index) => [index.toString(), value[1]] as KeyValueEntry);
    updateModel(newModel);
  };

  const onPropertyValueChange = (key: string, newValue: string) => {
    const newModel = internalModel.map(([k, v]): KeyValueEntry => (k === key ? [k, newValue] : [k, v]));
    updateModel(newModel);
  };

  return (
    <>
      <Split hasGutter>
        <SplitItem isFilled>Index</SplitItem>
        <SplitItem isFilled>Argument Value</SplitItem>
        <SplitItem>
          <Button
            variant="plain"
            data-testid={`${propName}__add`}
            onClick={onAddNewProperty}
            aria-label="Add a new property"
            title="Add a new property"
            icon={<PlusIcon />}
            isDisabled={disabled}
          />
        </SplitItem>
      </Split>

      <Content component="hr" />

      {/* In this iteration, it's ok to use the `id` of the element because using the `key` will
        cause for the input to lose focus when the list is updated. */}
      {internalModel.map(([key, value], index) => {
        return (
          <Split hasGutter key={index}>
            <SplitItem isFilled>
              <span data-testid={`${propName}__index`}>{key}</span>
            </SplitItem>

            <SplitItem isFilled>
              <KeyValueField
                id={`${propName}__${key}__value`}
                name={`${propName}__${key}__value`}
                data-testid={`${propName}__value`}
                onChange={(value) => {
                  onPropertyValueChange(key, value);
                }}
                ref={getFocusRefFn('value', index)}
                onFocus={() => {
                  currentFocusIndex.current = ['value', index];
                }}
                onBlur={() => {
                  currentFocusIndex.current = ['value', -1];
                }}
                placeholder="Write a value"
                value={value}
              />
            </SplitItem>

            <SplitItem>
              <Button
                variant="plain"
                data-testid={`${propName}__remove__${key}`}
                onClick={() => {
                  onRemoveProperty(key);
                }}
                aria-label={`Remove the ${key} property`}
                title={`Remove the ${key} property`}
                icon={<TrashIcon />}
              />
            </SplitItem>
          </Split>
        );
      })}
    </>
  );
};
