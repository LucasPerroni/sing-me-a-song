/// <reference types="Cypress" />

const URL = "http://localhost:3000"
const data = {
  name: "Bunnies",
  youtubeLink: "https://www.youtube.com/watch?v=hDJkFLnmFHU&ab_channel=GrumpyDogs",
}

beforeEach(() => {
  cy.resetDatabase()
})

describe("Home", () => {
  it("Create a recommendation", () => {
    cy.visit(`${URL}`)

    cy.get("#videoName").type(data.name)
    cy.get("#videoLink").type(data.youtubeLink)

    cy.intercept("POST", "/recommendations").as("postRecommendation")
    cy.get("#videoSubmit").click()
    cy.wait("@postRecommendation")

    cy.contains(data.name).should("be.visible")
  })

  it("Upvote and downvote recommendation", () => {
    cy.visit(`${URL}`)
    cy.createRecommendation(data)

    cy.get("#upvote").click()
    cy.get("#score").should("contain", 1)

    for (let i = 0; i <= 5; i++) {
      cy.get("#downvote").click()
    }
    cy.get("#score").should("contain", -5)

    cy.get("#downvote").click()
    cy.contains(data.name).should("not.exist")
  })
})
