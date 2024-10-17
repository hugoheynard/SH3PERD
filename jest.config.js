export default {
    transform: {
        "^.+\\.[tj]sx?$": "babel-jest", // Use babel-jest for both TypeScript and JavaScript files
    },
    extensionsToTreatAsEsm: [".ts", ".tsx", ".jsx"],
    testEnvironment: "node",
    globals: {
        "ts-jest": {
            useESM: true, // Allow ts-jest to process TypeScript files as ESM
        },
    },
};