module.exports = {
  collectCoverageFrom: ['src/**/*.{ts,tsx}'],
  coveragePathIgnorePatterns: ['\\.d\\.ts$'],
  coverageReporters: ['lcov'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleDirectories: ['<rootDir>/src', 'node_modules'],
  testRegex: '\\.spec\\.(ts|tsx)$',
  testURL: 'http://localhost:3000',
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': 'babel-jest'
  },
  watchPlugins: ['jest-watch-typeahead/filename', 'jest-watch-typeahead/testname'],
  setupFilesAfterEnv: ['react-testing-library/cleanup-after-each', 'jest-dom/extend-expect'],
  moduleNameMapper: {
    '^@[/](.*)': '<rootDir>/src/$1'
  }
}
