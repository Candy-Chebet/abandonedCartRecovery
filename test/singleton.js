import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset } from 'jest-mock-extended';

jest.mock('../app/db.server', () => ({
  prisma: mockDeep<PrismaClient>(),
}));

import { prisma } from '../app/db.server';

beforeEach(() => {
  mockReset(prisma);
});

export const prismaMock = prisma;