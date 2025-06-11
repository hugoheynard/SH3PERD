import type { TUserId, TEventUnitId, TEventUnitDomainModel } from '@sh3pherd/shared-types';
import {buildCalendar} from "./buildCalendar";

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

describe('buildCalendar', () => {
    const userAlice: TUserId = 'user_alice';
    const userBob: TUserId = 'user_bob';
    const userEve: TUserId = 'user_eve';

    const events = [
        createMockEvent('eventUnit_e1', [userAlice, userBob]),
        createMockEvent('eventUnit_e2', [userBob]),
        createMockEvent('eventUnit_e3', [userEve]), // out of scope
        createMockEvent('eventUnit_e4', [userAlice]),
        createMockEvent('eventUnit_e5', []), // no participant
    ];

    it('should correctly map events and users in calendarMap and eventMap', () => {
        const { eventUnits, calendars } = buildCalendar({
            eventUnits: events,
            user_ids: [userAlice, userBob],
        });

        // ✅ Check event units preserved
        expect(eventUnits.size).toBe(5);

        // ✅ Only Alice and Bob calendars created
        expect(calendars.size).toBe(2);

        expect(calendars.get(userAlice)?.participatesIn.sort()).toEqual(['eventUnit_e1', 'eventUnit_e4']);
        expect(calendars.get(userBob)?.participatesIn.sort()).toEqual(['eventUnit_e1', 'eventUnit_e2']);

        // ❌ Eve not included
        expect(calendars.has(userEve)).toBe(false);

        // 🕳️ No one should have eventUnit_e5
        for (const { participatesIn } of calendars.values()) {
            expect(participatesIn.includes('eventUnit_e5')).toBe(false);
        }
    });
});
