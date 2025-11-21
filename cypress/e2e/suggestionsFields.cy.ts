describe('Test for suggestions for form fields', () => {
  beforeEach(() => {
    cy.openHomePage();
  });

  it('Sample App - suggestions in String form field using Alt+Escape shortcut', () => {
    cy.selectSchema('timer');
    cy.get('input[name="#.timerName"]').clear().type('testTimerName');

    // Simulate Alt+Escape key combo
    cy.get('input[name="#.timerName"]').type('{alt}{esc}');

    cy.get('div').contains('{{testTimerName:default}}').click();

    cy.checkCodeSpanLine('"timerName": "{{testTimerName:default}}"', 1);
  });

  it('Sample App - suggestions in String form field', () => {
    cy.selectSchema('timer');
    cy.get('input[name="#.timerName"]').clear().type('testTimerName');

    cy.get('input[name="#.timerName"]').type('{ctrl}{ }');

    cy.get('div').contains('{{testTimerName:default}}').click();

    cy.checkCodeSpanLine('"timerName": "{{testTimerName:default}}"', 1);
  });

  it('Sample App - suggestions unwrap in String form field', () => {
    cy.selectSchema('timer');
    cy.get('input[name="#.timerName"]').clear().type('testTimerName');

    cy.get('input[name="#.timerName"]').type('{ctrl}{ }');

    cy.get('div').contains('Simple Language').trigger('mouseover');
    cy.get('div').contains('${body}').click({ force: true });

    cy.checkCodeSpanLine('"timerName": "${body}"', 1);
  });

  it('Sample App - suggestions in TextArea form field', () => {
    cy.selectSchema('langchain4j-tools');
    cy.get('textarea[name="#.description"]').clear().type('testTimerName');

    cy.get('textarea[name="#.description"]').type('{ctrl}{ }');

    cy.get('div').contains('Simple Language').trigger('mouseover');
    cy.get('div').contains('${body}').click({ force: true });

    cy.checkCodeSpanLine('"description": "${body}"', 1);
  });

  it('Sample App - suggestions in Properties form field', () => {
    cy.selectSchema('bean');
    cy.expandWrappedSection('#-Advanced');

    cy.get('[data-testid="#.parameters__add"]').click();
    cy.get('[data-testid="#.parameters__key"]').click().focused().clear();
    cy.get('[data-testid="#.parameters__key"]').type('testKey');
    cy.get('[data-testid="#.parameters__value"]').type('testValue');
    cy.get('[data-testid="#.parameters__value"]').type('{ctrl}{ }');
    cy.get('div').contains('{{testValue:default}}').click();

    cy.checkCodeSpanLine('"parameters": {', 1);
    cy.checkCodeSpanLine('"testKey": "{{testValue:default}}"', 1);
  });
});
