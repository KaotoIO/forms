import { act, renderHook } from '@testing-library/react';
import { JSONSchema4 } from 'json-schema';
import { PropsWithChildren } from 'react';
import { ModelContextProvider } from '../providers/ModelProvider';
import { SchemaProvider } from '../providers/SchemaProvider';
import { ROOT_PATH } from '../utils';
import { useOneOfField } from './one-of-field';

describe('useOneOfField', () => {
  const schema: JSONSchema4 = {
    oneOf: [
      { type: 'object', properties: { simple: { type: 'string' } } },
      { type: 'object', properties: { constant: { type: 'string' } } },
    ],
  };

  it('selects the matching variant when display titles are duplicated', () => {
    const duplicateTitlesSchema: JSONSchema4 = {
      oneOf: [
        { title: 'Expression', type: 'object', properties: { simple: { type: 'string' } } },
        { title: 'Expression', type: 'object', properties: { constant: { type: 'string' } } },
      ],
    };
    const wrapper = ({ children }: PropsWithChildren) => (
      <SchemaProvider schema={duplicateTitlesSchema}>
        <ModelContextProvider model={{ constant: 'value' }} onPropertyChange={jest.fn()}>
          {children}
        </ModelContextProvider>
      </SchemaProvider>
    );
    const { result } = renderHook(() => useOneOfField(ROOT_PATH), { wrapper });
    expect(result.current.selectedOneOfSchema?.schema.properties).toEqual({ constant: { type: 'string' } });
  });

  it('uses updated schema definitions for the selected variant', () => {
    let currentSchema: JSONSchema4 = {
      oneOf: [{ title: 'Simple', type: 'object', properties: { simple: { type: 'string', title: 'Before' } } }],
    };
    const onPropertyChange = jest.fn();
    const wrapper = ({ children }: PropsWithChildren) => (
      <SchemaProvider schema={currentSchema}>
        <ModelContextProvider model={{ simple: '${body}' }} onPropertyChange={onPropertyChange}>
          {children}
        </ModelContextProvider>
      </SchemaProvider>
    );
    const { result, rerender } = renderHook(() => useOneOfField(ROOT_PATH), { wrapper });
    expect(result.current.selectedOneOfSchema?.schema.properties?.simple.title).toBe('Before');

    currentSchema = {
      oneOf: [{ title: 'Simple', type: 'object', properties: { simple: { type: 'string', title: 'After' } } }],
    };
    rerender();
    expect(result.current.selectedOneOfSchema?.name).toBe('Simple');
    expect(result.current.selectedOneOfSchema?.schema.properties?.simple.title).toBe('After');
    expect(onPropertyChange).not.toHaveBeenCalled();
  });

  it('refreshes the selected schema after external model changes without emitting a change', () => {
    let model: unknown = { simple: '${body}' };
    const onPropertyChange = jest.fn();
    const wrapper = ({ children }: PropsWithChildren) => (
      <SchemaProvider schema={schema}>
        <ModelContextProvider model={model} onPropertyChange={onPropertyChange}>
          {children}
        </ModelContextProvider>
      </SchemaProvider>
    );
    const { result, rerender } = renderHook(() => useOneOfField(ROOT_PATH), { wrapper });
    const originalSelection = result.current.selectedOneOfSchema;
    expect(originalSelection?.name).toBe('Simple');

    model = { simple: '${body.name}' };
    rerender();
    expect(result.current.selectedOneOfSchema).toBe(originalSelection);

    model = { constant: 'after' };
    rerender();
    expect(result.current.selectedOneOfSchema?.name).toBe('Constant');
    expect(onPropertyChange).not.toHaveBeenCalled();

    model = undefined;
    rerender();
    expect(result.current.selectedOneOfSchema).toBeUndefined();
    expect(onPropertyChange).not.toHaveBeenCalled();

    model = { constant: 'after' };
    rerender();
    act(() => result.current.onSchemaChange());
    expect(result.current.selectedOneOfSchema).toBeUndefined();
    expect(onPropertyChange).toHaveBeenLastCalledWith(ROOT_PATH, {});

    act(() => result.current.onSchemaChange(result.current.oneOfSchemas[0]));
    expect(result.current.selectedOneOfSchema?.name).toBe('Simple');
    expect(onPropertyChange).toHaveBeenLastCalledWith(ROOT_PATH, { simple: {} });

    expect(onPropertyChange).toHaveBeenCalledTimes(2);
  });
});
