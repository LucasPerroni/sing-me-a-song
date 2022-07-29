import { faker } from "@faker-js/faker"
import { jest } from "@jest/globals"

import { recommendationService as Service } from "../../src/services/recommendationsService.js"
import { recommendationRepository } from "../../src/repositories/recommendationRepository.js"

jest.mock("../../src/repositories/recommendationRepository")

describe("Test insert()", () => {
  it("Insert test return true", async () => {
    jest.spyOn(recommendationRepository, "findByName").mockImplementationOnce(() => null)
    jest.spyOn(recommendationRepository, "create").mockImplementation(() => null)

    await Service.insert({
      name: faker.random.words(3),
      youtubeLink: `https://www.youtube.com/watch?v=${faker.random.alphaNumeric(5)}`,
    })

    expect(recommendationRepository.findByName).toBeCalled()
    expect(recommendationRepository.create).toBeCalled()
  })

  it("Insert test return error", async () => {
    jest.spyOn(recommendationRepository, "findByName").mockImplementationOnce(async () => {
      return { id: 1, name: "random_name", youtubeLink: "random_url", score: 0 }
    })

    const promise = Service.insert({
      name: faker.random.words(3),
      youtubeLink: `https://www.youtube.com/watch?v=${faker.random.alphaNumeric(5)}`,
    })

    expect(promise).rejects.toEqual({ type: "conflict", message: "Recommendations names must be unique" })
  })
})

describe("Test upvote()", () => {
  it("Upvote recommendation", async () => {
    jest.spyOn(recommendationRepository, "find").mockImplementationOnce(async () => {
      return { id: 1, name: "random_name", youtubeLink: "random_url", score: 0 }
    })
    jest.spyOn(recommendationRepository, "updateScore").mockImplementation(() => null)

    await Service.upvote(1)

    expect(recommendationRepository.find).toBeCalled()
    expect(recommendationRepository.updateScore).toBeCalled()
  })

  it("Fail to upvote recommendation", async () => {
    jest.spyOn(recommendationRepository, "find").mockImplementationOnce(async () => null)
    const promise = Service.upvote(1)
    expect(promise).rejects.toEqual({ type: "not_found", message: "" })
  })
})

describe("Test downvote()", () => {
  it("Downvote recommendation", async () => {
    jest.spyOn(recommendationRepository, "find").mockImplementationOnce(async () => {
      return { id: 1, name: "random_name", youtubeLink: "random_url", score: 0 }
    })
    jest.spyOn(recommendationRepository, "updateScore").mockImplementationOnce(async () => {
      return { id: 1, name: "random_name", youtubeLink: "random_url", score: -1 }
    })

    await Service.downvote(1)

    expect(recommendationRepository.find).toBeCalled()
    expect(recommendationRepository.updateScore).toBeCalled()
  })

  it("Delete recommendation", async () => {
    jest.spyOn(recommendationRepository, "find").mockImplementationOnce(async () => {
      return { id: 1, name: "random_name", youtubeLink: "random_url", score: 0 }
    })
    jest.spyOn(recommendationRepository, "updateScore").mockImplementationOnce(async () => {
      return { id: 1, name: "random_name", youtubeLink: "random_url", score: -6 }
    })
    jest.spyOn(recommendationRepository, "remove").mockImplementation(() => null)

    await Service.downvote(1)

    expect(recommendationRepository.find).toBeCalled()
    expect(recommendationRepository.updateScore).toBeCalled()
    expect(recommendationRepository.remove).toBeCalled()
  })

  it("Fail to upvote recommendation", async () => {
    jest.spyOn(recommendationRepository, "find").mockImplementationOnce(async () => null)

    const promise = Service.downvote(1)

    expect(promise).rejects.toEqual({ type: "not_found", message: "" })
  })
})

describe("Test get()", () => {
  it("Return array of tests", async () => {
    jest.spyOn(recommendationRepository, "findAll").mockImplementation(async () => {
      return [{ id: 1, name: "random_name", youtubeLink: "random_url", score: 0 }]
    })

    await Service.get()

    expect(recommendationRepository.findAll).toBeCalled()
  })
})

describe("Test getTop()", () => {
  it("Return array of tests", async () => {
    jest.spyOn(recommendationRepository, "getAmountByScore").mockImplementation(async () => {
      return [{ id: 1, name: "random_name", youtubeLink: "random_url", score: 0 }]
    })

    await Service.getTop(1)

    expect(recommendationRepository.getAmountByScore).toBeCalled()
  })
})

describe("Test getRandom()", () => {
  it("Return recommendation with 'gt'", async () => {
    jest.spyOn(Math, "random").mockImplementationOnce(() => 0.6)
    jest.spyOn(recommendationRepository, "findAll").mockImplementationOnce(async () => {
      return [{ id: 1, name: "random_name", youtubeLink: "random_url", score: 0 }]
    })

    await Service.getRandom()

    expect(recommendationRepository.findAll).toBeCalled()
  })

  it("Return recommendation with 'lte'", async () => {
    jest.spyOn(Math, "random").mockImplementationOnce(() => 0.8)
    jest.spyOn(recommendationRepository, "findAll").mockImplementationOnce(async () => {
      return [{ id: 1, name: "random_name", youtubeLink: "random_url", score: 0 }]
    })

    await Service.getRandom()

    expect(recommendationRepository.findAll).toBeCalled()
  })

  it("Return no recommendations", async () => {
    jest.spyOn(Math, "random").mockImplementationOnce(() => 0.8)
    jest.spyOn(recommendationRepository, "findAll").mockImplementation(async () => [])

    const promise = Service.getRandom()

    expect(promise).rejects.toEqual({ type: "not_found", message: "" })
  })
})
