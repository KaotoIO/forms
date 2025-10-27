import { JSONSchema7 } from 'json-schema';
import { FunctionComponent } from 'react';
import { FieldProps } from '../../models/typings';
import { SchemaProvider } from '../../providers/SchemaProvider';
import { AutoField } from '../AutoField';

interface AnyOfFieldProps extends FieldProps {
  anyOf: JSONSchema7['anyOf'];
}

export const AnyOfField: FunctionComponent<AnyOfFieldProps> = ({ propName, anyOf }) => {
  return (
    <>
      {anyOf?.map((schema, index) => {
        return (
          <SchemaProvider key={index} schema={schema as JSONSchema7}>
            <AutoField propName={propName} />
          </SchemaProvider>
        );
      })}
    </>
  );
};
