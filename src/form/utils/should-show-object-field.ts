import { JSONSchema4 } from 'json-schema';
import { isDefined } from './is-defined';

export const shouldShowFieldObject = (schema: JSONSchema4, value: unknown): boolean => {
  if (!isDefined(schema.properties)) return false;

  return true;
};
