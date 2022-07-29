const URL = "http://localhost:3000"
const data = {
  name: "Bunnies",
  youtubeLink: "https://www.youtube.com/watch?v=hDJkFLnmFHU&ab_channel=GrumpyDogs",
}

beforeEach(() => {
  cy.resetDatabase()
})

describe("Top", () => {
  it("Show the recommendation with most upvotes", () => {
    cy.visit(`${URL}`)
    cy.createRecommendation(data)

    cy.get("#upvote").click().click()

    cy.createRecommendation({ ...data, name: "More bunnies" })
    cy.reload()

    cy.get(".recommendation").its("length").should("eq", 2)
    cy.get(".recommendation").first().get("#score").should("contain", 0)

    cy.contains("Top").click()
    cy.url().should("eq", `${URL}/top`)

    cy.get(".recommendation").its("length").should("eq", 2)
    cy.get(".recommendation").first().get("#score").should("contain", 2)
  })
})
