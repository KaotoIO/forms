import { Menu, MenuContent, MenuItem, MenuList, Popper } from '@patternfly/react-core';
import { JSONSchema4 } from 'json-schema';
import { ReactNode, RefObject, useEffect, useMemo, useRef, useState } from 'react';
import { Suggestion, SuggestionProvider } from '../models/suggestions';
import { useSuggestionRegistry } from '../providers';

type UseSuggestionsProps = {
  propName: string;
  schema: JSONSchema4;
  inputRef: RefObject<HTMLInputElement>;
  inputValue: unknown;
};
export const useSuggestions = ({ propName, schema, inputRef, inputValue }: UseSuggestionsProps): ReactNode => {
  const [isVisible, setIsVisible] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const suggestionsRegistry = useSuggestionRegistry();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  const suggestionProviders: SuggestionProvider[] = useMemo(
    () => suggestionsRegistry?.getProviders(propName, schema) ?? [],
    [suggestionsRegistry, propName, schema],
  );

  useEffect(() => {
    let cancelled = false;
    const fetchSuggestions = async () => {
      const results = await Promise.all(
        suggestionProviders.map((provider) => Promise.resolve(provider.getSuggestions(propName, inputValue))),
      );
      if (!cancelled) {
        setSuggestions(results.flat());
      }
    };
    fetchSuggestions();
    return () => {
      cancelled = true;
    };
  }, [suggestionProviders, inputValue, propName]);

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.code === 'Space') {
        e.preventDefault();
        setIsVisible(true);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setIsVisible(false);
      }
    };

    const handleFocus = () => {
      input.addEventListener('keydown', handleKeyDown);
    };
    const handleBlur = () => {
      input.removeEventListener('keydown', handleKeyDown);
    };

    input.addEventListener('focus', handleFocus);
    input.addEventListener('blur', handleBlur);

    // If already focused, register immediately
    if (document.activeElement === input) {
      handleFocus();
    }

    return () => {
      input.removeEventListener('focus', handleFocus);
      input.removeEventListener('blur', handleBlur);
      input.removeEventListener('keydown', handleKeyDown);
    };
  }, [inputRef]);

  const menu = (
    <div ref={menuRef}>
      <Menu>
        <MenuContent>
          <MenuList>
            {suggestions.map((suggestion, index) => (
              <MenuItem
                key={index}
                onClick={() => {
                  // inputRef.current?.value = suggestion.value;
                  setIsVisible(false);
                  inputRef.current?.focus();
                }}
                description={suggestion.description}
              >
                {suggestion.label || suggestion.value}
              </MenuItem>
            ))}
            {suggestions.length === 0 && <MenuItem isDisabled>No suggestions available</MenuItem>}
          </MenuList>
        </MenuContent>
      </Menu>
    </div>
  );

  return (
    <Popper
      // trigger={inputGroup}
      triggerRef={inputRef}
      popper={menu}
      popperRef={menuRef}
      isVisible={isVisible}
      // onDocumentClick={handleClick}
    />
  );
};
