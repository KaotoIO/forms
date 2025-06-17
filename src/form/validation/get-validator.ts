import Ajv, { ValidateFunction } from 'ajv';
import { JSONSchema4 } from 'json-schema';

export const getValidator = (schema: JSONSchema4) => {
  const ajv = new Ajv({ strict: false, allErrors: true, useDefaults: true });

  let validator: ValidateFunction | undefined;
  try {
    validator = ajv.compile(schema);
  } catch (error) {
    console.error('[KaotoForm Validator]: Could not compile schema', error);
  }

  return validator;
};
