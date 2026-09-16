import '@testing-library/jest-dom';
import { act, createEvent, fireEvent, render, screen } from '@testing-library/react';
import { JSONSchema4 } from 'json-schema';
import { useRef, useState } from 'react';
import { KaotoForm, KaotoFormApi, KaotoFormProps } from './KaotoForm';
import { KaotoFormPageObject } from './testing/KaotoFormPageObject';

describe('KaotoForm', () => {
  const defaultProps: KaotoFormProps = {
    schema: {
      type: 'object',
      properties: {
        name: { title: 'Name', type: 'string' },
      },
      required: ['name'],
    },
    model: {},
    'data-testid': 'kaoto-form',
  };

  it('renders without crashing', () => {
    render(<KaotoForm {...defaultProps} />);
    expect(screen.getByTestId('kaoto-form')).toBeInTheDocument();
  });

  it('should prevent executing the default onSubmit action', () => {
    const { getByTestId } = render(<KaotoForm {...defaultProps} />);
    const form = getByTestId('kaoto-form');

    const mockEvent = createEvent.submit(form);
    const preventDefaultSpy = jest.spyOn(mockEvent, 'preventDefault');

    act(() => {
      fireEvent(form, mockEvent);
    });

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('displays "Schema not defined" when schema is not provided', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {}); // Suppress error logs

    expect(() => render(<KaotoForm {...defaultProps} schema={undefined} />)).toThrow('[KaotoForm]: Schema is required');

    jest.restoreAllMocks();
  });

  it('should not call onChange when loading the form for the first time', () => {
    const onChangeMock = jest.fn();
    render(<KaotoForm {...defaultProps} onChange={onChangeMock} />);
    expect(onChangeMock).not.toHaveBeenCalled();
  });

  it('should call onChange when the model changes', async () => {
    const onChangeMock = jest.fn();
    render(<KaotoForm {...defaultProps} onChange={onChangeMock} />);

    const value = 'new value';

    const formPageObject = new KaotoFormPageObject(screen, act);
    await formPageObject.inputText('Name', value);

    expect(onChangeMock).toHaveBeenCalledWith({
      name: value,
    });
  });

  it('should call onChangeProp when a property changes', async () => {
    const onChangePropMock = jest.fn();
    render(<KaotoForm {...defaultProps} onChangeProp={onChangePropMock} />);

    const propName = 'name';
    const value = 'new value';

    const formPageObject = new KaotoFormPageObject(screen, act);
    await formPageObject.inputText('Name', value);

    expect(onChangePropMock).toHaveBeenCalledWith(propName, value);
  });

  it('should call onChangeProp when a primitive property changes', async () => {
    const onChangePropMock = jest.fn();
    render(<KaotoForm {...defaultProps} model="" onChangeProp={onChangePropMock} />);

    const value = 'new value';

    const formPageObject = new KaotoFormPageObject(screen, act);
    await formPageObject.inputText('Name', value);

    expect(onChangePropMock).toHaveBeenCalledWith('name', value);
  });

  it('should validate the model', async () => {
    const wrapper = render(<KaotoFormApiTest />);

    const validateButton = wrapper.getByTestId('validate');
    fireEvent.click(validateButton);

    expect(wrapper.asFragment()).toMatchSnapshot();
  });

  it('refreshes string values and RAW status without emitting a source change', () => {
    const schema: JSONSchema4 = {
      type: 'object',
      required: ['name'],
      properties: { name: { type: 'string', title: 'Name' } },
    };
    const onChange = jest.fn();
    const { rerender } = render(<KaotoForm schema={schema} model={{ name: 'before' }} onChange={onChange} />);
    const input = screen.getByRole('textbox', { name: 'Name' });
    input.focus();

    rerender(<KaotoForm schema={schema} model={{ name: 'RAW(after)' }} onChange={onChange} />);

    expect(screen.getByRole('textbox', { name: 'Name' })).toBe(input);
    expect(input).toHaveFocus();
    expect(input).toHaveValue('RAW(after)');
    expect(screen.getByText('raw')).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.change(input, { target: { value: 'edited' } });
    expect(onChange).toHaveBeenLastCalledWith({ name: 'edited' });
    expect(screen.queryByText('raw')).not.toBeInTheDocument();

    rerender(<KaotoForm schema={schema} model={{ name: 'from-source' }} onChange={onChange} />);
    expect(input).toHaveValue('from-source');
    rerender(<KaotoForm schema={schema} model={{ name: 'edited' }} onChange={onChange} />);
    expect(input).toHaveValue('edited');
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('refreshes map values while keeping local duplicate-key drafts editable', () => {
    const schema: JSONSchema4 = {
      type: 'object',
      required: ['parameters'],
      properties: { parameters: { type: 'object', title: 'Parameters' } },
    };
    const onChange = jest.fn();
    const { rerender } = render(
      <KaotoForm schema={schema} model={{ parameters: { first: 'before', second: 'kept' } }} onChange={onChange} />,
    );
    const input = screen.getByDisplayValue('before');

    rerender(
      <KaotoForm schema={schema} model={{ parameters: { first: 'after', second: 'kept' } }} onChange={onChange} />,
    );

    expect(input).toHaveValue('after');
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.change(screen.getByDisplayValue('second'), { target: { value: 'first' } });
    expect(screen.getAllByDisplayValue('first')).toHaveLength(2);
    fireEvent.change(screen.getAllByDisplayValue('first')[1], { target: { value: 'renamed' } });
    expect(onChange).toHaveBeenLastCalledWith({ parameters: { first: 'after', renamed: 'kept' } });

    rerender(
      <KaotoForm
        schema={schema}
        model={{ parameters: { first: 'from-source', renamed: 'kept' } }}
        onChange={onChange}
      />,
    );
    expect(input).toHaveValue('from-source');
    rerender(
      <KaotoForm schema={schema} model={{ parameters: { first: 'after', renamed: 'kept' } }} onChange={onChange} />,
    );
    expect(input).toHaveValue('after');
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it('preserves numeric drafts while accepting external number changes', () => {
    const schema: JSONSchema4 = {
      type: 'object',
      required: ['amount'],
      properties: { amount: { type: 'number', title: 'Amount' } },
    };
    const onChange = jest.fn();
    const { rerender } = render(<KaotoForm schema={schema} model={{ amount: 1 }} onChange={onChange} />);
    const input = screen.getByRole('textbox', { name: 'Amount' });
    fireEvent.change(input, { target: { value: '2.' } });
    fireEvent.change(input, { target: { value: '2.0' } });
    expect(input).toHaveValue('2.0');
    fireEvent.change(input, { target: { value: '2.05' } });
    expect(onChange).toHaveBeenLastCalledWith({ amount: 2.05 });

    rerender(<KaotoForm schema={schema} model={{ amount: 3 }} onChange={onChange} />);
    expect(input).toHaveValue('3');
    rerender(<KaotoForm schema={schema} model={{ amount: Number.NaN }} onChange={onChange} />);
    // PatternFly displays NaN as empty; the form must remain mounted and editable.
    expect(input).toHaveValue('');
    fireEvent.change(input, { target: { value: '4' } });
    expect(onChange).toHaveBeenLastCalledWith({ amount: 4 });
  });

  it('notifies both form callbacks when a parent immediately applies a property edit', () => {
    const schema: JSONSchema4 = {
      type: 'object',
      required: ['name'],
      properties: { name: { type: 'string', title: 'Name' } },
    };
    const onChange = jest.fn();
    const ControlledForm = () => {
      const [model, setModel] = useState({ name: 'before' });
      return (
        <KaotoForm
          schema={schema}
          model={model}
          onChange={onChange}
          onChangeProp={(_path, value) => {
            setModel({ name: String(value) });
          }}
        />
      );
    };
    render(<ControlledForm />);
    fireEvent.change(screen.getByRole('textbox', { name: 'Name' }), { target: { value: 'edited' } });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith({ name: 'edited' });
  });

  it('keeps a locally cleared expression empty across form updates', async () => {
    const schema: JSONSchema4 = {
      oneOf: ['simple', 'constant', 'groovy', 'jq', 'jsonpath', 'xpath'].map((name) => ({
        type: 'object',
        required: [name],
        properties: {
          [name]: {
            type: 'object',
            required: ['expression'],
            properties: { expression: { type: 'string', title: 'Expression' } },
          },
        },
      })),
    };
    const onChange = jest.fn();
    const { rerender } = render(
      <KaotoForm schema={schema} model={{ constant: { expression: 'before' } }} onChange={onChange} />,
    );
    const input = screen.getByRole('textbox', { name: 'Expression' });
    input.focus();
    rerender(<KaotoForm schema={schema} model={{ constant: { expression: 'after' } }} onChange={onChange} />);
    expect(screen.getByRole('textbox', { name: 'Expression' })).toBe(input);
    expect(input).toHaveFocus();
    expect(input).toHaveValue('after');
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTestId('#__oneof-list__clear'));
    expect(screen.queryByRole('textbox', { name: 'Expression' })).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: '# oneof list' })).toHaveValue('');
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith({});

    rerender(<KaotoForm schema={schema} model={{ simple: { expression: 'from source' } }} onChange={onChange} />);
    expect(screen.getByRole('textbox', { name: 'Expression' })).toHaveValue('from source');
    expect(onChange).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByTestId('#__oneof-list__clear'));
    expect(screen.queryByRole('textbox', { name: 'Expression' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '# oneof list toggle' }));
    fireEvent.click(await screen.findByRole('option', { name: 'option simple' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Expression' }), { target: { value: 'edited' } });
    expect(onChange).toHaveBeenLastCalledWith({ simple: { expression: 'edited' } });
  });

  const KaotoFormApiTest = () => {
    const formRef = useRef<KaotoFormApi>(null);
    const [errors, setErrors] = useState<Record<string, string[]>>({});

    return (
      <>
        <code>{JSON.stringify(errors, undefined, 2)}</code>
        <KaotoForm {...defaultProps} ref={formRef} />
        <button
          type="button"
          title="validate"
          data-testid="validate"
          onClick={() => {
            const errors = formRef.current?.validate();
            setErrors(errors ?? {});
          }}
        />
      </>
    );
  };
});
