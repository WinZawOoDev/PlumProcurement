module.exports = {
  preset: 'react-native',
  setupFiles: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: ['/node_modules/', '/e2e/'],
  transformIgnorePatterns: [
    // react-native-size-matters is a transitive dependency shipped as untranspiled
    // ESM; it must be transformed even though it is not a direct dependency.
    'node_modules/(?!(react-native|@react-native|@rneui|@react-navigation|@react-native-vector-icons|react-native-size-matters|react-native-toast-message)/)'
  ],
  moduleNameMapper: {
    '\\.(ttf|otf|png|jpg|jpeg|svg)$': '<rootDir>/__mocks__/fileMock.js',
    '^react-native-nitro-sqlite$': '<rootDir>/__mocks__/react-native-nitro-sqlite.js',
    '^react-native-nitro-modules$': '<rootDir>/__mocks__/react-native-nitro-modules.js',
  },
};
