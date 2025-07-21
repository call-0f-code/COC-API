import { mockDeep, mockReset, DeepMockProxy } from "jest-mock-extended";
import { PrismaClient } from "@prisma/client";

let mock: DeepMockProxy<PrismaClient>;

jest.mock("./src/db/client", () => {
  mock = mockDeep<PrismaClient>();
  return {
    __esModule: true,
    prisma: mock,
  };
});

import { prisma } from "./src/db/client";

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

beforeEach(() => {
  mockReset(prismaMock);
});
