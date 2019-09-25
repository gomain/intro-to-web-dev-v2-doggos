

describe('Doggoes', function() {
  it('Visits the home page', function() {
    cy.visit('http://localhost:5000');
    cy.get('select').select('french');
    cy.get('button#add-dog').click();
    cy.get('div#doggo-gallery > img');
  });
});
