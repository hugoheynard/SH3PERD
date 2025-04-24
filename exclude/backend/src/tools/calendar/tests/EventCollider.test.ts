
import {EventCollider} from "../../EventCollider";
import {CalendarEvent} from "../../../planningBlocks/interfaces_events/CalendarEventsObject";

// Fonction helper pour créer des événements simulés
const createMockEvent = (overrides: Partial<CalendarEvent>): CalendarEvent => {
    return {
        _id: 'default-id',
        startDate: new Date(),
        endDate: new Date(),
        type: 'default-type',
        participants: [],
        generated: false,
        ...overrides,
    };
};

describe('EventCollider', () => {
    const mockEvent1 = createMockEvent({
        _id: '1',
        startDate: new Date('2024-12-01T10:00:00'),
        endDate: new Date('2024-12-01T12:00:00'),
    });

    const mockEvent2 = createMockEvent({
        _id: '2',
        startDate: new Date('2024-12-01T11:00:00'),
        endDate: new Date('2024-12-01T13:00:00'),
    });

    const mockEvent3 = createMockEvent({
        _id: '3',
        startDate: new Date('2024-12-01T14:00:00'),
        endDate: new Date('2024-12-01T15:00:00'),
    });

    const mockEvents: CalendarEvent[] = [mockEvent1, mockEvent2, mockEvent3];



    it('should detect a collision between overlapping planningBlocks', () => {
        const collider = new EventCollider({ eventsToCollide: [mockEvent1, mockEvent2] });
        const collisions = collider['eventCollisionList'];

        expect(collisions).toHaveLength(1);
        expect(collisions[0].collide).toBe(true);
        expect(collisions[0].collision_id).toBe('1-2');
    });

    it('should not detect a collision between non-overlapping planningBlocks', () => {
        const collider = new EventCollider({ eventsToCollide: [mockEvent1, mockEvent3] });
        const collisions = collider['eventCollisionList'];

        expect(collisions).toHaveLength(0);
    });

    it('should correctly create a CollisionEvent', () => {
        const collider = new EventCollider({ eventsToCollide: [mockEvent1, mockEvent2] });
        const collision = collider.createCollisionEvent({ referenceEvent: mockEvent1, comparedEvent: mockEvent2 });

        expect(collision).toBeDefined();
        expect(collision.startDate.toISOString()).toBe('2024-12-01T11:00:00.000Z');
        expect(collision.endDate.toISOString()).toBe('2024-12-01T12:00:00.000Z');
        expect(collision.duration).toBe(60); // 1 hour in minutes
    });

    it('should handle pair exclusion correctly', () => {
        const pairExclusionSet = new Set(['1-2']);
        const colliderValid = new EventCollider({ eventsToCollide: [mockEvent1, mockEvent2], pairExclusionSet });

        const collisionsValid = colliderValid['eventCollisionList'];
        expect(collisionsValid).toHaveLength(0); // Collision should be excluded

    });

    it('should validate planningBlocks properly', () => {
        const invalidEvent = createMockEvent({
            _id: '4',
            startDate: undefined,
            endDate: undefined,
        } as Partial<CalendarEvent>);

        expect(() => {
            new EventCollider({ eventsToCollide: [invalidEvent] });
        }).toThrowError('Event with id 4 is missing required fields (startDate, endDate)');
    });

    it('should reset the cache properties correctly', () => {
        const collider = new EventCollider({ eventsToCollide: mockEvents });
        collider.resetCacheProperties();

        expect(collider['eventCollisionList']).toHaveLength(0);
        expect(collider['checkedPairs'].size).toBe(0);
    });

    it('should log messages if debug is enabled', () => {
        const consoleSpy = jest.spyOn(console, 'log');
        const collider = new EventCollider({ eventsToCollide: mockEvents }, true);

        collider.log('Debugging message');
        expect(consoleSpy).toHaveBeenCalledWith('Debugging message');
        consoleSpy.mockRestore();
    });

    it('should initialize correctly with default values', () => {
        const collider = new EventCollider({ eventsToCollide: mockEvents });
        expect(collider).toBeDefined();
    });
});

describe('checkIfPairHasBeenCompared method', () => {
    let collider: EventCollider;

    beforeEach(() => {
        // Initialisation d'un EventCollider avec des événements simulés
        collider = new EventCollider({ eventsToCollide: [] });
    });

    it('should return false and mark the pair as checked for a new pair_id', () => {
        const input = { pair_id: '1-2' };
        const result = collider.checkIfPairHasBeenCompared(input);

        expect(result).toBe(false); // Nouvelle paire
        expect(collider['checkedPairs'].has(input.pair_id)).toBe(true); // Ajoutée aux paires vérifiées
    });

    it('should return true for an already checked pair_id', () => {
        const input = { pair_id: '1-2' };
        collider.checkIfPairHasBeenCompared(input); // Première vérification
        const result = collider.checkIfPairHasBeenCompared(input); // Deuxième vérification

        expect(result).toBe(true); // Déjà vérifiée
        expect(collider.checkedPairs.has('1-2')).toBe(true);
    });

    it('should throw an error for invalid input', () => {
        expect(() => collider.checkIfPairHasBeenCompared({ pair_id: '' }))
            .toThrowError('Invalid input: pair_id is required.');

        expect(() => collider.checkIfPairHasBeenCompared({ pair_id: null as unknown as string }))
            .toThrowError('Invalid input: pair_id is required.');

        expect(() => collider.checkIfPairHasBeenCompared({ pair_id: undefined as unknown as string }))
            .toThrowError('Invalid input: pair_id is required.');
    });
});