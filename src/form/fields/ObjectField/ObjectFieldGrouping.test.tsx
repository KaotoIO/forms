import { act, fireEvent, render } from '@testing-library/react';
import { FunctionComponent, PropsWithChildren } from 'react';
import { KaotoSchemaDefinition } from '../../models';
import { FilteredFieldContext } from '../../providers/filtered-field.provider';
import { ROOT_PATH } from '../../utils';
import { SchemaProvider } from '../../providers/SchemaProvider';
import { FormWrapper } from '../../testing/FormWrapper';
import { ObjectFieldGrouping } from './ObjectFieldGrouping';

describe('ObjectFieldGrouping', () => {
  const schema: JSONSchema4 = {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        title: 'Id',
      },
      description: {
        type: 'string',
        title: 'Description',
      },
      disabled: {
        type: 'boolean',
        title: 'Disabled',
        $comment: 'group:advanced',
      },
      correlationExpression: {
        title: 'Correlation Expression',
        type: 'string',
        $comment: 'group:common',
      },
    },
  };

  describe('text filtering', () => {
    it('should render all properties if no filter is specified', () => {
      const wrapper = render(<ObjectFieldGrouping propName={ROOT_PATH} />, { wrapper: formWrapper });

      const inputFields = wrapper.queryAllByRole('textbox');
      expect(inputFields).toHaveLength(3);
      expect(inputFields[0]).toHaveAttribute('name', '#.id');
      expect(inputFields[1]).toHaveAttribute('name', '#.description');
      expect(inputFields[2]).toHaveAttribute('name', '#.correlationExpression');

      /* The disabled field should not be rendered because it belongs to the Advanced group*/
      const checkboxFields = wrapper.queryAllByRole('checkbox');
      expect(checkboxFields).toHaveLength(0);
    });

    it('should render properties matching the property name filter', () => {
      const wrapper = render(
        <FilteredFieldContext.Provider
          value={{ filteredFieldText: 'desc', onFilterChange: jest.fn(), isGroupExpanded: false }}
        >
          <ObjectFieldGrouping propName={ROOT_PATH} />
        </FilteredFieldContext.Provider>,
        { wrapper: formWrapper },
      );

      const inputFields = wrapper.queryAllByRole('textbox');
      expect(inputFields).toHaveLength(1);
      expect(inputFields[0]).toHaveAttribute('name', '#.description');
    });
  });

  it('should render anyOf schemas', () => {
    const wrapper = render(
      <SchemaProvider
        schema={{
          anyOf: [
            {
              type: 'string',
              title: 'Name',
            },
          ],
        }}
      >
        <ObjectFieldGrouping propName={ROOT_PATH} />
      </SchemaProvider>,
      { wrapper: formWrapper },
    );

    const inputFields = wrapper.queryAllByRole('textbox');
    expect(inputFields).toHaveLength(1);
    expect(inputFields[0]).toHaveAttribute('name', '#');
  });

  describe('group filtering', () => {
    it('should render property groups', () => {
      const wrapper = render(<ObjectFieldGrouping propName={ROOT_PATH} />, { wrapper: formWrapper });

      const advancedGroup = wrapper.queryByLabelText('Toggle Advanced group');
      expect(advancedGroup).toBeInTheDocument();
    });

    it('should render properties from groups', async () => {
      const wrapper = render(<ObjectFieldGrouping propName={ROOT_PATH} />, { wrapper: formWrapper });

      await act(async () => {
        fireEvent.click(wrapper.getByLabelText('Toggle Advanced group'));
      });

      const checkboxFields = wrapper.queryAllByRole('checkbox');
      expect(checkboxFields).toHaveLength(1);
      expect(checkboxFields[0]).toHaveAttribute('name', '#.disabled');
    });
  });

  const formWrapper: FunctionComponent<PropsWithChildren> = ({ children }) => (
    <SchemaProvider schema={schema}>
      <FormWrapper>{children}</FormWrapper>
    </SchemaProvider>
  );
});
