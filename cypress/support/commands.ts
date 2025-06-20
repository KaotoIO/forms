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
      checkCodeSpanLine(spanText: string, linesCount?: number): Chainable<JQuery<HTMLElement>>;
      openHomePage(): Chainable<JQuery<HTMLElement>>;
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
  cy.get(`[data-testid="#.${inputGroup}-typeahead-select-input"]`).within(() => {
    cy.get('input.pf-v6-c-text-input-group__text-input').clear();
  });
  cy.get('.pf-v6-c-menu__item-text').contains(value).click();
});

Cypress.Commands.add('switchWrappedSection', (sectionName: string, wrapped: boolean) => {
  cy.get(`div[aria-labelledby^="${sectionName}"]`)
    .scrollIntoView()
    .within(() => {
      cy.get('button').each(($button) => {
        if ($button.attr('aria-expanded') === String(wrapped)) {
          cy.wrap($button).click();
          cy.wrap($button).should('have.attr', 'aria-expanded', String(!wrapped));
        }
      });
    });
});
