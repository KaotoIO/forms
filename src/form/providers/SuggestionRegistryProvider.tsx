import { JSONSchema4 } from 'json-schema';
import { createContext, FunctionComponent, PropsWithChildren, useContext, useState } from 'react';
import { SuggestionProvider } from '../models/suggestions';

interface SuggestionContextType {
  registerProvider: (provider: SuggestionProvider) => void;
  unregisterProvider: (id: string) => void;
  getProviders: (propertyName: string, schema: JSONSchema4) => SuggestionProvider[];
}

// TODO: Divide this context into two: one for registration and another for the suggestions list, like the SourceCodeEditor
export const SuggestionContext = createContext<SuggestionContextType | undefined | null>(undefined);

export const SuggestionRegistryProvider: FunctionComponent<PropsWithChildren> = ({ children }) => {
  const [providers, setProviders] = useState<SuggestionProvider[]>([]);

  const registerProvider = (provider: SuggestionProvider) => {
    setProviders((prevProviders) => {
      if (prevProviders.some((p) => p.id === provider.id)) {
        console.warn(`Suggestion provider with ID "${provider.id}" already registered.`);
        return prevProviders;
      }
      return [...prevProviders, provider];
    });
  };

  const unregisterProvider = (id: string) => {
    setProviders((prevProviders) => prevProviders.filter((p) => p.id !== id));
  };

  const getProviders = (propertyName: string, schema: JSONSchema4) => {
    if (!schema) return providers;
    return providers.filter((provider) => provider.appliesTo(propertyName, schema));
  };

  const contextValue = { registerProvider, unregisterProvider, getProviders };

  return <SuggestionContext.Provider value={contextValue}>{children}</SuggestionContext.Provider>;
};

export const useSuggestionRegistry = () => {
  const context = useContext(SuggestionContext);
  if (context === undefined) {
    throw new Error('useSuggestionRegistry must be used within a SuggestionRegistryProvider');
  }
  return context;
};
