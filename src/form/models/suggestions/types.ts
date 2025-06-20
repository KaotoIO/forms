import { JSONSchema4 } from 'json-schema';

export type Suggestion = {
  /** The value of the suggestion that will be inserted into the input field. */
  value: string;

  /** Optional label for the suggestion, if different from the value */
  label?: string;

  /** Additional information about the suggestion, such as a description or tooltip */
  description?: string;

  /** Priority of the suggestion, so they can be sorted */
  priority?: number;
};

export interface SuggestionProvider {
  /**
   * Unique identifier for the provider.
   */
  id: string;

  /**
   * Determines if this provider should offer suggestions for the given schema.
   * @param propertyName The name of the property for which suggestions are being fetched.
   * @param schema The JSON Schema of the field.
   * @returns True if the provider is applicable, false otherwise.
   */
  appliesTo: (propertyName: string, schema: JSONSchema4) => boolean;

  /**
   * Fetches suggestions based on the current input value and schema.
   * This can be synchronous or asynchronous (returning a Promise).
   * @param propertyName The name of the property for which suggestions are being fetched.
   * @param inputValue The current value in the text input.
   * @returns An array of suggestions.
   */
  getSuggestions: (propertyName: string, inputValue: unknown) => Suggestion[] | Promise<Suggestion[]>;

  /**
   * How to write the suggestion in the input field.
   * The options are:
   * - `replace`: Replace the entire input value with the suggestion.
   * - `append`: Append the suggestion to the current input value.
   * - `prepend`: Prepend the suggestion to the current input value.
   * - `insert`: Insert the suggestion at the current cursor position.
   * - `none`: Do not modify the input value, just provide the suggestion.
   * @default 'replace'
   */
  // TODO: Pending to implement this in the UI
  // TODO: Use an enum instead of string literals
  writeMode?: 'replace' | 'append' | 'prepend' | 'insert' | 'none';
}
