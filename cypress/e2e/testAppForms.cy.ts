describe('Test for form fields', () => {
  beforeEach(() => {
    cy.openHomePage();
  });

  it('Sample App - insert value into String form field', () => {
    cy.get('[data-testid="undefined-typeahead-select-input"]').eq(0).type('timer');
    cy.get('.pf-v6-c-menu__item-text').contains('timer').click();

    cy.get(`input[name="#.timerName"]`).clear().type('testTimerName');

    cy.checkCodeSpanLine('"timerName": "testTimerName"', 1);
  });

  it('Sample App - insert value into Boolean form field', () => {
    cy.get('[data-testid="undefined-typeahead-select-input"]').eq(0).type('timer');
    cy.get('.pf-v6-c-menu__item-text').contains('timer').click();

    cy.get(`input[name="#.fixedRate"]`).click({ force: true });

    cy.checkCodeSpanLine('"fixedRate": true', 1);
  });

  it('Sample App - insert value into Password form field', () => {
    cy.get('[data-testid="undefined-typeahead-select-input"]').eq(0).type('aws2-s3');
    cy.get('.pf-v6-c-menu__item-text').contains('aws2-s3').click();
    cy.expandWrappedSection('#-Security');

    cy.get(`input[name="#.accessKey"]`).clear().type('testAccessKey');
    cy.get('[data-testid="#.accessKey__toggle-visibility"]').click();
    cy.get(`input[name="#.accessKey"]`).should('have.value', 'testAccessKey');
    cy.get('[data-testid="#.accessKey__toggle-visibility"]').click();
    cy.get(`input[name="#.accessKey"]`).should('have.attr', 'type', 'password');
    cy.checkCodeSpanLine('"accessKey": "testAccessKey"', 1);
  });

  it('Sample App - insert value into enum form field', () => {
    cy.get('[data-testid="undefined-typeahead-select-input"]').eq(0).type('timer');
    cy.get('.pf-v6-c-menu__item-text').contains('timer').click();
    cy.expandWrappedSection('#-Scheduler');

    cy.selectInTypeaheadField('runLoggingLevel', 'INFO');

    cy.checkCodeSpanLine('"runLoggingLevel": "INFO"', 1);
  });

  it('Sample App - insert value into properties form field', () => {
    cy.get('[data-testid="undefined-typeahead-select-input"]').eq(0).type('bean');
    cy.get('.pf-v6-c-menu__item-text').contains('bean').click();
    cy.expandWrappedSection('#-Advanced');

    cy.get('[data-testid="#.parameters__add"]').click();
    cy.get('[data-testid="#.parameters__key"]').click().focused().clear();
    cy.get('[data-testid="#.parameters__key"]').type('testKey');
    cy.get('[data-testid="#.parameters__value"]').type('testValue');

    cy.checkCodeSpanLine('"parameters": {', 1);
    cy.checkCodeSpanLine('"testKey": "testValue"', 1);
  });
});
