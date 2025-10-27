import { JSONSchema7, JSONSchema7Definition } from 'json-schema';
import { camelCaseToSpaces } from './camel-case-to-space';
import { isDefined } from './is-defined';
import { resolveSchemaWithRef } from './resolve-schema-with-ref';

export interface OneOfSchemas {
  name: string;
  description?: string;
  schema: JSONSchema7;
}

export const getOneOfSchemaList = (
  oneOfList: JSONSchema7[],
  definitions: JSONSchema7Definition = {},
): OneOfSchemas[] => {
  const list = oneOfList
    /** Ignore the `not` schemas */
    .filter((oneOfSchema) => !isDefined(oneOfSchema.not))
    .map((schema, index) => {
      const resolvedSchema = resolveSchemaWithRef(schema, definitions);

      let name = resolvedSchema.title;
      let description = resolvedSchema.description;

      const schemaProps = Object.keys(resolvedSchema.properties ?? {});
      const isSinglePropertySchema = schemaProps.length === 1;
      if (isSinglePropertySchema) {
        const singlePropertySchema = resolveSchemaWithRef(
          resolvedSchema.properties![schemaProps[0]] as JSONSchema7,
          definitions,
        );
        name ??= singlePropertySchema.title ?? camelCaseToSpaces(schemaProps[0], { capitalize: true });
        description ??= singlePropertySchema.description;
      }

      name ??= `Schema ${index}`;

      return { name, description, schema: resolvedSchema };
    });

  /** Handling cases where an EIP, Language or Dataformat could be represented in 2 different ways  */
  if (list.length === 2) {
    const [firstSchema, secondSchema] = list;
    if (firstSchema.schema.type === 'string' && secondSchema.schema.type === 'object') {
      firstSchema.name = 'Simple';
      secondSchema.name = 'Advanced';
    }
  }

  return list;
};
