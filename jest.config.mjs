import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@/assets/(.*)$": "<rootDir>/public/assets/$1",
    "^jspdf$": "<rootDir>/src/__mocks__/jspdf.mock.ts",
  },
  modulePathIgnorePatterns: ["<rootDir>/.next/"],
  testPathIgnorePatterns: ["<rootDir>/.next/"],
  transformIgnorePatterns: [
    "node_modules/(?!swiper)/",
  ],
};

export default createJestConfig(customJestConfig);
