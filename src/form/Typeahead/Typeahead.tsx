import { ComboBox } from '@carbon/react';
import type { OnChangeData as ComboOnChangeData } from '@carbon/react/lib/components/ComboBox/ComboBox';
import { FunctionComponent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { isDefined } from '../utils';
import { TypeaheadProps } from './Typeahead.types';

export const CREATE_NEW_ITEM = 'create-new-with-name';

export const Typeahead: FunctionComponent<TypeaheadProps> = ({
  selectedItem,
  items: itemsProps,
  id,
  placeholder = 'Select or write an option',
  onChange,
  onCleanInput,
  'aria-label': ariaLabel,
  'data-testid': dataTestId,
  onCreate,
  onCreatePrefix,
  disabled = false,
  allowCustomInput = false,
}) => {
  const [inputValue, setInputValue] = useState<string>(selectedItem?.name ?? '');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const customInputHandledRef = useRef<boolean>(false);
  const inputValueRef = useRef<string>(inputValue);

  const items = useMemo(() => {
    const isValueInArray = isDefined(itemsProps.find((item) => item.name === selectedItem?.name));
    const localArray = itemsProps.slice();
    if (isValueInArray) {
      return localArray;
    }
    if (selectedItem?.name && selectedItem?.value) {
      localArray.unshift({ name: selectedItem.name, value: selectedItem.value });
    }

    return localArray;
  }, [itemsProps, selectedItem?.name, selectedItem?.value]);

  useEffect(() => {
    if (selectedItem?.name) {
      setInputValue(selectedItem.name);
      inputValueRef.current = selectedItem.name;
    }
  }, [selectedItem]);

  useEffect(() => {
    if (!allowCustomInput || !wrapperRef.current) return;

    const input = wrapperRef.current.querySelector('input[role="combobox"]') as HTMLInputElement;
    if (!input) return;

    const handleKeyDown = (e: Event) => {
      const keyboardEvent = e as KeyboardEvent;
      const currentValue = inputValueRef.current;
      if (keyboardEvent.key === 'Enter' && currentValue.trim()) {
        const isExistingItem = items.some((item) => item.name === currentValue);
        const isCreateNew = currentValue.includes('Create new');
        if (!isExistingItem && !isCreateNew) {
          keyboardEvent.preventDefault();
          keyboardEvent.stopPropagation();
          customInputHandledRef.current = true;
          const customItem = { name: currentValue, value: currentValue, description: '' };
          onChange?.(customItem);
        }
      }
    };

    const handleBlur = () => {
      const currentValue = inputValueRef.current;
      if (currentValue.trim()) {
        const isExistingItem = items.some((item) => item.name === currentValue);
        const isCreateNew = currentValue.includes('Create new');
        if (!isExistingItem && !isCreateNew) {
          customInputHandledRef.current = true;
          const customItem = { name: currentValue, value: currentValue, description: '' };
          onChange?.(customItem);
        }
      }
    };

    input.addEventListener('keydown', handleKeyDown, { capture: true });
    input.addEventListener('blur', handleBlur);

    return () => {
      input.removeEventListener('keydown', handleKeyDown, { capture: true });
      input.removeEventListener('blur', handleBlur);
    };
  }, [allowCustomInput, inputValue, items, selectedItem, onChange]);

  const handleChange = useCallback(
    (data: ComboOnChangeData<{ id: string; text: string }>) => {
      const selected = data.selectedItem ?? null;

      if (customInputHandledRef.current) {
        return;
      }

      if (!selected) {
        if (allowCustomInput) {
          if (!inputValue || !inputValue.trim()) {
            setInputValue('');
            return;
          }
          onCleanInput?.();
          return;
        }
        onChange?.(undefined);
        setInputValue('');
        onCleanInput?.();
        return;
      }

      if (selected.id === CREATE_NEW_ITEM) {
        onCreate?.(selected.id, inputValue);
        return;
      }

      const selectedFromItems = items.find((item) => String(item.value) === selected.id && item.name === selected.text);

      if (selectedFromItems) {
        setInputValue(selectedFromItems.name);
        onChange?.(selectedFromItems);
        return;
      }

      const selectedById = items.find((item) => String(item.value) === selected.id);
      if (selectedById) {
        setInputValue(selectedById.name);
        onChange?.(selectedById);
        return;
      }

      if (allowCustomInput && selected.text && selected.text.trim()) {
        const customItem = { name: selected.text, value: selected.text, description: '' };
        onChange?.(customItem);
      }
    },
    [onChange, items, onCreate, inputValue, allowCustomInput, onCleanInput],
  );

  const handleInputChange = useCallback((inputValue: string) => {
    setInputValue(inputValue);
    inputValueRef.current = inputValue;
  }, []);

  const comboBoxItems = useMemo(() => {
    const mappedItems = items.map((item) => ({
      id: String(item.value),
      text: item.name,
      description: item.description,
    }));

    if (onCreate && inputValue && inputValue.trim()) {
      const createNewText = onCreatePrefix
        ? `Create new ${onCreatePrefix} '${inputValue}'`
        : `Create new ${onCreatePrefix ?? ''}`;

      const createNewItem = {
        id: CREATE_NEW_ITEM,
        text: createNewText.trim(),
        description: '',
      };
      mappedItems.push(createNewItem);
    }

    return mappedItems;
  }, [items, onCreate, onCreatePrefix, inputValue]);

  const selectedComboBoxItem = useMemo(() => {
    return selectedItem ? { id: String(selectedItem.value), text: selectedItem.name } : null;
  }, [selectedItem]);

  return (
    <div ref={wrapperRef}>
      <ComboBox
        id={id ?? `typeahead-${dataTestId}`}
        titleText=""
        placeholder={placeholder}
        items={comboBoxItems}
        itemToString={(item) => (item ? item.text : '')}
        selectedItem={selectedComboBoxItem}
        onChange={handleChange}
        onInputChange={handleInputChange}
        disabled={disabled}
        aria-label={ariaLabel}
        data-testid={dataTestId}
        allowCustomValue={allowCustomInput}
        shouldFilterItem={(menu) => {
          if (menu?.item?.id === CREATE_NEW_ITEM) {
            return true;
          }
          if (!inputValue) return true;
          return menu?.item?.text?.toLowerCase().includes(inputValue.toLowerCase()) ?? false;
        }}
      />
    </div>
  );
};
