import supertest from "supertest"
import { faker } from "@faker-js/faker"

import app from "../src/app.js"
import { prisma } from "../src/database.js"
import { createRecommendation } from "./factory/recommendationFactory.js"

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
    const { data, link } = await createRecommendation()

    const response = await supertest(app).post(`/recommendations/${link.id}/upvote`)
    const newLink = await prisma.recommendation.findUnique({ where: { id: link.id } })

    expect(response.status).toBe(200)
    expect(newLink.score).toStrictEqual(1)
  })
})

describe("POST /recommendations/:id/downvote", () => {
  it("return 200 with five downvotes", async () => {
    const { data, link } = await createRecommendation()

    for (let i = 0; i < 4; i++) {
      await supertest(app).post(`/recommendations/${link.id}/downvote`)
    }

    const response = await supertest(app).post(`/recommendations/${link.id}/downvote`)
    const newLink = await prisma.recommendation.findUnique({ where: { id: link.id } })

    expect(response.status).toBe(200)
    expect(newLink.score).toStrictEqual(-5)
  })

  it("return 200 and delete recommendation with six downvotes", async () => {
    const { data, link } = await createRecommendation()

    for (let i = 0; i < 5; i++) {
      await supertest(app).post(`/recommendations/${link.id}/downvote`)
    }

    const response = await supertest(app).post(`/recommendations/${link.id}/downvote`)
    const newLink = await prisma.recommendation.findUnique({ where: { id: link.id } })

    expect(response.status).toBe(200)
    expect(newLink).toBeNull()
  })
})
