import { renderHook } from '@testing-library/react';
import { FunctionComponent, PropsWithChildren, useContext } from 'react';
import { SchemaDefinitionsContext, SchemaDefinitionsProvider } from './SchemaDefinitionsProvider';
import { JSONSchema7 } from 'json-schema';

describe('SchemaDefinitionsProvider', () => {
  it('should have a default value', () => {
    const { result } = renderHook(() => useContext(SchemaDefinitionsContext));

    expect(result.current.definitions).toBeDefined();
    expect(result.current.omitFields).toBeDefined();
  });

  it('should return the provided value', () => {
    const schema: JSONSchema7 = {
      type: 'object',
      properties: {
        test: {
          $ref: '#/definitions/test',
        },
        bar: {
          type: 'string',
        },
      },
      definitions: {
        test: {
          type: 'string',
        },
      },
    };
    const omitFields = ['bar'];

    const wrapper: FunctionComponent<PropsWithChildren> = ({ children }) => (
      <SchemaDefinitionsProvider schema={schema} omitFields={omitFields}>
        {children}
      </SchemaDefinitionsProvider>
    );

    const { result } = renderHook(() => useContext(SchemaDefinitionsContext), { wrapper });

    expect(result.current.definitions).toEqual(schema.definitions);
    expect(result.current.omitFields).toEqual(omitFields);
  });
});
