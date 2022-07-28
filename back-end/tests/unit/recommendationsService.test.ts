import { faker } from "@faker-js/faker"
import { jest } from "@jest/globals"

import { recommendationService as Service } from "../../src/services/recommendationsService.js"
import { recommendationRepository } from "../../src/repositories/recommendationRepository.js"

describe("Test insert()", () => {
  it("Insert test return true", async () => {
    jest.spyOn(recommendationRepository, "findByName").mockImplementationOnce(() => null)
    jest.spyOn(recommendationRepository, "create").mockImplementation(() => null)

    let error = null

    try {
      await Service.insert({
        name: faker.random.words(3),
        youtubeLink: `https://www.youtube.com/watch?v=${faker.random.alphaNumeric(5)}`,
      })
    } catch (e) {
      error = e
    }

    expect(error).toBeNull()
  })

  it("Insert test return error", async () => {
    jest.spyOn(recommendationRepository, "findByName").mockImplementationOnce(async () => {
      return { id: 1, name: "random_name", youtubeLink: "random_url", score: 0 }
    })
    let error = null

    try {
      await Service.insert({
        name: faker.random.words(3),
        youtubeLink: `https://www.youtube.com/watch?v=${faker.random.alphaNumeric(5)}`,
      })
    } catch (e) {
      error = e
    }

    expect(error).not.toBeNull()
    expect(error.type).toStrictEqual("conflict")
  })
})

describe("Test upvote()", () => {
  it("Upvote recommendation", async () => {
    jest.spyOn(recommendationRepository, "find").mockImplementationOnce(async () => {
      return { id: 1, name: "random_name", youtubeLink: "random_url", score: 0 }
    })
    jest.spyOn(recommendationRepository, "updateScore").mockImplementation(() => null)

    let error = null

    try {
      await Service.upvote(1)
    } catch (e) {
      error = e
    }

    expect(error).toBeNull()
  })

  it("Fail to upvote recommendation", async () => {
    let error = null

    jest.spyOn(recommendationRepository, "find").mockImplementationOnce(async () => null)

    try {
      await Service.upvote(1)
    } catch (e) {
      error = e
    }

    expect(error).not.toBeNull()
    expect(error.type).toStrictEqual("not_found")
  })
})

describe("Test downvote()", () => {
  it("Downvote recommendation", async () => {
    let error = null

    jest.spyOn(recommendationRepository, "find").mockImplementationOnce(async () => {
      return { id: 1, name: "random_name", youtubeLink: "random_url", score: 0 }
    })
    jest.spyOn(recommendationRepository, "updateScore").mockImplementationOnce(async () => {
      return { id: 1, name: "random_name", youtubeLink: "random_url", score: -1 }
    })

    try {
      await Service.downvote(1)
    } catch (e) {
      error = e
    }

    expect(error).toBeNull()
  })

  it("Delete recommendation", async () => {
    let error = null
    let deletion = false

    jest.spyOn(recommendationRepository, "find").mockImplementationOnce(async () => {
      return { id: 1, name: "random_name", youtubeLink: "random_url", score: 0 }
    })
    jest.spyOn(recommendationRepository, "updateScore").mockImplementationOnce(async () => {
      return { id: 1, name: "random_name", youtubeLink: "random_url", score: -6 }
    })
    jest.spyOn(recommendationRepository, "remove").mockImplementation(() => {
      deletion = true
      return null
    })

    try {
      await Service.downvote(1)
    } catch (e) {
      error = e
    }

    expect(error).toBeNull()
    expect(deletion).toBe(true)
  })

  it("Fail to upvote recommendation", async () => {
    let error = null

    jest.spyOn(recommendationRepository, "find").mockImplementationOnce(async () => null)

    try {
      await Service.downvote(1)
    } catch (e) {
      error = e
    }

    expect(error).not.toBeNull()
    expect(error.type).toStrictEqual("not_found")
  })
})

describe("Test get()", () => {
  it("Return array of tests", async () => {
    let error = null

    jest.spyOn(recommendationRepository, "findAll").mockImplementation(async () => {
      return [{ id: 1, name: "random_name", youtubeLink: "random_url", score: 0 }]
    })

    try {
      await Service.get()
    } catch (e) {
      error = e
    }

    expect(error).toBeNull()
  })
})

describe("Test getTop()", () => {
  it("Return array of tests", async () => {
    let error = null

    jest.spyOn(recommendationRepository, "getAmountByScore").mockImplementation(async () => {
      return [{ id: 1, name: "random_name", youtubeLink: "random_url", score: 0 }]
    })

    try {
      await Service.getTop(1)
    } catch (e) {
      error = e
    }

    expect(error).toBeNull()
  })
})

describe("Test getRandom()", () => {
  it("Return recommendation with 'gt'", async () => {
    let error = null

    jest.spyOn(Math, "random").mockImplementationOnce(() => 0.6)
    jest.spyOn(recommendationRepository, "findAll").mockImplementationOnce(async () => {
      return [{ id: 1, name: "random_name", youtubeLink: "random_url", score: 0 }]
    })

    try {
      await Service.getRandom()
    } catch (e) {
      error = e
    }

    expect(error).toBeNull()
  })

  it("Return recommendation with 'lte'", async () => {
    let error = null

    jest.spyOn(Math, "random").mockImplementationOnce(() => 0.8)
    jest.spyOn(recommendationRepository, "findAll").mockImplementationOnce(async () => {
      return [{ id: 1, name: "random_name", youtubeLink: "random_url", score: 0 }]
    })

    try {
      await Service.getRandom()
    } catch (e) {
      error = e
    }

    expect(error).toBeNull()
  })

  it("Return no recommendations", async () => {
    let error = null

    jest.spyOn(Math, "random").mockImplementationOnce(() => 0.8)
    jest.spyOn(recommendationRepository, "findAll").mockImplementation(async () => [])

    try {
      await Service.getRandom()
    } catch (e) {
      error = e
    }

    expect(error).not.toBeNull()
    expect(error.type).toStrictEqual("not_found")
  })
})
