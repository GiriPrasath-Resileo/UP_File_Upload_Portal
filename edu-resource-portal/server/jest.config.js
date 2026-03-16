/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/app.ts',
    '!src/config/env.ts',
    '!src/config/db.ts',
    '!src/config/s3.ts',
    '!src/utils/logger.ts',
    '!src/routes/index.ts',
    '!src/controllers/**',
    '!src/services/**',
    '!src/middleware/upload.middleware.ts',
    '!src/**/*.d.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['json-summary', 'text', 'lcov'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.json', diagnostics: false }],
  },
  moduleNameMapper: {
    '^@edu-portal/shared$': '<rootDir>/../shared/src/schemas/index.ts',
  },
};
