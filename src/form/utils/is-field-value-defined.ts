import { JSONSchema7TypeName } from 'json-schema';
import { isDefined } from './is-defined';

export const isFieldValueDefined = (
  schemaType: JSONSchema7TypeName[] | JSONSchema7TypeName | undefined,
  value: unknown,
): boolean => {
  if (!isDefined(schemaType)) return false;

  let isFieldDefined = false;
  // When field of any type in not defined with any input, the `value` returns `undefined` and therefore we return false
  if (isDefined(value)) {
    // Check if the value is a valid value
    switch (schemaType) {
      case 'object':
        isFieldDefined = typeof value === 'object' && Object.keys(value).length > 0;
        break;
      case 'array':
        isFieldDefined = Array.isArray(value) && value.length > 0;
        break;
      case 'boolean':
        // when a boolean with default value (false or true) is defined, its value remains undefined until user changes it
        isFieldDefined = typeof value === 'boolean';
        break;
      case 'string':
      case 'number':
        // when a string or number is defined with a value and then cleared, it becomes an empty string
        isFieldDefined = value !== '';
        break;
      default:
        isFieldDefined = true;
    }
  }
  return isFieldDefined;
};
