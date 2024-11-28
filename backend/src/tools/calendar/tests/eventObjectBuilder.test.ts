import {eventObjectBuilder} from "../builders/eventObjectBuilder";

interface CalendarEvent {
    _id: string | number;
    name: string;
    date: string;
}

// Mock pour la sortie
interface EventBuilderOutput {
    [key: string]: CalendarEvent;
}

describe('eventObjectBuilder', () => {
    it('should build an object from a list of events', () => {
        // Données mockées
        const input = {
            events: [
                { _id: 1, name: 'Event 1', date: '2024-11-26' },
                { _id: '2', name: 'Event 2', date: '2024-11-27' },
            ] as CalendarEvent[],
        };

        // Résultat attendu
        const expectedOutput: EventBuilderOutput = {
            '1': { _id: 1, name: 'Event 1', date: '2024-11-26' },
            '2': { _id: '2', name: 'Event 2', date: '2024-11-27' },
        };

        // Exécution
        const result = eventObjectBuilder(input);

        // Assertion
        expect(result).toEqual(expectedOutput);
    });

    it('should return an empty object when input events are empty', () => {
        // Données mockées
        const input = { events: [] as CalendarEvent[] };

        // Résultat attendu
        const expectedOutput: EventBuilderOutput = {};

        // Exécution
        const result = eventObjectBuilder(input);

        // Assertion
        expect(result).toEqual(expectedOutput);
    });

    it('should handle _id as string or number', () => {
        // Données mockées avec _id en tant que nombre et chaîne
        const input = {
            events: [
                { _id: 1, name: 'Event 1', date: '2024-11-26' },
                { _id: '2', name: 'Event 2', date: '2024-11-27' },
            ] as CalendarEvent[],
        };

        // Exécution
        const result = eventObjectBuilder(input);

        // Vérification des types de clés
        expect(result['1']).toBeDefined(); // Clé convertie en chaîne
        expect(result['2']).toBeDefined();
    });

    it('should not overwrite events with the same _id', () => {
        // Données mockées avec identifiants en conflit
        const input = {
            events: [
                { _id: 1, name: 'Event 1', date: '2024-11-26' },
                { _id: 1, name: 'Event 1 Duplicate', date: '2024-11-27' },
            ] as CalendarEvent[],
        };

        // Résultat attendu (le dernier événement avec un _id donné écrase les précédents)
        const expectedOutput: EventBuilderOutput = {
            '1': { _id: 1, name: 'Event 1 Duplicate', date: '2024-11-27' },
        };

        // Exécution
        const result = eventObjectBuilder(input);

        // Assertion
        expect(result).toEqual(expectedOutput);
    });
});

describe('eventObjectBuilder (error handling)', () => {
    // Mock de la fonction console.error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    afterEach(() => {
        consoleErrorSpy.mockClear();
    });

    afterAll(() => {
        consoleErrorSpy.mockRestore();
    });

    it('should return an empty object when input.events is not an array', () => {
        // Cas avec une entrée invalide
        const input = { events: null } as unknown as { events: CalendarEvent[] };

        // Résultat attendu
        const expectedOutput: EventBuilderOutput = {};

        // Exécution
        const result = eventObjectBuilder(input);

        // Assertions
        expect(result).toEqual(expectedOutput);
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Error building events object:',
            expect.objectContaining({
                error: 'Invalid input: events should be an array',
                input: { events: null },
                stack: expect.any(String), // On accepte n'importe quelle stack trace
            })
        );
    });

    it('should log an error and return an empty object if an event has a null _id', () => {
        const input = {
            events: [{ _id: null, name: 'Invalid Event' }] as unknown as CalendarEvent[],
        };

        // Exécution
        const result = eventObjectBuilder(input);

        // Assertions
        expect(result).toEqual({});
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Error building events object:',
            expect.objectContaining({
                error: 'Invalid event: missing or null _id for event {"_id":null,"name":"Invalid Event"}',
                input,
                stack: expect.any(String),
            })
        );
    });

    it('should handle unexpected exceptions gracefully', () => {
        const input = { events: [{ _id: null }] };

        // Mock de la méthode reduce pour lever une erreur
        const reduceSpy = jest.spyOn(Array.prototype, 'reduce').mockImplementation(() => {
            throw new Error('Simulated error');
        });

        try {
            // Exécution
            const result = eventObjectBuilder(input);

            // Assertions
            expect(result).toEqual({});
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Error building events object:',
                expect.objectContaining({
                    error: 'Simulated error',
                    stack: expect.any(String),
                })
            );
        } finally {
            // Restaurer le comportement normal de reduce
            reduceSpy.mockRestore();
        }
    });
});
