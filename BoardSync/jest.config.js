export default {
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
  testMatch: ["<rootDir>/tests/api.test.js"],
  maxWorkers: 1,
  detectOpenHandles: true,
};
