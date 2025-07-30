module.exports = {
    testEnvironment: 'jest-environment-jsdom',
    transform: {
      '^.+\\.(t|j)sx?$': '@swc/jest',
    },
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/src/$1',
    },
};
