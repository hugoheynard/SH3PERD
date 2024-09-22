export default {
    rootDir: '.',
    transform: {
        '^.+\\.js$': 'babel-jest',
    },
    extensionsToTreatAsEsm: [], // Traite les fichiers .js comme des modules ECMAScript
    testEnvironment: 'node', // Utilise l'environnement Node
    moduleNameMapper: {}, // Si vous avez besoin de mapper des modules
    testMatch: ['<rootDir>/**/*.test.js'], // Ajuste selon la structure de ton projet
    moduleDirectories: ['node_modules', '<rootDir>/src'],
    // Autres configurations spécifiques au back-end

};