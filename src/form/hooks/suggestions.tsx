import { Menu, MenuContent, MenuItem, MenuList, Popper, SearchInput } from '@patternfly/react-core';
import { JSONSchema4 } from 'json-schema';
import { ReactNode, RefObject, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { GroupedSuggestions, Suggestion, SuggestionProvider } from '../models/suggestions';
import { SuggestionContext } from '../providers';
import { applySuggestion } from '../utils/apply-suggestion';
import { getCursorWord } from '../utils/get-cursor-word';

type UseSuggestionsProps = {
  propName: string;
  schema: JSONSchema4;
  inputRef: RefObject<HTMLInputElement | HTMLTextAreaElement>;
  value: string | number;
  setValue?: (value: string) => void;
};
export const useSuggestions = ({ propName, schema, inputRef, value, setValue }: UseSuggestionsProps): ReactNode => {
  const [isVisible, setIsVisible] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [groupedSuggestions, setGroupedSuggestions] = useState<GroupedSuggestions>({ root: [] });
  const menuRef = useRef<HTMLDivElement>(null);
  const firstElementRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { getProviders } = useContext(SuggestionContext);

  const suggestionProviders: SuggestionProvider[] = useMemo(
    () => getProviders(propName, schema),
    [getProviders, propName, schema],
  );

  const onEscapeKey = useCallback(
    (event: React.KeyboardEvent | KeyboardEvent) => {
      event.preventDefault();
      setIsVisible(false);
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    },
    [inputRef],
  );

  const handleInputKeyDown = useCallback(
    (event: Event) => {
      if (!(event instanceof KeyboardEvent)) return;

      if (event.ctrlKey && event.code === 'Space') {
        event.preventDefault();
        setSearchValue('');
        setIsVisible(true);
        requestAnimationFrame(() => {
          firstElementRef.current?.focus();
          firstElementRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
        });
      } else if (event.key === 'Escape') {
        onEscapeKey(event);
      }
    },
    [onEscapeKey],
  );

  const getHandleOnClick = useCallback(
    (inputValue: string | number, suggestion: Suggestion) => () => {
      const { newValue, cursorPosition } = applySuggestion(suggestion, inputValue, inputRef.current?.selectionStart);

      setIsVisible(false);
      setValue?.(newValue);

      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(cursorPosition, cursorPosition);
    },
    [inputRef, setValue],
  );

  const getHandleMenuKeyDown = useCallback(
    (inputValue: string | number, suggestion?: Suggestion) => (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' && suggestion) {
        event.preventDefault();
        getHandleOnClick(inputValue, suggestion)();
      } else if (event.key === 'Escape') {
        onEscapeKey(event);
      }
    },
    [getHandleOnClick, onEscapeKey],
  );

  /** Fetch suggestions from providers */
  useEffect(() => {
    let cancelled = false;
    if (!isVisible) return;

    const fetchSuggestions = async () => {
      const cursorPosition = inputRef.current?.selectionStart;
      const { word } = getCursorWord(value, cursorPosition);

      const results = await Promise.all(
        suggestionProviders.map((provider) =>
          Promise.resolve(
            provider.getSuggestions(word, {
              propertyName: propName,
              inputValue: value,
              cursorPosition,
            }),
          ),
        ),
      );

      if (cancelled) return;

      const lowerCaseSearchValue = searchValue.toLocaleLowerCase();
      const newGroupedSuggestions = results
        .flat()
        .filter((suggestion) => {
          return suggestion.value.toLocaleLowerCase().includes(lowerCaseSearchValue);
        })
        .reduce(
          (acc, suggestion) => {
            const group = suggestion.group ?? 'root';
            acc[group] ??= [];
            acc[group].push(suggestion);
            return acc;
          },
          { root: [] } as GroupedSuggestions,
        );
      setGroupedSuggestions(newGroupedSuggestions);
    };

    fetchSuggestions();
    return () => {
      cancelled = true;
    };
  }, [suggestionProviders, value, propName, inputRef, isVisible, searchValue]);

  /** Register keyboard bindings */
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    const handleFocus = () => {
      input.addEventListener('keydown', handleInputKeyDown);
    };
    const handleBlur = () => {
      input.removeEventListener('keydown', handleInputKeyDown);
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
      input.removeEventListener('keydown', handleInputKeyDown);
    };
  }, [handleInputKeyDown, inputRef]);

  const focusOnSearchInput = useCallback(() => {
    searchInputRef.current?.focus();
  }, []);

  const handleOnSearchChange = useCallback((_event: unknown, value: string) => {
    setSearchValue(value);
  }, []);

  return (
    <Popper
      preventOverflow
      maxWidth="trigger"
      isVisible={isVisible}
      triggerRef={inputRef}
      popperRef={menuRef}
      popper={
        <div ref={menuRef}>
          <Menu containsFlyout data-testid="suggestions-menu">
            <MenuContent>
              <MenuList>
                <MenuItem data-testid="suggestions-menu-search-item" onFocus={focusOnSearchInput}>
                  <SearchInput
                    data-testid="suggestions-menu-search-input"
                    ref={searchInputRef}
                    placeholder="Filter suggestions..."
                    value={searchValue}
                    onChange={handleOnSearchChange}
                    onKeyDown={getHandleMenuKeyDown('')}
                  />
                </MenuItem>

                {Object.entries(groupedSuggestions).map(([group, suggestions], groupIndex) => {
                  if (group === 'root') {
                    return suggestions.map((suggestion, suggestionIndex) => {
                      const isFirst = groupIndex === 0 && suggestionIndex === 0;
                      return (
                        <MenuItem
                          ref={isFirst ? firstElementRef : null}
                          key={suggestion.value}
                          onClick={getHandleOnClick(value, suggestion)}
                          onKeyDown={getHandleMenuKeyDown(value, suggestion)}
                          description={suggestion.description}
                        >
                          {suggestion.value}
                        </MenuItem>
                      );
                    });
                  }

                  return (
                    <MenuItem
                      ref={groupIndex === 0 ? firstElementRef : null}
                      key={group}
                      flyoutMenu={
                        <Menu containsFlyout isScrollable>
                          <MenuContent>
                            <MenuList>
                              {suggestions.map((suggestion) => (
                                <MenuItem
                                  key={suggestion.value}
                                  onClick={getHandleOnClick(value, suggestion)}
                                  onKeyDown={getHandleMenuKeyDown(value, suggestion)}
                                  description={suggestion.description}
                                >
                                  {suggestion.value}
                                </MenuItem>
                              ))}
                            </MenuList>
                          </MenuContent>
                        </Menu>
                      }
                    >
                      <strong>{group}</strong>
                    </MenuItem>
                  );
                })}

                {groupedSuggestions.root.length === 0 && Object.keys(groupedSuggestions).length === 1 && (
                  <MenuItem isDisabled>No suggestions available</MenuItem>
                )}
              </MenuList>
            </MenuContent>
          </Menu>
        </div>
      }
    />
  );
};
