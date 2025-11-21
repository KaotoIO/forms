/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// Add custom command type definition
export {};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      openHomePage(): Chainable<JQuery<HTMLElement>>;
      selectSchema(schemaName: string): Chainable<JQuery<HTMLElement>>;
      checkCodeSpanLine(spanText: string, linesCount?: number): Chainable<JQuery<HTMLElement>>;
      expandWrappedSection(sectionName: string): Chainable<JQuery<HTMLElement>>;
      closeWrappedSection(sectionName: string): Chainable<JQuery<HTMLElement>>;
      selectInTypeaheadField(inputGroup: string, value: string): Chainable<JQuery<HTMLElement>>;
      switchWrappedSection(sectionName: string, wrapped: boolean): Chainable<JQuery<HTMLElement>>;
    }
  }
}

Cypress.Commands.add('openHomePage', () => {
  const url = Cypress.config().baseUrl;
  cy.visit(url!);
});

Cypress.Commands.add('selectSchema', (schemaName: string) => {
  cy.get('[data-testid="schema-selector"]').click();
  cy.get('[data-testid="schema-selector"]').clear();
  cy.get('[data-testid="schema-selector"]').type(schemaName);
  cy.get('.cds--list-box__menu-item').contains(schemaName).click({ force: true });
});

Cypress.Commands.add('checkCodeSpanLine', (spanText: string, linesCount?: number) => {
  linesCount = linesCount ?? 1;
  cy.get('.pf-v6-c-code-editor')
    .eq(1)
    .within(() => {
      cy.get('span:only-child').contains(spanText).should('have.length', linesCount);
    });
});

Cypress.Commands.add('expandWrappedSection', (sectionName: string) => {
  cy.switchWrappedSection(sectionName, false);
});

Cypress.Commands.add('closeWrappedSection', (sectionName: string) => {
  cy.switchWrappedSection(sectionName, true);
});

Cypress.Commands.add('selectInTypeaheadField', (inputGroup: string, value: string) => {
  cy.get(`[data-testid="#.${inputGroup}"]`).click();
  cy.get('[role="option"]').contains(value).click();
});

Cypress.Commands.add('switchWrappedSection', (sectionName: string, wrapped: boolean) => {
  cy.get(`[data-testid="${sectionName}"]`)
    .scrollIntoView()
    .within(() => {
      cy.get('button')
        .first()
        .then(($button) => {
          cy.wrap($button).click();
          cy.wrap($button).should('have.attr', 'aria-expanded', String(!wrapped));
        });
    });
});
