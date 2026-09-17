describe('Tempus Wise App', () => {
  it('Loads the splash screen or home dashboard and checks navigation', () => {
    cy.visit('/');
    cy.get('body').should('be.visible');
  });

  it('Verifies navigation to splash page and presence of brand', () => {
    cy.visit('/splash');
    cy.contains('Tempus Wise').should('be.visible');
  });
});