import { act, fireEvent, render, waitFor } from '@testing-library/react';
import { KeyValueField } from './KeyValueField';

// Mock useSuggestions to control its output
jest.mock('../hooks/suggestions', () => ({
  useSuggestions: jest.fn(() => null),
}));

describe('KeyValueField', () => {
  const defaultProps = {
    id: 'test-id',
    name: 'test-name',
    'data-testid': 'keyvalue-input',
    placeholder: 'Enter value',
    value: 'initial',
    onChange: jest.fn(),
    onFocus: jest.fn(),
    onBlur: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with correct props', () => {
    const { getByTestId } = render(<KeyValueField {...defaultProps} />);
    const input = getByTestId('keyvalue-input');

    expect(input).toBeInTheDocument();
    expect(input).toMatchSnapshot();
  });

  it('calls onChange when value changes', () => {
    const onChange = jest.fn();
    const { getByRole } = render(<KeyValueField {...defaultProps} onChange={onChange} />);
    const input = getByRole('textbox');

    act(() => {
      fireEvent.change(input, { target: { value: 'new value' } });
    });

    expect(onChange).toHaveBeenCalledWith('new value');
  });

  it('should not fail if onChange was not provided', () => {
    const { getByRole } = render(<KeyValueField {...defaultProps} onChange={undefined} />);
    const input = getByRole('textbox');

    act(() => {
      expect(() => {
        fireEvent.change(input, { target: { value: 'new value' } });
      }).not.toThrow();
    });
  });

  it('calls onFocus and onBlur', async () => {
    const onFocus = jest.fn();
    const onBlur = jest.fn();

    const { getByRole } = render(<KeyValueField {...defaultProps} onFocus={onFocus} onBlur={onBlur} />);
    const input = getByRole('textbox');

    await act(async () => {
      fireEvent.focus(input);
      fireEvent.blur(input);
    });

    await waitFor(() => {
      expect(onFocus).toHaveBeenCalled();
      expect(onBlur).toHaveBeenCalled();
    });
  });

  it('shows suggestions when Ctrl+Space is pressed', async () => {
    const SuggestionsMenu = () => <div data-testid="suggestions-menu">Suggestions</div>;
    const { useSuggestions } = jest.requireMock('../hooks/suggestions');

    useSuggestions.mockImplementation(() => <SuggestionsMenu />);

    const { getByTestId } = render(<KeyValueField {...defaultProps} />);
    const input = getByTestId('keyvalue-input');

    await act(async () => {
      input.focus();
      fireEvent.keyDown(input, { code: 'Space', ctrlKey: true });
    });

    await waitFor(() => {
      expect(getByTestId('suggestions-menu')).toBeInTheDocument();
    });
  });
});
