import { JSONSchema4 } from 'json-schema';

export const getNormalizedSchema = (schema: JSONSchema4): JSONSchema4 => {
  /**
   * Expressions are stored in a oneOf array bigger than 3 elements.
   * Otherwise, it might be a nested structure of anyOf / oneOf.
   */
  if (Array.isArray(schema.oneOf) && schema.oneOf.length > 3) {
    return schema;
  }

  if (Array.isArray(schema.anyOf) && schema.anyOf.length > 0) {
    return getNormalizedSchema(schema.anyOf[0]);
  } else if (Array.isArray(schema.oneOf)) {
    return getNormalizedSchema(schema.oneOf[0]);
  }

  return {};
};
