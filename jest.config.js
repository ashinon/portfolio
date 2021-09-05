const {defaults} = require('jest-config');
module.exports = {
    "verbose": true,
    "moduleFileExtensions": [...defaults.moduleFileExtensions, 'ts', 'tsx'],
    "transform": {
        "^.+\\.ts$": "ts-jest"
    },
    "globals": {
        "ts-jest": {
            "tsConfig": "tsconfig.json"
        }
    },
    "testMatch": [
        "**/tests/**/*.test.ts"
    ],
    "moduleNameMapper": {
        "^#/(.+)": "<rootDir>/src/$1"
    },
    "testEnvironment": "jsdom",
};