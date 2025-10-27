import { JSONSchema7, JSONSchema7Definition } from 'json-schema';

export const resolveSchemaWithRef = (schema: JSONSchema7, definitions: JSONSchema7Definition) => {
  if (schema?.$ref === undefined || typeof schema.$ref !== 'string') {
    return schema;
  }

  const { $ref, ...partialWithoutRef } = schema;

  const refPath = $ref.replace('#/definitions/', '');
  const refDefinition = (definitions[refPath] ?? {}) as JSONSchema7;

  return { ...partialWithoutRef, ...refDefinition };
};
