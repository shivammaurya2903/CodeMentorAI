module.exports = {
  testEnvironment: 'node',
  transformIgnorePatterns: ['node_modules/(?!(@octokit)/)'],
  moduleNameMapper: {
    '^@octokit/rest$': '<rootDir>/node_modules/@octokit/rest/dist-src/index.js',
  },
};
