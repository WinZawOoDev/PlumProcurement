module.exports = {
  preset: 'react-native',
  testPathIgnorePatterns: ['/node_modules/', '/e2e/'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@rneui|@react-navigation|@react-native-vector-icons|react-native-size-matters|react-native-toast-message)/)'
  ],
  moduleNameMapper: {
    '\\.(ttf|otf|png|jpg|jpeg|svg)$': '<rootDir>/__mocks__/fileMock.js',
    '^react-native-nitro-sqlite$': '<rootDir>/__mocks__/react-native-nitro-sqlite.js',
    '^react-native-nitro-modules$': '<rootDir>/__mocks__/react-native-nitro-modules.js',
  },
};
