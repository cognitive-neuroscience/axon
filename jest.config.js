var preset = require('jest-preset-angular/jest-preset');
module.exports = {
    ...preset,
    preset: 'jest-preset-angular',
    setupFilesAfterEnv: ['./setupJest.js'],
    testMatch: ['**/*.spec.ts'],
    globals: {
        ...preset.globals,
        tsConfig: 'src/tsconfig.spec.json',
        isolatedModules: true,
    },
    moduleNameMapper: {
        '^src/(.*)$': '<rootDir>/src/$1',
    },
};
