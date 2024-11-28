// Mocking the EventCollider class // TODO redo Tests
import {BatchEventColliderModule} from "../eventCollision/BatchEventCollider";
import {EventCollider} from "../eventCollision/EventCollider";

jest.mock('../eventCollision/EventCollider');

// Mocking the IntervalTree class and its methods
jest.mock('../eventCollision/IntervalTree', () => {
    return {
        IntervalTree: jest.fn().mockImplementation(() => {
            return {
                queryOverlap: jest.fn().mockReturnValue([
                    { id: '2', event: { _id: '2', startDate: '2024-11-20T08:30:00Z', endDate: '2024-11-20T09:30:00Z' } },
                    { id: '3', event: { _id: '3', startDate: '2024-11-20T09:00:00Z', endDate: '2024-11-20T10:00:00Z' } }
                ])
            };
        })
    };
});

describe('BatchEventColliderModule', () => {
    let inputData: any;
    let batchEventColliderModule: BatchEventColliderModule;

    beforeEach(() => {
        inputData = {
            eventsToCollide: [
                {
                    _id: '1',
                    startDate: '2024-11-20T08:00:00Z',
                    endDate: '2024-11-20T09:00:00Z',
                    duration: 60,
                    date: '2024-11-20T08:00:00Z',
                },
                {
                    _id: '2',
                    startDate: '2024-11-20T08:30:00Z',
                    endDate: '2024-11-20T09:30:00Z',
                    duration: 60,
                    date: '2024-11-20T08:30:00Z',
                },
                {
                    _id: '3',
                    startDate: '2024-11-20T09:00:00Z',
                    endDate: '2024-11-20T10:00:00Z',
                    duration: 60,
                    date: '2024-11-20T09:00:00Z',
                }
            ],
            pairExclusionSet: new Set(['1-2'])
        };

        batchEventColliderModule = new BatchEventColliderModule(inputData, true);
    });

    it('should calculate collisions and add them to positiveCollisionList', () => {
        // Mocking EventCollider.createCollisionElement
        const mockCreateCollisionElement = jest.fn().mockReturnValue({
            collide: true,
            result: { collision_id: '1-2', collide: true }
        });
        EventCollider.createCollisionElement = mockCreateCollisionElement;

        // Call the method to calculate collisions
        batchEventColliderModule.calculateCollisions();

        // Ensure that the collision element is added
        expect(batchEventColliderModule['positiveCollisionList'].length).toBeGreaterThan(0);
        expect(EventCollider.createCollisionElement).toHaveBeenCalledTimes(1);
    });

    it('should prevent comparing the same pair twice', () => {
        const pairToCheck = '1-2';
        const resultFirstCheck = batchEventColliderModule.checkIfPairHasBeenCompared(pairToCheck);
        const resultSecondCheck = batchEventColliderModule.checkIfPairHasBeenCompared(pairToCheck);

        expect(resultFirstCheck).toBe(false); // First check, should add the pair
        expect(resultSecondCheck).toBe(true); // Second check, should not add the pair again
    });
});
