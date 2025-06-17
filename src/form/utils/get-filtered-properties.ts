import { JSONSchema4 } from 'json-schema';
import { isDefined } from './is-defined';

/**
 * Extracts the schema recursively containing only the filtered properties.
 */
export function getFilteredProperties(
  properties: JSONSchema4['properties'],
  filter: string,
  omitFields?: string[],
): JSONSchema4['properties'] {
  if (!isDefined(properties)) return {};

  const filteredFormSchema = Object.entries(properties).reduce(
    (acc, [property, definition]) => {
      if (!omitFields?.includes(property)) {
        if (definition['type'] === 'object' && 'properties' in definition) {
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
    {} as JSONSchema4['properties'],
  );

  return filteredFormSchema;
}
