export default {
  testEnvironment: 'node',
  transform: {},
  roots: ['<rootDir>/tests'],
  moduleFileExtensions: ['js', 'json'],
  verbose: true,
  collectCoverage: true,
  coveragePathIgnorePatterns: ['/node_modules/', '/src/generated/'],
};
