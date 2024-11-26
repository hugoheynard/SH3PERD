import {addUserInformations} from "../addUserInformations";

describe('addUserInformations', () => {
    it('doit retourner un objet contenant le prénom et la catégorie des fonctions d’un utilisateur complet', () => {
        const user = {
            firstName: 'John',
            functions: {
                category: 'Manager',
            },
        };

        const result = addUserInformations(user);

        expect(result).toEqual({
            firstName: 'John',
            functions: {
                category: 'Manager',
            },
        });
    });

    it('doit retourner un objet avec une catégorie de fonctions undefined si elle est absente', () => {
        const user = {
            firstName: 'Jane',
            functions: {}, // Pas de catégorie
        };

        const result = addUserInformations(user);

        expect(result).toEqual({
            firstName: 'Jane',
            functions: {
                category: undefined,
            },
        });
    });

    it('doit retourner un objet avec firstName undefined si l’utilisateur n’a pas de prénom', () => {
        const user = {
            functions: {
                category: 'Developer',
            },
        };

        const result = addUserInformations(user);

        expect(result).toEqual({
            firstName: undefined,
            functions: {
                category: 'Developer',
            },
        });
    });

    it('doit gérer les entrées totalement vides et retourner un objet avec des valeurs undefined', () => {
        const user = {};

        const result = addUserInformations(user);

        expect(result).toEqual({
            firstName: undefined,
            functions: {
                category: undefined,
            },
        });
    });

    it('doit lever une erreur si l’utilisateur est null ou non défini', () => {
        expect(() => addUserInformations(null)).toThrow();
        expect(() => addUserInformations(undefined)).toThrow();
    });
});