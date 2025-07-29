import { act, fireEvent, render } from '@testing-library/react';
import { ModelContextProvider } from '../providers/ModelProvider';
import { SchemaProvider } from '../providers/SchemaProvider';
import { ROOT_PATH } from '../utils';
import { BooleanField } from './BooleanField';

describe('BooleanField', () => {
  const renderWithProviders = (children: React.ReactNode) => {
    return render(
      <ModelContextProvider model={false} onPropertyChange={jest.fn()}>
        <SchemaProvider
          schema={{ type: 'boolean', title: 'Boolean Field', description: 'A boolean field', default: false }}
        >
          {children}
        </SchemaProvider>
      </ModelContextProvider>,
    );
  };

  it('should render with default props', () => {
    const { getByRole } = renderWithProviders(<BooleanField propName={ROOT_PATH} />);
    const checkbox = getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
  });

  it('should render checked if value is true', () => {
    const { getByRole } = render(
      <ModelContextProvider model={true} onPropertyChange={jest.fn()}>
        <SchemaProvider schema={{ type: 'boolean', title: 'Boolean Field', default: false }}>
          <BooleanField propName={ROOT_PATH} />
        </SchemaProvider>
      </ModelContextProvider>,
    );
    const checkbox = getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('should use schema default if value is undefined', () => {
    const { getByRole } = render(
      <ModelContextProvider model={undefined} onPropertyChange={jest.fn()}>
        <SchemaProvider schema={{ type: 'boolean', title: 'Boolean Field', default: true }}>
          <BooleanField propName={ROOT_PATH} />
        </SchemaProvider>
      </ModelContextProvider>,
    );
    const checkbox = getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('should call onChange when toggled', () => {
    const onPropertyChange = jest.fn();
    const { getByRole } = render(
      <ModelContextProvider model={false} onPropertyChange={onPropertyChange}>
        <SchemaProvider schema={{ type: 'boolean', title: 'Boolean Field', default: false }}>
          <BooleanField propName={ROOT_PATH} />
        </SchemaProvider>
      </ModelContextProvider>,
    );
    const checkbox = getByRole('checkbox');
    act(() => {
      fireEvent.click(checkbox);
    });
    expect(onPropertyChange).toHaveBeenCalledWith(ROOT_PATH, true);
  });

  it('should be disabled if disabled from context', () => {
    const { getByRole } = render(
      <ModelContextProvider model={false} onPropertyChange={jest.fn()} disabled>
        <SchemaProvider schema={{ type: 'boolean', title: 'Boolean Field', default: false }}>
          <BooleanField propName={ROOT_PATH} />
        </SchemaProvider>
      </ModelContextProvider>,
    );
    const checkbox = getByRole('checkbox');
    expect(checkbox).toBeDisabled();
  });

  it('should pass required prop to FieldWrapper', () => {
    const { getByText } = renderWithProviders(<BooleanField propName={ROOT_PATH} required />);
    // Should render the title, which is passed to FieldWrapper
    expect(getByText('Boolean Field')).toBeInTheDocument();
  });
});
