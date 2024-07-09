import { type JestConfigWithTsJest } from "ts-jest";
import { defaults as tsJest } from "ts-jest/presets";

const config: JestConfigWithTsJest = {
  collectCoverageFrom: ["src/*.ts"],
  testEnvironment: "node",
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  transform: {
    ...tsJest.transform,
  },

  setupFilesAfterEnv: ["jest-extended/all", "@shigen/polyfill-symbol-dispose"],
};

export default config;
