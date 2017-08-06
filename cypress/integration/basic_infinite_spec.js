describe('React Infinite Basic Lists', function() {
  it('is able to render a basic list', function() {
    cy.visit('http://localhost:8080/examples/example.html');

    cy.get('#infinite-example-one').as('basic');

    // Shows only
    for (var i = 0; i < 8; i++) {
      cy.get('@basic').should('contain', `List Item ${i}`);
    }

    cy
      .get('@basic')
      .should('not.contain', 'List Item 8')
      .should('not.contain', 'List Item 9');

    cy.get('@basic').then($con => {
      $con.get(0).scrollTop = 400;
    });
  });
});
