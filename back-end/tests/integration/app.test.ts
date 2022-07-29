import supertest from "supertest"
import { faker } from "@faker-js/faker"
import { jest } from "@jest/globals"

import app from "../../src/app.js"
import { prisma } from "../../src/database.js"
import * as Factory from "../factory/recommendationFactory.js"

beforeEach(async () => {
  await prisma.recommendation.deleteMany()
})

afterEach(async () => {
  await prisma.$disconnect()
})

afterAll(async () => {
  await prisma.recommendation.deleteMany()
})

describe("POST /recommendations", () => {
  it("return 201 with post created", async () => {
    const data = {
      name: faker.random.words(3),
      youtubeLink: `https://www.youtube.com/watch?v=${faker.random.alphaNumeric(5)}`,
    }

    const response = await supertest(app).post("/recommendations").send(data)
    const link = await prisma.recommendation.findFirst({ where: { name: data.name } })

    expect(response.status).toBe(201)
    expect(link).not.toBeNull()
  })

  it("return 422 with wrong url", async () => {
    const data = {
      name: faker.random.words(3),
      youtubeLink: `https://www.google.com`,
    }

    const response = await supertest(app).post("/recommendations").send(data)
    const link = await prisma.recommendation.findFirst({ where: { name: data.name } })

    expect(response.status).toBe(422)
    expect(link).toBeNull()
  })

  it("return 422 without data", async () => {
    const data = {}

    const response = await supertest(app).post("/recommendations").send(data)

    expect(response.status).toBe(422)
  })
})

describe("POST /recommendations/:id/upvote", () => {
  it("return 200 with upvote", async () => {
    const { data, link } = await Factory.createRecommendationAndReturnLink()

    const response = await supertest(app).post(`/recommendations/${link.id}/upvote`)
    const newLink = await prisma.recommendation.findUnique({ where: { id: link.id } })

    expect(response.status).toBe(200)
    expect(newLink.score).toStrictEqual(1)
  })
})

describe("POST /recommendations/:id/downvote", () => {
  it("return 200 with five downvotes", async () => {
    const { data, link } = await Factory.createRecommendationAndReturnLink()

    for (let i = 0; i < 4; i++) {
      await supertest(app).post(`/recommendations/${link.id}/downvote`)
    }

    const response = await supertest(app).post(`/recommendations/${link.id}/downvote`)
    const newLink = await prisma.recommendation.findUnique({ where: { id: link.id } })

    expect(response.status).toBe(200)
    expect(newLink.score).toStrictEqual(-5)
  })

  it("return 200 and delete recommendation with six downvotes", async () => {
    const { data, link } = await Factory.createRecommendationAndReturnLink()

    for (let i = 0; i < 5; i++) {
      await supertest(app).post(`/recommendations/${link.id}/downvote`)
    }

    const response = await supertest(app).post(`/recommendations/${link.id}/downvote`)
    const newLink = await prisma.recommendation.findUnique({ where: { id: link.id } })

    expect(response.status).toBe(200)
    expect(newLink).toBeNull()
  })
})

describe("GET /recommendations", () => {
  it("return 200 with array of 10 recommendations", async () => {
    for (let i = 0; i <= 10; i++) {
      await Factory.createRecommendation()
    }

    const response = await supertest(app).get("/recommendations")

    expect(response.status).toBe(200)
    expect(response.body.length).toBe(10)
  })
})

describe("GET /recommendations/:id", () => {
  it("return 200 with specified recommendation", async () => {
    const { link } = await Factory.createRecommendationAndReturnLink()

    const response = await supertest(app).get(`/recommendations/${link.id}`)

    expect(response.status).toBe(200)
    expect(response.body.id).toStrictEqual(link.id)
  })

  it("return 404 with wrong id", async () => {
    const { link } = await Factory.createRecommendationAndReturnLink()

    const response = await supertest(app).get(`/recommendations/${link.id + 1}`)

    expect(response.status).toBe(404)
    expect(response.body.id).toBeUndefined()
  })
})

describe("GET /recommendations/random", () => {
  it("return 404 without any recommendation", async () => {
    const response = await supertest(app).get("/recommendations/random")
    expect(response.status).toBe(404)
    expect(response.body.id).toBeUndefined()
  })

  it("return recommendation with more than 10 votes", async () => {
    jest.spyOn(Math, "random").mockImplementationOnce(() => 0.5)

    for (let i = 0; i < 9; i++) {
      await Factory.createRecommendation()
    }

    const { link } = await Factory.createRecommendationAndReturnLink()

    for (let i = 0; i < 11; i++) {
      await Factory.upvoteRecommendation(link.id)
    }

    const response = await supertest(app).get("/recommendations/random")

    expect(response.status).toBe(200)
    expect(response.body.id).toStrictEqual(link.id)
  })

  it("return recommendation with less than 10 votes", async () => {
    jest.spyOn(Math, "random").mockImplementationOnce(() => 0.8)

    for (let i = 0; i < 9; i++) {
      const { link } = await Factory.createRecommendationAndReturnLink()
      for (let i = 0; i < 11; i++) {
        await Factory.upvoteRecommendation(link.id)
      }
    }

    const { link } = await Factory.createRecommendationAndReturnLink()
    const response = await supertest(app).get("/recommendations/random")

    expect(response.status).toBe(200)
    expect(response.body.id).toStrictEqual(link.id)
  })
})

describe("GET /recommendations/top/:amount", () => {
  it("return array of 5 racommendations by score", async () => {
    for (let i = 0; i < 5; i++) {
      const { link } = await Factory.createRecommendationAndReturnLink()
      for (let j = i; j < 5; j++) {
        await Factory.upvoteRecommendation(link.id)
      }
    }

    const response = await supertest(app).get("/recommendations/top/5")

    expect(response.status).toBe(200)
    expect(response.body.length).toStrictEqual(5)
    expect(response.body[0].score).toStrictEqual(5)
    expect(response.body[1].score).toStrictEqual(4)
  })

  it("return array of 2 racommendations by score", async () => {
    for (let i = 0; i < 5; i++) {
      const { link } = await Factory.createRecommendationAndReturnLink()
      for (let j = i; j < 5; j++) {
        await Factory.upvoteRecommendation(link.id)
      }
    }

    const response = await supertest(app).get("/recommendations/top/2")

    expect(response.status).toBe(200)
    expect(response.body.length).toStrictEqual(2)
    expect(response.body[1].score).toStrictEqual(4)
  })
})
