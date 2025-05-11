import type {TUserId, TEventUnitId, TEventUnitDomainModel} from '@sh3pherd/shared-types';
import {CalendarBuilder} from "./CalendarBuilder";

const createMockEvent = (eventUnitId: TEventUnitId, participants: TUserId[]): TEventUnitDomainModel => ({
    eventUnit_id: eventUnitId,
    title: `Event ${eventUnitId}`,
    description: `Mock event ${eventUnitId}`,
    type: 'show',
    contract_id: 'contract_123',
    playlist: {
        needs: true,
        assigned: false,
        validated: false,
    },
    location: '',
    startDate: new Date('2025-05-10T10:00:00Z'),
    endDate: new Date('2025-05-10T11:00:00Z'),
    participants,
    isLocked: false,
    createdBy: 'user_admin' as TUserId,
    createdAt: new Date(),
    updatedAt: new Date(),
});

describe('CalendarBuilder - Integration', () => {
    const userAlice: TUserId = 'user_alice';
    const userBob: TUserId = 'user_bob';
    const userEve: TUserId = 'user_eve';

    const events = [
        createMockEvent('eventUnit_e1', [userAlice, userBob]),
        createMockEvent('eventUnit_e2', [userBob]),
        createMockEvent('eventUnit_e3', [userEve]), // out scope
        createMockEvent('eventUnit_e4', [userAlice]),
        createMockEvent('eventUnit_e5', []), // no participant
    ];

    it('should correctly map events and users in calendarMap and eventMap', () => {
        const builder = new CalendarBuilder();

        const { eventUnits, calendars } = builder.build({
            eventUnits: events,
            user_ids: [userAlice, userBob]
        });

        // 🧭 check size
        expect(eventUnits.size).toBe(5); // all event valid
        expect(calendars.size).toBe(2); // only alice and bob

        // 🧪 watch event projection for each user
        expect(calendars.get(userAlice)?.participatesIn.sort()).toEqual(['eventUnit_e1', 'eventUnit_e4']);
        expect(calendars.get(userBob)?.participatesIn.sort()).toEqual(['eventUnit_e1', 'eventUnit_e2']);

        // ❌ Eve must be absent
        expect(calendars.has(userEve)).toBe(false);

        // 🕳️ event without participants
        for (const [userId, { participatesIn }] of calendars.entries()) {
            expect(participatesIn.includes('eventUnit_e5')).toBe(false);
        }
    });
});
