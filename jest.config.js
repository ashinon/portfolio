const {defaults} = require('jest-config');
module.exports = {
    "verbose": true,
    // "moduleFileExtensions": [...defaults.moduleFileExtensions, 'ts', 'tsx'],
    "moduleFileExtensions": [
        "ts",
        "tsx",
        "js"
      ],
    "transform": {
        "^.+\\.ts$": "ts-jest",
        '^.+\\.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$': 'jest-transform-stub'
    },

    "globals": {
        "ts-jest": {
            "tsConfig": "tsconfig.json"
            // "skipBabel": "true"
        },
    },
    "testMatch": [
        "**/tests/**/*.test.ts"
    ],
    "moduleNameMapper": {
        // "^#/(.+)": "<rootDir>/src/$1",
        "\\.(jpg|ico|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": "<rootDir>/__mocks__/fileMock.js",
        "\\.(css|scss)$": "<rootDir>/__mocks__/styleMock.js",
    },
    "testEnvironmentOptions": { "resources": "usable" },
    "testEnvironment": "jsdom",
    "restoreMocks": false
};