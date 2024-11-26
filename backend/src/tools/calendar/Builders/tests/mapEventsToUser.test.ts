import {mapEventsToUser} from "../mapEventsToUser";
import {CalendarEvent} from "../../../../interfaces/CalendarEvent";


describe('mapEventsToUser', () => {
    it('doit retourner les événements correspondant à un utilisateur donné', () => {
        const events: CalendarEvent[] = [
            { _id: 'event1', participants: ['user1', 'user2'] },
            { _id: 'event2', participants: ['user3'] },
            { _id: 'event3', participants: ['user1'] },
        ];

        const user_id = 'user1';

        const result = mapEventsToUser({ events, user_id });

        expect(result).toEqual(['event1', 'event3']);
    });

    it('doit retourner un tableau vide si aucun événement ne correspond à l’utilisateur', () => {
        const events: CalendarEvent[] = [
            { _id: 'event1', participants: ['user2'] },
            { _id: 'event2', participants: ['user3'] },
        ];

        const user_id = 'user1';

        const result = mapEventsToUser({ events, user_id });

        expect(result).toEqual([]); // Vérifie que le tableau est vide
    });

    it('doit gérer les données vides correctement', () => {
        const events: CalendarEvent[] = [];
        const user_id = 'user1';

        const result = mapEventsToUser({ events, user_id });

        expect(result).toEqual([]); // Vérifie que le tableau est vide
    });

    it('doit fonctionner avec des participants contenant des chaînes ou des objets convertibles en chaîne', () => {
        const events: CalendarEvent[] = [
            { _id: 'event1', participants: [123, 'user2'] },
            { _id: 'event2', participants: ['user3', 'user1'] },
        ];

        const user_id = '123';

        const result = mapEventsToUser({ events, user_id });

        expect(result).toEqual(['event1']);
    });
});