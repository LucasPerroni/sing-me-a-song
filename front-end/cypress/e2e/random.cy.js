const URL = "http://localhost:3000"
const data = {
  name: "Bunnies",
  youtubeLink: "https://www.youtube.com/watch?v=hDJkFLnmFHU&ab_channel=GrumpyDogs",
}

beforeEach(() => {
  cy.resetDatabase()
})

describe("Top", () => {
  it("Show random recommendation", () => {
    cy.visit(`${URL}`)

    cy.createRecommendation(data)
    cy.createRecommendation({ ...data, name: "More bunnies" })
    cy.reload()

    cy.get(".recommendation").its("length").should("eq", 2)

    cy.contains("Random").click()
    cy.url().should("eq", `${URL}/random`)
    cy.get(".recommendation").its("length").should("eq", 1)
  })
})
