module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@rneui|@react-navigation|@react-native-vector-icons|react-native-size-matters)/)'
  ],
  moduleNameMapper: {
    '\\.(ttf|otf|png|jpg|jpeg|svg)$': '<rootDir>/__mocks__/fileMock.js',
    '^react-native-nitro-sqlite$': '<rootDir>/__mocks__/react-native-nitro-sqlite.js',
    '^react-native-nitro-modules$': '<rootDir>/__mocks__/react-native-nitro-modules.js',
  },
};
