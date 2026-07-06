const USUARIO = "paciente.prueba";
const PASSWORD = "123456";

describe("Búsqueda de turnos", () => {
  it("un paciente se loguea, filtra por especialidad y sede, y ve resultados", () => {
    cy.intercept("POST", "**/auth").as("login");
    cy.intercept({ method: "GET", pathname: "/turnos/" }).as("getTurnos");
    cy.intercept({ method: "GET", pathname: "/especialidades/genericas" }).as("getEspecialidades");
    cy.intercept({ method: "GET", pathname: "/sedes/" }).as("getSedes");

    // Login
    cy.visit("/login");
    cy.get("#nombreUsuario").type(USUARIO);
    cy.get("#password").type(PASSWORD, { log: false });
    cy.get("button[type='submit']").click();

    // Timeout alto por el cold start de Render (free tier)
    cy.wait("@login", { timeout: 90000 }).its("response.statusCode").should("eq", 200);
    cy.location("pathname").should("eq", "/");

    // Navegar a "Buscar turnos"
    cy.contains(".ant-menu a", "Buscar turnos").click();
    cy.location("pathname").should("eq", "/buscar");

    // Esperar catálogos y carga inicial de turnos
    cy.wait(["@getEspecialidades", "@getSedes", "@getTurnos"], { timeout: 30000 });

    // Filtro de especialidad
    cy.contains(".ant-form-item", "Especialidad").find(".ant-select-selector").click();
    cy.get(".ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option")
      .first()
      .click();

    // Filtro de sede
    cy.contains(".ant-form-item", "Sede").find(".ant-select-selector").click();
    cy.get(".ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option")
      .first()
      .click();

    // Buscar
    cy.contains(".ant-card", "Filtros").contains("button", "Buscar").click();
    cy.wait("@getTurnos", { timeout: 30000 });
    cy.location("search")
      .should("include", "especialidadGenericaId")
      .and("include", "sedeId");

    // Al menos una card con médico y fecha
    cy.get(".ant-list-item").should("have.length.at.least", 1);
    cy.get(".ant-list-item")
      .first()
      .within(() => {
        cy.get(".ant-list-item-meta-title")
          .invoke("text")
          .should("match", /Dr\. .+/);
        cy.get(".ant-list-item-meta-avatar")
          .invoke("text")
          .should("match", /\d{1,2}(Ene|Feb|Mar|Abr|May|Jun|Jul|Ago|Sep|Oct|Nov|Dic)/);
        cy.contains(/\d{2}:\d{2}/);
      });
  });
});
