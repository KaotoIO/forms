import { act, fireEvent, render, waitFor } from '@testing-library/react';
import { ModelContextProvider } from '../providers/ModelProvider';
import { SchemaProvider } from '../providers/SchemaProvider';
import { ROOT_PATH } from '../utils';
import { TextAreaField } from './TextAreaField';

// Mock useSuggestions to control its output
jest.mock('../hooks/suggestions', () => ({
  useSuggestions: jest.fn(() => null),
}));

describe('TextAreaField', () => {
  it('should render', () => {
    const { container } = render(
      <ModelContextProvider model="Value" onPropertyChange={jest.fn()}>
        <TextAreaField propName={ROOT_PATH} />
      </ModelContextProvider>,
    );

    expect(container).toMatchSnapshot();
  });

  it('should set 2 rows by default', () => {
    const wrapper = render(
      <ModelContextProvider model="Value" onPropertyChange={jest.fn()}>
        <TextAreaField propName={ROOT_PATH} />
      </ModelContextProvider>,
    );

    const input = wrapper.getByRole('textbox');
    expect(input).toHaveAttribute('rows', '2');
  });

  it('should set the appropriate amount of rows', () => {
    const model = `Line 1
      Line 2
      Line 3
      Line 4`;

    const wrapper = render(
      <ModelContextProvider model={model} onPropertyChange={jest.fn()}>
        <TextAreaField propName={ROOT_PATH} />
      </ModelContextProvider>,
    );

    const input = wrapper.getByRole('textbox');
    expect(input).toHaveAttribute('rows', '4');
  });

  it('should set the appropriate placeholder', () => {
    const wrapper = render(
      <ModelContextProvider model={undefined} onPropertyChange={jest.fn()}>
        <SchemaProvider schema={{ type: 'string', default: 'Default Value' }}>
          <TextAreaField propName={ROOT_PATH} />
        </SchemaProvider>
      </ModelContextProvider>,
    );

    const input = wrapper.getByRole('textbox');
    expect(input).toHaveAttribute('placeholder', 'Default Value');
  });

  it('should notify when the value changes', () => {
    const onPropertyChangeSpy = jest.fn();

    const wrapper = render(
      <ModelContextProvider model="Value" onPropertyChange={onPropertyChangeSpy}>
        <TextAreaField propName={ROOT_PATH} />
      </ModelContextProvider>,
    );

    const input = wrapper.getByRole('textbox');
    act(() => {
      fireEvent.change(input, { target: { value: 'New Value' } });
    });

    expect(onPropertyChangeSpy).toHaveBeenCalledTimes(1);
    expect(onPropertyChangeSpy).toHaveBeenCalledWith(ROOT_PATH, 'New Value');
  });

  it('should clear the input when using the clear button', () => {
    const onPropertyChangeSpy = jest.fn();

    const wrapper = render(
      <ModelContextProvider model="Value" onPropertyChange={onPropertyChangeSpy}>
        <TextAreaField propName={ROOT_PATH} />
      </ModelContextProvider>,
    );

    const clearButton = wrapper.getByTestId(`${ROOT_PATH}__clear`);
    act(() => {
      fireEvent.click(clearButton);
    });

    expect(onPropertyChangeSpy).toHaveBeenCalledTimes(1);
    expect(onPropertyChangeSpy).toHaveBeenCalledWith(ROOT_PATH, undefined);
  });

  it('should call the onRemove callback if provided when using the clear button', () => {
    const onRemoveSpy = jest.fn();

    const wrapper = render(
      <ModelContextProvider model="Value" onPropertyChange={jest.fn()}>
        <TextAreaField propName={ROOT_PATH} onRemove={onRemoveSpy} />
      </ModelContextProvider>,
    );

    const clearButton = wrapper.getByTestId(`${ROOT_PATH}__clear`);
    act(() => {
      fireEvent.click(clearButton);
    });

    expect(onRemoveSpy).toHaveBeenCalledTimes(1);
  });

  it('shows suggestions when Ctrl+Space is pressed', async () => {
    const SuggestionsMenu = () => <div data-testid="suggestions-menu">Suggestions</div>;
    const { useSuggestions } = jest.requireMock('../hooks/suggestions');

    useSuggestions.mockImplementation(() => <SuggestionsMenu />);

    const { getByRole, getByTestId } = render(
      <ModelContextProvider model="Value" onPropertyChange={jest.fn()}>
        <TextAreaField propName={ROOT_PATH} />
      </ModelContextProvider>,
    );
    const input = getByRole('textbox');

    await act(async () => {
      input.focus();
      fireEvent.keyDown(input, { code: 'Space', ctrlKey: true });
    });

    await waitFor(() => {
      expect(getByTestId('suggestions-menu')).toBeInTheDocument();
    });
  });
});
