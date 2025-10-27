import { JSONSchema7 } from 'json-schema';
import { createContext, FunctionComponent } from 'react';
import { FieldProps } from '../../models';

export type FormComponentFactoryContextValue = (schema: JSONSchema7) => FunctionComponent<FieldProps>;

export const FormComponentFactoryContext = createContext<FormComponentFactoryContextValue | undefined>(undefined);
