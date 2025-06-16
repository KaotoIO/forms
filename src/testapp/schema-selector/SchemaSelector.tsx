import { FunctionComponent, useCallback } from 'react';
import { Typeahead } from '../../form/typeahead/Typeahead';
import { TypeaheadItem } from '../../form/typeahead/Typeahead.types';
import { useCurrentSchema } from '../providers/CurrentSchemaProvider';
import { useModel } from '../providers/ModelProvider';

export const SchemaSelector: FunctionComponent = () => {
  const { schema, schemas, setSchema } = useCurrentSchema();
  const { setModel } = useModel();

  const onSchemaChange = useCallback(
    (item?: TypeaheadItem) => {
      if (!item) {
        setSchema(undefined);
        return;
      }

      setSchema({ name: item.name, value: item.value });
      setModel({}); // Reset model when changing schema
    },
    [setModel, setSchema],
  );
  const onSchemaClean = useCallback(() => {
    setSchema(undefined);
    setModel({});
  }, [setModel, setSchema]);

  return <Typeahead items={schemas} selectedItem={schema} onChange={onSchemaChange} onCleanInput={onSchemaClean} />;
};
