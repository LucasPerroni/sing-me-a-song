import supertest from "supertest"
import { faker } from "@faker-js/faker"

import { prisma } from "../../src/database.js"
import app from "../../src/app.js"

export async function createRecommendation() {
  const data = {
    name: faker.random.words(3),
    youtubeLink: `https://www.youtube.com/watch?v=${faker.random.alphaNumeric(5)}`,
  }

  await supertest(app).post("/recommendations").send(data)
  const link = await prisma.recommendation.findFirst({ where: { name: data.name } })

  return { data, link }
}
