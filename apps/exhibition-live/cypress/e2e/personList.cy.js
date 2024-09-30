describe("Person List Error Check", () => {
  it("should be able to create a new person", () => {
    cy.visit("http://localhost:5173/de/list/Person");
    //bigger window size
    cy.viewport(1920, 1080);

    cy.get("div:nth-child(3)>div:nth-child(1)>button:nth-child(1)").click({
      force: true,
    });
    cy.findByLabelText("Name", { selector: "input", trim: true }).click({
      force: true,
    });
    cy.findByLabelText("Name", { selector: "input", trim: true }).type(
      "Adam Ries",
      { delay: 1 },
    );
    cy.get("div:nth-child(1)>div:nth-child(2)>button:nth-child(1)").click({
      force: true,
    });
    cy.get("textarea").eq(0).click({ force: true });
    cy.get("textarea")
      .eq(0)
      .type("Ein Mathematiker aus Annaberg", { delay: 0 });
    cy.findByLabelText("Geografischer Ort", {
      selector: "input",
      trim: true,
    }).click({ force: true });
    cy.findByLabelText("Geografischer Ort", {
      selector: "input",
      trim: true,
    }).type("Annaberg-Buch");
    cy.get('div[aria-label$="Annaberg-Buchholz"]')
      .closest("li")
      .find('svg[data-testid="CheckIcon"]')
      .eq(0)
      .click({ force: true });

    cy.contains("h4", "Arbeitsorte")
      .closest("div.MuiGrid-item")
      .within(() => {
        cy.get("input").eq(0).click();
        cy.get("input").eq(0).type("09");
        cy.get("input").eq(0).trigger("keydown", { keyCode: 9, which: 9 });
        cy.get("input").eq(1).type("02");
        cy.get("input").eq(1).trigger("keydown", { keyCode: 9, which: 9 });
        cy.get("input").eq(2).type("1878");
        cy.get("input").eq(2).trigger("keydown", { keyCode: 9, which: 9 });
        cy.get("input").eq(3).type("07");
        cy.get("input").eq(3).trigger("keydown", { keyCode: 9, which: 9 });
        cy.get("input").eq(4).type("02");
        cy.get("input").eq(4).trigger("keydown", { keyCode: 9, which: 9 });
        cy.get("input").eq(5).type("1879");

        cy.get('svg[data-testid="CheckIcon"]').eq(0).click({ force: true });
        cy.contains("span", "Annaberg-Buchholz (9.2.1878 - 7.2.1879)").should(
          "exist",
        );
      });

    //cy.screenshot(`createPerson-${(new Date()).getTime()}-${Cypress.env("COMMIT_SHA")}`);

    cy.get('button[aria-label="save"]').click({ force: true });
    cy.get("div#notistack-snackbar").should(
      "have.text",
      "erfolgreich gespeichert",
    );
    cy.wait(1000);
    //cy.get("div:nth-child(1)>div:nth-child(1)>div:nth-child(1)>div:nth-child(1)>button:nth-child(1)").click({ force: true})
    //cy.get("div.MuiTypography-h1")//.should('have.text',"Adam Ries")

    cy.screenshot(
      `showPerson-${new Date().getTime()}-${Cypress.env("COMMIT_SHA")}`,
    );
  });

  it('should check for "Cannot read properties of null error', () => {
    cy.visit("http://localhost:5173/de/list/Person");

    cy.screenshot(
      `useContext-${new Date().getTime()}-${Cypress.env("COMMIT_SHA")}`,
    );

    cy.on("uncaught:exception", () => {
      // Listen for JavaScript errors
      return false;
    });

    try {
      cy.contains("h3", "Cannot read properties of null").should("not.exist");
    } catch (error) {
      // This block will execute if the element is not found
      cy.log("Error message not found, as expected.");
    }
  });
});
