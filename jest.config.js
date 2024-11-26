export default {
    preset: 'ts-jest',  // Utilise ts-jest comme preset pour supporter TypeScript
    testEnvironment: 'node',  // Définit l'environnement de test à 'node' (ou 'jsdom' pour les tests côté navigateur)
    transform: {
        '^.+\\.tsx?$': 'ts-jest',  // Transpile les fichiers TypeScript avant les tests
    },
};