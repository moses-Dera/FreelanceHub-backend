export default {
    preset: 'ts-jest/presets/default-esm',
    testEnvironment: 'node',
    transform: {
        '^.+\\.tsx?$': ['ts-jest', { useESM: true }]
    },
    extensionsToTreatAsEsm: ['.ts'],
    moduleNameMapper: {
        '^(\\.{1,2}/(?!generated).+)\\.js$': '$1',
    },
    setupFilesAfterEnv: ['<rootDir>/tests/prismaMock.ts'],
    testPathIgnorePatterns: ['<rootDir>/scripts/', '<rootDir>/node_modules/'],
};
