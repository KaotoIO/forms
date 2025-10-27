import { JSONSchema7, JSONSchema7Definition } from 'json-schema';
import { createContext, FunctionComponent, PropsWithChildren, useMemo } from 'react';

interface SchemaDefinitionsContextValue {
  definitions: JSONSchema7Definition;
  omitFields: string[];
}

export const SchemaDefinitionsContext = createContext<SchemaDefinitionsContextValue>({
  definitions: {},
  omitFields: [],
});

export const SchemaDefinitionsProvider: FunctionComponent<
  PropsWithChildren<{ schema: JSONSchema7; omitFields: string[] }>
> = ({ schema, omitFields, children }) => {
  const value = useMemo(() => {
    const definitions: SchemaDefinitionsContextValue['definitions'] = schema.definitions ?? {};

    return { definitions, omitFields };
  }, [omitFields, schema.definitions]);

  return <SchemaDefinitionsContext.Provider value={value}>{children}</SchemaDefinitionsContext.Provider>;
};
