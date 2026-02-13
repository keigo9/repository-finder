import type { Config } from "jest";
import nextJest from "next/jest";

const createJestConfig = nextJest({
  // next.config.js と test 環境のための .env.local などのロードを提供
  dir: "./",
});

// Jest に渡すカスタム設定
const config: Config = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testMatch: [
    "**/__tests__/**/*.(test|spec).[jt]s?(x)",
    "**/?(*.)+(spec|test).[jt]s?(x)",
  ],
};

// createJestConfig は、next/jest が非同期で設定をロードできるようにエクスポートされる
export default createJestConfig(config);
