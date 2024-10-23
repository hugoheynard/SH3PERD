export default {
    testEnvironment: 'jest-environment-jsdom',
    transform: {
        '^.+\\.js$': 'babel-jest',
    },
    moduleFileExtensions: ['js', 'jsx'],
    //setupFilesAfterEnv: ['./jest.setup.js']
};