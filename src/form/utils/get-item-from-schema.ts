import { JSONSchema7, JSONSchema7Definition } from 'json-schema';
import { resolveSchemaWithRef } from './resolve-schema-with-ref';

export const getItemFromSchema = (schema: JSONSchema7, definitions: JSONSchema7Definition) => {
  const resolvedSchema = resolveSchemaWithRef(schema, definitions);
  const defaultValue = resolvedSchema.default;
  const properties = resolvedSchema.properties ?? {};
  const required = Array.isArray(resolvedSchema.required) ? resolvedSchema.required : [];

  switch (resolvedSchema.type) {
    case 'string':
      return defaultValue ?? '';
    case 'boolean':
      return defaultValue ?? false;
    case 'number':
      return defaultValue ?? 0;
    case 'object':
      return Object.entries(properties).reduce(
        (acc, [key, value]) => {
          if (required.includes(key)) {
            acc[key] = getItemFromSchema(value as JSONSchema7, definitions);
          }

          return acc;
        },
        {} as Record<string, unknown>,
      );
    default:
      return {};
  }
};
