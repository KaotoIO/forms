import { JSONSchema7 } from 'json-schema';
import { isDefined } from './is-defined';

/**
 * Extracts the schema recursively containing only the filtered properties.
 */
export function getFilteredProperties(
  properties: JSONSchema7['properties'],
  filter: string,
  omitFields?: string[],
): JSONSchema7['properties'] {
  if (!isDefined(properties)) return {};

  const filteredFormSchema = Object.entries(properties).reduce(
    (acc, [property, definition]) => {
      if (!omitFields?.includes(property)) {
        if (typeof definition === 'object' && definition['type'] === 'object' && isDefined(definition['properties'])) {
          const subFilteredSchema = getFilteredProperties(definition['properties'], filter);
          if (subFilteredSchema && Object.keys(subFilteredSchema).length > 0) {
            acc![property] = { ...definition, properties: subFilteredSchema };
          }
        } else if (property.toLowerCase().includes(filter)) {
          acc![property] = definition;
        }
      }

      return acc;
    },
    {} as JSONSchema7['properties'],
  );

  return filteredFormSchema;
}
