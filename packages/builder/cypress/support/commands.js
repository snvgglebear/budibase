// ***********************************************
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//

export function checkIfElementExists(el) {
  return new Promise(resolve => {
    /// here if  ele exists or not
    cy.get("body").then(body => {
      const found = body.find(el)
      console.log(found)
      console.log(found.length)
      if (found.length > 0) {
        resolve(true)
      } else {
        resolve(false)
      }
    })
  })
}

async function isFirstApp() {
  return checkIfElementExists(".empty-wrapper")
}

Cypress.Commands.add("login", () => {
  cy.visit(`localhost:${Cypress.env("PORT")}/builder`)
  cy.wait(500)
  cy.url().then(url => {
    if (url.includes("builder/admin")) {
      // create admin user
      cy.get("input").first().type("test@test.com")
      cy.get('input[type="password"]').first().type("test")
      cy.get('input[type="password"]').eq(1).type("test")
      cy.contains("Create super admin user").click()
    }
    if (url.includes("builder/auth/login") || url.includes("builder/admin")) {
      // login
      cy.contains("Sign in to Budibase").then(() => {
        cy.get("input").first().type("test@test.com")
        cy.get('input[type="password"]').type("test")
        cy.get("button").first().click()
      })
    }
  })
})

Cypress.Commands.add("createApp", name => {
  cy.visit(`localhost:${Cypress.env("PORT")}/builder`)
  cy.wait(500)
  isFirstApp().then(isFirst => {
    console.log(isFirst)
    const buttonText = isFirst ? "Create app" : "Create new app"
    cy.contains(buttonText).click()
    cy.get("body").then(() => {
      cy.get(".spectrum-Modal")
        .within(() => {
          cy.get("input").eq(0).type(name).should("have.value", name).blur()
          cy.contains("Create app").click()
        })
        .then(() => {
          cy.get("[data-cy=new-table]", {
            timeout: 20000,
          }).should("be.visible")
        })
    })
  })
})

Cypress.Commands.add("deleteApp", () => {
  cy.visit(`localhost:${Cypress.env("PORT")}/builder`)
  cy.wait(1000)

  isFirstApp().then(isFirst => {
    if (!isFirst) {
      cy.get(".hoverable > use").click()
      cy.contains("Delete").click()
      cy.get(".spectrum-Button--warning").click()
    }
  })
})

Cypress.Commands.add("createTestApp", () => {
  const appName = "Cypress Tests"
  cy.deleteApp()
  cy.createApp(appName, "This app is used for Cypress testing.")
})

Cypress.Commands.add("createTestTableWithData", () => {
  cy.createTable("dog")
  cy.addColumn("dog", "name", "Text")
  cy.addColumn("dog", "age", "Number")
})

Cypress.Commands.add("createTable", tableName => {
  // Enter table name
  cy.get("[data-cy=new-table]").click()
  cy.get(".spectrum-Modal").within(() => {
    cy.get("input").first().type(tableName).blur()
    cy.get(".spectrum-ButtonGroup").contains("Create").click()
  })
  cy.contains(tableName).should("be.visible")
})

Cypress.Commands.add("addColumn", (tableName, columnName, type) => {
  // Select Table
  cy.contains(".nav-item", tableName).click()
  cy.contains("Create column").click()

  // Configure column
  cy.get(".spectrum-Modal").within(() => {
    cy.get("input").first().type(columnName).blur()

    // Unset table display column
    cy.contains("display column").click({ force: true })
    cy.get(".spectrum-Picker-label").click()
    cy.contains(type).click()

    cy.contains("Save Column").click()
  })
})

Cypress.Commands.add("addRow", values => {
  cy.contains("Create row").click()
  cy.get(".spectrum-Modal").within(() => {
    for (let i = 0; i < values.length; i++) {
      cy.get("input").eq(i).type(values[i]).blur()
    }
    cy.get(".spectrum-ButtonGroup").contains("Create").click()
  })
})

Cypress.Commands.add("createUser", email => {
  // quick hacky recorded way to create a user
  cy.contains("Users").click()
  cy.get(".spectrum-Button--primary").click()
  cy.get(".spectrum-Picker-label").click()
  cy.get(".spectrum-Menu-item:nth-child(2) > .spectrum-Menu-itemLabel").click()
  cy.get(".spectrum-Modal input").eq(1).type(email, { force: true })
  cy.get(".spectrum-Button--cta").click({ force: true })
})

Cypress.Commands.add("addComponent", (category, component) => {
  if (category) {
    cy.get(`[data-cy="category-${category}"]`).click()
  }
  cy.get(`[data-cy="component-${component}"]`).click()
  cy.wait(1000)
  cy.location().then(loc => {
    const params = loc.pathname.split("/")
    const componentId = params[params.length - 1]
    cy.getComponent(componentId).should("exist")
    return cy.wrap(componentId)
  })
})

Cypress.Commands.add("getComponent", componentId => {
  return cy
    .get("iframe")
    .its("0.contentDocument")
    .should("exist")
    .its("body")
    .should("not.be.null")
    .then(cy.wrap)
    .find(`[data-component-id=${componentId}]`)
})

Cypress.Commands.add("navigateToFrontend", () => {
  cy.contains("Design").click()
})

Cypress.Commands.add("createScreen", (screenName, route) => {
  cy.get("[aria-label=AddCircle]").click()
  cy.get(".spectrum-Modal").within(() => {
    cy.get("input").first().type(screenName)
    cy.get("input").eq(1).type(route)
    cy.get(".spectrum-Button--cta").click()
  })
  cy.get(".nav-items-container").within(() => {
    cy.contains(route).should("exist")
  })
})
