{
  "preset": "ts-jest",
  "testEnvironment": "jsdom",
  "roots": ["<rootDir>/__tests__"],
  "testMatch": ["**/__tests__/**/*.test.ts?", "**/?(*.)+(spec|test).ts?"],
  "transform": {
    "^.+\\.tsx?$": "ts-jest"
  },
  "moduleNameMapper": {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@remotion/(.*)$": "<rootDir>/node_modules/@remotion/$1"
  },
  "collectCoverageFrom": [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*.stories.{js,jsx,ts,tsx}",
    "!src/**/__tests__/**"
  ],
  "coverageThreshold": {
    "global": {
      "branches": 70,
      "functions": 75,
      "lines": 80,
      "statements": 80
    }
  },
  "coverageReporters": [
    "text",
    "lcov",
    "html"
  ],
  "setupFilesAfterEnv": ["<rootDir>/__tests__/setup.ts"],
  "testTimeout": 10000,
  "verbose": true
}
