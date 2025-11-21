import { Layer, Menu, MenuItem, MenuItemGroup, MenuItemSelectable, Search } from '@carbon/react';
import { JSONSchema4 } from 'json-schema';
import {
  ReactNode,
  RefObject,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  ChangeEvent,
} from 'react';
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
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const firstElementRef = useRef<HTMLLIElement>(null);
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

      if ((event.ctrlKey && event.code === 'Space') || (event.altKey && event.code === 'Escape')) {
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
    (inputValue: string | number, suggestion?: Suggestion, isFirst?: boolean) => (event: React.KeyboardEvent) => {
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

  const handleOnSearchChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    setSearchValue(event.target.value);
  }, []);

  const handleSearchKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        firstElementRef.current?.focus();
        return;
      }

      if (event.key !== 'Escape' && event.key !== 'Enter') {
        event.stopPropagation();
      }
      if (event.key === 'Escape') {
        onEscapeKey(event);
      }
    },
    [onEscapeKey],
  );

  useEffect(() => {
    if (!isVisible || !inputRef.current) return;

    const inputElement = inputRef.current;
    const rect = inputElement.getBoundingClientRect();

    setMenuPosition({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
    });

    requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });
  }, [isVisible, inputRef]);

  useEffect(() => {
    if (!isVisible) return;

    requestAnimationFrame(() => {
      if (document.activeElement !== searchInputRef.current) {
        searchInputRef.current?.focus();
      }
    });
  }, [isVisible, groupedSuggestions]);

  if (!isVisible) return null;

  return (
    <Layer level={1}>
      <div ref={menuRef} data-testid="suggestions-menu">
        <Menu
          style={{
            position: 'absolute',
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
          }}
          x={menuPosition.left}
          y={menuPosition.top}
          open
          label="Suggestions"
        >
          <Search
            data-testid="suggestions-menu-search-input"
            ref={searchInputRef}
            placeholder="Filter suggestions..."
            value={searchValue}
            onChange={handleOnSearchChange}
            onKeyDown={handleSearchKeyDown}
            labelText=""
            size="sm"
            onFocus={focusOnSearchInput}
          />
          {Object.entries(groupedSuggestions).map(([group, suggestions], groupIndex) => {
            if (suggestions.length === 0) return null;

            if (group === 'root') {
              return suggestions.map((suggestion, suggestionIndex) => {
                const isFirst = groupIndex === 0 && suggestionIndex === 0;
                return (
                  <MenuItem
                    ref={isFirst ? firstElementRef : null}
                    key={suggestion.value}
                    label={String(suggestion.value)}
                    aria-label={String(suggestion.value)}
                    onClick={getHandleOnClick(value, suggestion)}
                    onKeyDown={getHandleMenuKeyDown(value, suggestion, isFirst)}
                  />
                );
              });
            } else {
              return (
                <MenuItem label={group} key={group} title={group}>
                  {suggestions.map((suggestion, suggestionIndex) => {
                    const isFirst = groupIndex === 0 && suggestionIndex === 0;
                    return (
                      <MenuItem
                        ref={isFirst ? firstElementRef : null}
                        key={suggestion.value}
                        label={String(suggestion.value)}
                        aria-label={String(suggestion.value)}
                        onClick={getHandleOnClick(value, suggestion)}
                        onKeyDown={getHandleMenuKeyDown(value, suggestion, isFirst)}
                      />
                    );
                  })}
                </MenuItem>
              );
            }
          })}

          {groupedSuggestions.root.length === 0 && Object.keys(groupedSuggestions).length === 1 && (
            <MenuItem label="No suggestions available" disabled />
          )}
        </Menu>
      </div>
    </Layer>
  );
};
