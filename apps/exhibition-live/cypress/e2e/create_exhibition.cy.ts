import { clearAllIds } from "@jsonforms/core";

describe("create a simple exhibition (german)", () => {
  it("will save all data correctly", () => {
    cy.visit(
      "/de/create/Exhibition?encID=aHR0cDovL29udG9sb2dpZXMuc2x1Yi1kcmVzZGVuLmRlL2V4aGliaXRpb24vZW50aXR5LzFmODQ2MzBkLWRhNzEtNDkyZS1hYmQxLTE0YzczYjA1NmRiZg==",
    );
    cy.viewport(1920, 1080);
    //clearAllIds();
    cy.wait(2000);
    const titleInput = cy.get(`#${CSS.escape("#/properties/title4-input")}`);
    titleInput.type("Gemälde von");
    titleInput.focus();
    cy.contains("p", "20 gefundene Suchergebnisse");
    titleInput.type("{downarrow}");
    titleInput.type("{downarrow}");
    titleInput.type("{downarrow}");

    cy.get(".accept-button").click();
    cy.get("div.MuiDialogActions-root button").eq(0).click();
    cy.wait(2000);
    const subtitleInput = cy.get(
      `#${CSS.escape("#/properties/subtitle4-input")}`,
    );
    subtitleInput.click();
    subtitleInput.type("2024");
    const originalTitleInput = cy.get(
      `#${CSS.escape("#/properties/originalTitle4-input")}`,
    );
    originalTitleInput.click();
    originalTitleInput.type("Frühjahrsausstellung");
    const genreInput = cy.get("label").contains("Genre").next();
    genreInput.click();
    genreInput.type("Stillleben");
    cy.get("button").contains("Genre neu anlegen").click();
    cy.get('svg[data-testid="SearchIcon"]').last().click();
    cy.get("button").contains("speichern & akzeptieren").click();
    cy.get(`div[data-testid="chip-exhibitionGenre.0-0"]`).contains(
      "Stillleben",
    );
    cy.get("button").contains("weiter").click();
    const placeInput = cy
      .get("label")
      .contains("Ausstellungsorte (Städte und Länder)")
      .next();
    placeInput.click();
    placeInput.type("Dresden");
    cy.get('svg[data-testid="CheckIcon"]').first().click();
    cy.get('button[aria-label="speichern"]').click();
  });
});
