import { FunctionComponent, PropsWithChildren, useEffect } from 'react';
import { SuggestionProvider } from '../../form/models/suggestions';
import { SuggestionRegistryProvider, useSuggestionRegistry } from '../../form/providers';

export const DemoSuggestionProvider: FunctionComponent<PropsWithChildren> = ({ children }) => {
  return (
    <SuggestionRegistryProvider>
      <SuggestionRegistrar>{children}</SuggestionRegistrar>
    </SuggestionRegistryProvider>
  );
};

const SuggestionRegistrar: FunctionComponent<PropsWithChildren> = ({ children }) => {
  const suggestionRegistryContext = useSuggestionRegistry();

  useEffect(() => {
    suggestionRegistryContext?.registerProvider(demoSuggestionProvider);
    return () => {
      suggestionRegistryContext?.unregisterProvider(demoSuggestionProvider.id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
};

// Example of static suggestions based on input value
const demoSuggestionProvider: SuggestionProvider = {
  id: 'demo-suggestions',
  appliesTo: (_propName, schema) => schema.type === 'string',
  getSuggestions: (propName, value) => {
    return [
      {
        value: `{{${value}}}`,
        label: `{{${value}}}`,
        description: 'Writes the value of the property as a property reference',
      },
      {
        value: `{{env:${value}}}`,
        label: `{{env:${value}}}`,
        description: 'Writes the value of the property as an environment variable reference',
      },
      {
        value: `{{sys:${value}}}`,
        label: `{{sys:${value}}}`,
        description: 'Writes the value of the property as a system variable reference',
      },
    ];
  },
};
