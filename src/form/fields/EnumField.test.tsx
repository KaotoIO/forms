import { act, fireEvent, render, screen } from '@testing-library/react';
import { ModelContextProvider } from '../providers/ModelProvider';
import { SchemaProvider } from '../providers/SchemaProvider';
import { ROOT_PATH } from '../utils';
import { EnumField } from './EnumField';

describe('EnumField', () => {
  const enumSchema = {
    type: 'string' as const,
    enum: ['Option1', 'Option2', 'Option3'],
    default: 'Option2',
    title: 'Enum Field',
    description: 'Choose an option',
  };

  it('renders the EnumField as a Typeahead', () => {
    render(
      <ModelContextProvider model={undefined} onPropertyChange={jest.fn()}>
        <SchemaProvider schema={enumSchema}>
          <EnumField propName={ROOT_PATH} />
        </SchemaProvider>
      </ModelContextProvider>,
    );

    const input = screen.getByRole('textbox', { name: /type to filter/i });
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder', 'Option2');
  });

  it('shows all enum options in the dropdown when opened', async () => {
    render(
      <ModelContextProvider model={undefined} onPropertyChange={jest.fn()}>
        <SchemaProvider schema={enumSchema}>
          <EnumField propName={ROOT_PATH} />
        </SchemaProvider>
      </ModelContextProvider>,
    );
    const input = screen.getByRole('textbox', { name: /type to filter/i });

    await act(async () => {
      fireEvent.click(input);
    });

    expect(screen.getByText('Option1')).toBeInTheDocument();
    expect(screen.getByText('Option2')).toBeInTheDocument();
    expect(screen.getByText('Option3')).toBeInTheDocument();
  });

  it('calls onChange when an option is selected', async () => {
    const onPropertyChangeSpy = jest.fn();
    render(
      <ModelContextProvider model={undefined} onPropertyChange={onPropertyChangeSpy}>
        <SchemaProvider schema={enumSchema}>
          <EnumField propName={ROOT_PATH} />
        </SchemaProvider>
      </ModelContextProvider>,
    );

    const input = screen.getByRole('textbox', { name: /type to filter/i });

    await act(async () => {
      fireEvent.click(input);
    });

    const option2 = await screen.findByText('Option2');
    act(() => {
      fireEvent.click(option2);
    });

    expect(onPropertyChangeSpy).toHaveBeenCalledWith(ROOT_PATH, 'Option2');
  });

  it('calls onCleanInput when the clear button is clicked', async () => {
    const onPropertyChangeSpy = jest.fn();
    render(
      <ModelContextProvider model={'Option1'} onPropertyChange={onPropertyChangeSpy}>
        <SchemaProvider schema={enumSchema}>
          <EnumField propName={ROOT_PATH} />
        </SchemaProvider>
      </ModelContextProvider>,
    );

    const clearButton = screen.getByLabelText('Clear input value');
    act(() => {
      fireEvent.click(clearButton);
    });

    expect(onPropertyChangeSpy).toHaveBeenCalledWith(ROOT_PATH, undefined);
  });

  it('shows errors if available for its property path', () => {
    const onPropertyChangeSpy = jest.fn();
    render(
      <ModelContextProvider
        model={'Option1'}
        errors={{ [ROOT_PATH]: ['error message'] }}
        onPropertyChange={onPropertyChangeSpy}
      >
        <SchemaProvider schema={enumSchema}>
          <EnumField propName={ROOT_PATH} />
        </SchemaProvider>
      </ModelContextProvider>,
    );
    expect(screen.getByText(/error message/i)).toBeInTheDocument();
  });
});
