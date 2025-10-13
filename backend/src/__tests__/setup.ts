// Test setup file
import { jest, beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';

// Mock Prisma Client for tests
const mockPrismaClient = {
  $connect: jest.fn(),
  $disconnect: jest.fn(),
  $queryRaw: jest.fn(),
  candidate: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  assessment: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  complianceAudit: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
  tenantSettings: {
    findUnique: jest.fn(),
    upsert: jest.fn(),
  },
  consentRecord: {
    create: jest.fn(),
    findMany: jest.fn(),
    updateMany: jest.fn(),
  },
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => mockPrismaClient),
}));

// Global test configuration
beforeAll(async () => {
  // Setup test environment
});

afterAll(async () => {
  // Cleanup
});

beforeEach(() => {
  // Reset mocks before each test
  jest.clearAllMocks();
});

afterEach(() => {
  // Cleanup after each test
});