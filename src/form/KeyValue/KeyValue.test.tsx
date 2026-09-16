import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { KeyValue, KeyValueType } from './KeyValue';

describe('KeyValue', () => {
  const propName = 'testProp';
  let initialModel: KeyValueType;

  beforeEach(() => {
    initialModel = { key1: 'value1', key2: 'value2' };
  });

  it('renders empty key-value with button disabled', () => {
    const onChange = jest.fn();
    const wrapper = render(<KeyValue propName={propName} onChange={onChange} disabled={true} />);

    expect(wrapper.getByTestId(`${propName}__add`)).toBeDisabled();
  });

  it('renders initial key-value pairs', () => {
    const onChange = jest.fn();
    const wrapper = render(<KeyValue propName={propName} initialModel={initialModel} onChange={onChange} />);

    expect(wrapper.getByDisplayValue('key1')).toBeInTheDocument();
    expect(wrapper.getByDisplayValue('value1')).toBeInTheDocument();
    expect(wrapper.getByDisplayValue('key2')).toBeInTheDocument();
    expect(wrapper.getByDisplayValue('value2')).toBeInTheDocument();
  });

  it('renders initial key-value pairs with button disabled', () => {
    const onChange = jest.fn();
    const wrapper = render(
      <KeyValue propName={propName} initialModel={initialModel} onChange={onChange} disabled={true} />,
    );

    expect(wrapper.getByDisplayValue('key1')).toBeInTheDocument();
    expect(wrapper.getByDisplayValue('value1')).toBeInTheDocument();
    expect(wrapper.getByDisplayValue('key2')).toBeInTheDocument();
    expect(wrapper.getByDisplayValue('value2')).toBeInTheDocument();

    expect(wrapper.getByTestId(`${propName}__add`)).toBeDisabled();
  });

  it('adds a new key-value pair', () => {
    const onChange = jest.fn();
    const wrapper = render(<KeyValue propName={propName} initialModel={initialModel} onChange={onChange} />);

    fireEvent.click(wrapper.getByTestId(`${propName}__add`));

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ key1: 'value1', key2: 'value2' }));
  });

  it('removes a key-value pair', () => {
    const onChange = jest.fn();
    const wrapper = render(<KeyValue propName={propName} initialModel={initialModel} onChange={onChange} />);

    fireEvent.click(wrapper.getByTestId(`${propName}__remove__key1`));

    expect(onChange).toHaveBeenCalledWith({ key2: 'value2' });
  });

  it('keeps duplicate-key drafts when the parent reconstructs the emitted map', () => {
    const ControlledMap = () => {
      const [model, setModel] = useState<Record<string, string>>({ first: 'one', second: 'two' });
      return (
        <KeyValue
          propName="parameters"
          initialModel={model}
          onChange={(next) => {
            setModel({ ...next });
          }}
        />
      );
    };
    render(<ControlledMap />);
    fireEvent.change(screen.getByDisplayValue('second'), { target: { value: 'first' } });
    expect(screen.getAllByDisplayValue('first')).toHaveLength(2);
    fireEvent.change(screen.getAllByDisplayValue('first')[1], { target: { value: 'renamed' } });
    expect(screen.getByDisplayValue('one')).toBeInTheDocument();
    expect(screen.getByDisplayValue('two')).toBeInTheDocument();
  });

  it('updates a key', () => {
    const onChange = jest.fn();
    const wrapper = render(<KeyValue propName={propName} initialModel={initialModel} onChange={onChange} />);

    fireEvent.change(wrapper.getByDisplayValue('key1'), { target: { value: 'newKey1' } });

    expect(onChange).toHaveBeenCalledWith({ newKey1: 'value1', key2: 'value2' });
  });

  it('updates a value', () => {
    const onChange = jest.fn();
    const wrapper = render(<KeyValue propName={propName} initialModel={initialModel} onChange={onChange} />);

    fireEvent.change(wrapper.getByDisplayValue('value1'), { target: { value: 'newValue1' } });

    expect(onChange).toHaveBeenCalledWith({ key1: 'newValue1', key2: 'value2' });
  });
});
