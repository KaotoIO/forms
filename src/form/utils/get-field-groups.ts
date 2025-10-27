import { JSONSchema7 } from 'json-schema';
import { extractGroup } from './get-tagged-field-from-string';
import { isDefined } from './is-defined';

interface FieldGroups {
  common: Record<string, JSONSchema7>;
  groups: [string, Record<string, JSONSchema7>][];
}

export const getFieldGroups = (properties?: JSONSchema7['properties']): FieldGroups => {
  if (!isDefined(properties)) return { common: {}, groups: [] };

  const groupedProperties = Object.entries(properties).reduce(
    (acc, [name, definition]) => {
      // "$comment": "group:advanced" or "$comment": "group:consumer (advanced)"
      const group = extractGroup('group', (definition as JSONSchema7).$comment);

      if (group === '' || group === 'common' || group === 'producer' || group === 'consumer') {
        acc.common[name] = definition as JSONSchema7;
      } else {
        acc.groups[group] ??= {};
        acc.groups[group][name] = definition as JSONSchema7;
      }

      return acc;
    },
    { common: {}, groups: {} } as {
      common: Record<string, JSONSchema7>;
      groups: Record<string, Record<string, JSONSchema7>>;
    },
  );

  /** Prioritize advanced properties */
  const groupArray = Object.entries(groupedProperties.groups).sort((a, b) => {
    if (a[0] === 'advanced') {
      return 1;
    } else if (b[0] === 'advanced') {
      return -1;
    }
    return 0;
  });

  return { common: groupedProperties.common, groups: groupArray };
};
