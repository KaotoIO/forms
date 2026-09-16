import { Form } from '@patternfly/react-core';
import { JSONSchema4 } from 'json-schema';
import {
  FormEventHandler,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AutoField } from './fields/AutoField';
import { NoFieldFound } from './Form/NoFieldFound';
import './KaotoForm.scss';
import { IDataTestID } from './models';
import { CustomFieldsFactory, FormComponentFactoryProvider } from './providers/FormComponentFactoryProvider';
import { ModelContextProvider } from './providers/ModelProvider';
import { SchemaDefinitionsProvider } from './providers/SchemaDefinitionsProvider';
import { SchemaProvider } from './providers/SchemaProvider';
import { isDefined, ROOT_PATH, setValue } from './utils';
import { errorsMapper } from './validation/errors-mapper';
import { getValidator } from './validation/get-validator';

export interface KaotoFormApi {
  validate: () => Record<string, string[]> | null;
}

export interface KaotoFormProps extends IDataTestID {
  schema?: JSONSchema4;
  model: unknown;
  omitFields?: string[];
  disabled?: boolean;
  onChange?: (value: unknown) => void;
  onChangeProp?: (propName: string, value: unknown) => void;
  customFieldsFactory?: CustomFieldsFactory;
}

export const KaotoForm = forwardRef<KaotoFormApi, KaotoFormProps>(
  (
    {
      'data-testid': dataTestId,
      schema,
      model,
      omitFields = [],
      disabled,
      onChange,
      onChangeProp,
      customFieldsFactory,
    },
    forwardRef,
  ) => {
    if (!isDefined(schema)) {
      throw new Error('[KaotoForm]: Schema is required');
    }

    const [formState, setFormState] = useState<{
      sourceModel: unknown;
      model: unknown;
      change?: { model: unknown };
    }>({ sourceModel: model, model });
    // Accept external updates without remounting fields or emitting another change.
    if (!Object.is(formState.sourceModel, model)) {
      setFormState({ ...formState, sourceModel: model, model });
    }
    const formModel = formState.model;
    const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
    const onChangeRef = useRef(onChange);

    /**
     * This useEffect updates the onChangeRef.current value every time the onChange prop changes
     * This way, the onChangeRef.current will always have the latest onChange function
     * but without triggering the useEffect that notifies the consumer about the form being updated
     */
    useEffect(() => {
      onChangeRef.current = onChange;
    }, [onChange]);

    /**
     * Notify the consumer only about local edits. External model updates preserve
     * the pending change so a synchronous onChangeProp update cannot swallow it.
     */
    useEffect(() => {
      if (formState.change) {
        onChangeRef.current?.(formState.change.model);
      }
    }, [formState.change]);

    /**
     * Update the formModel state when a property changes
     */
    const onPropertyChange = useCallback(
      (propName: string, value: unknown) => {
        onChangeProp?.(propName, value);
        setFormState((previous) => {
          if (typeof previous.model !== 'object') {
            return { ...previous, model: value, change: { model: value } };
          }

          const newModel = { ...previous.model };
          setValue(newModel, propName, value);
          return { ...previous, model: newModel, change: { model: newModel } };
        });
      },
      [onChangeProp],
    );

    const validator = useMemo(() => getValidator(schema), [schema]);

    const schemaValidator = useCallback(
      (model: unknown) => {
        validator?.(model);
        const mappedErrors = errorsMapper(validator?.errors);
        setValidationErrors(mappedErrors);

        return Object.keys(mappedErrors).length > 0 ? mappedErrors : null;
      },
      [validator],
    );

    useImperativeHandle(forwardRef, () => ({ validate: () => schemaValidator(formModel) }), [
      formModel,
      schemaValidator,
    ]);

    const onSubmit: FormEventHandler<HTMLFormElement> = useCallback((event) => {
      event.preventDefault();
    }, []);

    return (
      <FormComponentFactoryProvider customFieldsFactory={customFieldsFactory}>
        <SchemaDefinitionsProvider schema={schema} omitFields={omitFields}>
          <SchemaProvider schema={schema}>
            <ModelContextProvider
              model={formModel}
              errors={validationErrors}
              onPropertyChange={onPropertyChange}
              disabled={disabled}
            >
              <Form onSubmit={onSubmit} className="kaoto-form kaoto-form__label" data-testid={dataTestId}>
                <AutoField propName={ROOT_PATH} />
              </Form>

              <NoFieldFound className="kaoto-form kaoto-form__empty" />
            </ModelContextProvider>
          </SchemaProvider>
        </SchemaDefinitionsProvider>
      </FormComponentFactoryProvider>
    );
  },
);
